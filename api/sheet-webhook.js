/**
 * api/sheet-webhook.js
 * Google Apps Script se trigger hota hai jab bhi Google Sheet mein
 * naya job add hota hai. Subscribers ko turant email bhejta hai.
 *
 * Trigger karne ka tarika:
 * Google Sheet → Extensions → Apps Script → paste karo neeche wala code
 */

const SHEET_ID = '1X412u-aXPAzkKqwRn0PgvbjcWMaivWJx-FlyHb6LARc';
const JOBS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=0`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  // Verify secret so only your Apps Script can trigger this
  const secret = req.headers['x-webhook-secret'] || req.query.secret;
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('=== Sheet Webhook Triggered ===', new Date().toISOString());

  try {
    const SUPABASE_URL     = process.env.SUPABASE_URL;
    const SUPABASE_KEY     = process.env.SUPABASE_ANON_KEY;
    const RESEND_API_KEY   = process.env.RESEND_API_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY || !RESEND_API_KEY) {
      return res.status(500).json({ error: 'Missing env vars' });
    }

    // 1. Get new jobs passed from Apps Script (or fetch latest from sheet)
    const newJobsFromScript = req.body?.newJobs || [];
    let newJobs = newJobsFromScript;

    // Fallback: fetch last 5 jobs from sheet if Apps Script didn't send them
    if (!newJobs.length) {
      const sheetRes  = await fetch(JOBS_URL);
      const sheetText = await sheetRes.text();
      const jsonText  = sheetText.substring(sheetText.indexOf('{'), sheetText.lastIndexOf(')'));
      const sheetData = JSON.parse(jsonText);
      const cols      = sheetData.table.cols.map(c => (c.label || '').trim());
      const allJobs   = sheetData.table.rows
        .map(row => {
          const obj = {};
          cols.forEach((col, i) => { obj[col || `col${i}`] = row.c?.[i]?.v || ''; });
          return obj;
        })
        .filter(j => j.Company || j.Role);
      newJobs = allJobs.slice(-5).reverse(); // last 5 jobs
    }

    if (!newJobs.length) {
      return res.status(200).json({ message: 'No new jobs to send' });
    }

    console.log(`Sending alerts for ${newJobs.length} new job(s)`);

    // 2. Fetch active subscribers
    const subRes      = await fetch(`${SUPABASE_URL}/rest/v1/job_alerts?is_active=eq.true&select=*`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const subscribers = await subRes.json();

    if (!subscribers.length) {
      return res.status(200).json({ message: 'No subscribers', sent: 0 });
    }

    // 3. Build job cards HTML
    const jobCardsHtml = newJobs.map(job => `
      <div style="border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;margin-bottom:12px;background:white;">
        <div style="font-size:12px;font-weight:600;color:#64748b;margin-bottom:2px;">${job.Company || ''}</div>
        <div style="font-size:16px;font-weight:700;color:#0A66C2;margin-bottom:8px;">${job.Role || ''}</div>
        <div style="display:flex;gap:12px;font-size:13px;color:#64748b;margin-bottom:12px;flex-wrap:wrap;">
          ${job.Location ? `<span>📍 ${job.Location}</span>` : ''}
          ${job.Stipend  ? `<span>💰 ${job.Stipend}</span>`  : ''}
          ${job.JobType  ? `<span>💼 ${job.JobType}</span>`  : ''}
        </div>
        ${job.ApplyLink ? `<a href="${job.ApplyLink}" style="display:inline-block;background:#0A66C2;color:white;text-decoration:none;padding:8px 18px;border-radius:6px;font-size:13px;font-weight:600;">Apply Now →</a>` : ''}
      </div>`).join('');

    // 4. Send emails
    let sent = 0;
    for (const sub of subscribers) {
      const emailHtml = `
        <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;padding:24px 16px;background:#f8fafc;">
          <div style="text-align:center;margin-bottom:20px;">
            <h1 style="font-size:24px;font-weight:800;color:#0A66C2;margin:0 0 4px;">CareerLift</h1>
            <p style="color:#64748b;font-size:13px;margin:0;">🔔 New Job Alert!</p>
          </div>
          <div style="background:white;border-radius:16px;padding:28px 24px;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
            <div style="background:linear-gradient(135deg,#00D4FF,#0099cc);border-radius:10px;padding:14px 18px;margin-bottom:20px;color:#080B14;">
              <div style="font-size:17px;font-weight:800;">🚀 ${newJobs.length} New Job${newJobs.length > 1 ? 's' : ''} Just Added!</div>
              <div style="font-size:13px;opacity:0.8;margin-top:3px;">Fresh on CareerLift right now</div>
            </div>
            ${jobCardsHtml}
            <a href="https://carrerlift.in/app.html" style="display:block;text-align:center;background:linear-gradient(135deg,#0A66C2,#378FE9);color:white;text-decoration:none;padding:13px;border-radius:10px;font-weight:700;font-size:14px;margin-top:8px;">
              Browse All Jobs →
            </a>
          </div>
          <p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:16px;">
            <a href="https://carrerlift.in" style="color:#0A66C2;text-decoration:none;">CareerLift</a> ·
            <a href="https://carrerlift.in/unsubscribe?email=${encodeURIComponent(sub.email)}" style="color:#94a3b8;">Unsubscribe</a>
          </p>
        </div>`;

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'CareerLift <onboarding@resend.dev>',
          to: sub.email,
          subject: `🚀 ${newJobs.length} New Job${newJobs.length > 1 ? 's' : ''} on CareerLift!`,
          html: emailHtml
        })
      });

      if (emailRes.ok) { sent++; console.log(`✓ ${sub.email}`); }
      await new Promise(r => setTimeout(r, 80)); // rate limit
    }

    return res.status(200).json({ success: true, sent, total: subscribers.length, jobs: newJobs.length });

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
}
