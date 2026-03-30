/**
 * sheet-webhook.js
 * Google Apps Script se call hota hai jab bhi Sheet mein naya row add hota hai.
 * Sabhi subscribers ko turant email bhejta hai.
 *
 * Trigger karo: GET /api/sheet-webhook?secret=YOUR_CRON_SECRET&jobs=5
 */

const SHEET_ID = '1X412u-aXPAzkKqwRn0PgvbjcWMaivWJx-FlyHb6LARc';
const JOBS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=0`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  // Verify secret
  const secret = req.query.secret || req.body?.secret;
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const newJobCount = parseInt(req.query.jobs || req.body?.jobs || '1', 10);
  console.log(`=== Sheet Webhook Triggered — ${newJobCount} new job(s) ===`);

  try {
    const SUPABASE_URL     = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    const RESEND_API_KEY   = process.env.RESEND_API_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !RESEND_API_KEY) {
      return res.status(500).json({ error: 'Missing env vars' });
    }

    // Fetch subscribers
    const subRes = await fetch(
      `${SUPABASE_URL}/rest/v1/job_alerts?is_active=eq.true&select=*`,
      { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    const subscribers = await subRes.json();
    if (!subscribers.length) return res.status(200).json({ message: 'No subscribers', sent: 0 });

    // Fetch latest jobs from Sheet
    const sheetRes  = await fetch(JOBS_URL);
    const sheetText = await sheetRes.text();
    const jsonText  = sheetText.substring(sheetText.indexOf('{'), sheetText.lastIndexOf(')'));
    const sheetData = JSON.parse(jsonText);
    const cols      = sheetData.table.cols.map(c => (c.label || '').trim());
    const allJobs   = sheetData.table.rows
      .map(row => { const o = {}; cols.forEach((c,i) => { o[c||`col${i}`] = row.c?.[i]?.v||''; }); return o; })
      .filter(j => j.Company || j.Role);

    // Latest N jobs = newly added ones
    const newJobs = allJobs.slice(-Math.max(newJobCount, 5)).reverse();

    // Send email to each subscriber
    let sent = 0;
    for (const sub of subscribers) {
      const skills = (sub.skills||'').toLowerCase().split(',').map(s=>s.trim()).filter(Boolean);

      const jobCards = newJobs.slice(0,8).map(job => `
        <div style="border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;margin-bottom:12px;background:white;">
          <div style="font-size:12px;font-weight:600;color:#64748b;margin-bottom:2px;">${job.Company||''}</div>
          <div style="font-size:16px;font-weight:700;color:#7C3AED;margin-bottom:8px;">${job.Role||''}</div>
          <div style="display:flex;gap:12px;font-size:12px;color:#64748b;flex-wrap:wrap;margin-bottom:12px;">
            ${job.Location?`<span>📍 ${job.Location}</span>`:''}
            ${job.Stipend ?`<span>💰 ${job.Stipend}</span>` :''}
            ${job.JobType ?`<span>💼 ${job.JobType}</span>` :''}
          </div>
          ${job.ApplyLink?`<a href="${job.ApplyLink}" style="background:#7C3AED;color:white;text-decoration:none;padding:8px 18px;border-radius:6px;font-size:13px;font-weight:600;">Apply Now →</a>`:''}
        </div>
      `).join('');

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px;background:#f8fafc;">
          <div style="background:white;border-radius:16px;padding:28px 24px;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
            <div style="text-align:center;margin-bottom:20px;">
              <h1 style="font-size:24px;font-weight:800;color:#7C3AED;margin:0 0 4px;">🚀 CarrerLift</h1>
              <p style="color:#64748b;font-size:13px;margin:0;">New jobs just added!</p>
            </div>
            <div style="background:linear-gradient(135deg,#7C3AED,#00D4FF);border-radius:10px;padding:14px 18px;margin-bottom:20px;color:white;text-align:center;">
              <div style="font-size:18px;font-weight:800;">🔥 ${newJobs.length} New Job${newJobs.length>1?'s':''} Added!</div>
              <div style="font-size:13px;opacity:0.9;margin-top:4px;">${skills.length?`Matching: ${skills.slice(0,3).join(', ')}`:'Fresh opportunities for you'}</div>
            </div>
            ${jobCards}
            <a href="https://carrerlift.in/app.html" style="display:block;text-align:center;background:linear-gradient(135deg,#7C3AED,#00D4FF);color:white;text-decoration:none;padding:14px;border-radius:10px;font-weight:700;font-size:15px;margin-top:8px;">
              View All ${allJobs.length} Jobs →
            </a>
            <p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:16px;">
              <a href="https://carrerlift.in/unsubscribe?email=${encodeURIComponent(sub.email)}" style="color:#94a3b8;">Unsubscribe</a>
            </p>
          </div>
        </div>`;

      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'CarrerLift Jobs <onboarding@resend.dev>',
          to: sub.email,
          subject: `🔥 ${newJobs.length} New Job${newJobs.length>1?'s':''} Added on CarrerLift!`,
          html
        })
      });
      if (r.ok) sent++;
      await new Promise(r => setTimeout(r, 80));
    }

    console.log(`Webhook done: ${sent}/${subscribers.length} emails sent`);
    return res.status(200).json({ success: true, sent, total: subscribers.length, newJobs: newJobs.length });

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
}
