// This runs every day at 9 AM IST (3:30 AM UTC)
// Vercel Cron Job - configured in vercel.json

const SHEET_ID = '1X412u-aXPAzkKqwRn0PgvbjcWMaivWJx-FlyHb6LARc';
const JOBS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=0`;

export default async function handler(req, res) {
  // Security: Only allow Vercel Cron or manual trigger with secret
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('=== CareerLift Job Alert Cron Started ===');
  console.log('Time:', new Date().toISOString());

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !RESEND_API_KEY) {
      return res.status(500).json({ error: 'Missing environment variables' });
    }

    // Step 1: Fetch all active subscribers
    const subscribersRes = await fetch(
      `${SUPABASE_URL}/rest/v1/job_alerts?is_active=eq.true&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );

    const subscribers = await subscribersRes.json();
    console.log(`Found ${subscribers.length} active subscribers`);

    if (!subscribers.length) {
      return res.status(200).json({ message: 'No subscribers found', sent: 0 });
    }

    // Step 2: Fetch jobs from Google Sheet
    const sheetRes = await fetch(JOBS_URL);
    const sheetText = await sheetRes.text();
    const jsonText = sheetText.substring(sheetText.indexOf('{'), sheetText.lastIndexOf(')'));
    const sheetData = JSON.parse(jsonText);
    
    const cols = sheetData.table.cols.map(c => (c.label || '').trim());
    const allJobs = sheetData.table.rows
      .map(row => {
        const obj = {};
        cols.forEach((col, i) => {
          obj[col || `col${i}`] = row.c?.[i]?.v || '';
        });
        return obj;
      })
      .filter(job => job.Company || job.Role);

    console.log(`Fetched ${allJobs.length} total jobs`);

    // Step 3: Get today's new jobs (last 25 = newest, since sheet adds at bottom)
    const newJobs = allJobs.slice(-25).reverse(); // Latest 25 jobs
    console.log(`New jobs to alert: ${newJobs.length}`);

    if (!newJobs.length) {
      return res.status(200).json({ message: 'No new jobs today', sent: 0 });
    }

    // Step 4: Send email to each subscriber
    let sentCount = 0;
    let errorCount = 0;

    for (const subscriber of subscribers) {
      try {
        // Match jobs to subscriber skills
        const userSkills = (subscriber.skills || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
        
        let matchedJobs = newJobs;
        
        // If user has skills, filter/sort by relevance
        if (userSkills.length > 0) {
          const scored = newJobs.map(job => {
            const jobText = `${job.Company} ${job.Role} ${job.Description || ''}`.toLowerCase();
            const score = userSkills.filter(skill => jobText.includes(skill)).length;
            return { job, score };
          });
          
          // Sort by match score, take all (even 0 score - they get all jobs)
          scored.sort((a, b) => b.score - a.score);
          matchedJobs = scored.map(s => s.job);
        }

        // Limit to top 10 jobs per email
        const topJobs = matchedJobs.slice(0, 10);

        // Build email HTML
        const jobCards = topJobs.map((job, i) => `
          <div style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; margin-bottom: 12px; background: white;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <div>
                <div style="font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 2px;">${job.Company || 'Company'}</div>
                <div style="font-size: 16px; font-weight: 700; color: #0A66C2;">${job.Role || 'Position'}</div>
              </div>
              ${i < 5 ? '<span style="background: linear-gradient(135deg, #f97316, #ef4444); color: white; padding: 3px 10px; border-radius: 100px; font-size: 10px; font-weight: 800; text-transform: uppercase;">NEW</span>' : ''}
            </div>
            <div style="display: flex; gap: 16px; font-size: 13px; color: #64748b; margin-bottom: 12px; flex-wrap: wrap;">
              ${job.Location ? `<span>📍 ${job.Location}</span>` : ''}
              ${job.Stipend ? `<span>💰 ${job.Stipend}</span>` : ''}
              ${job.JobType ? `<span>💼 ${job.JobType}</span>` : ''}
            </div>
            ${job.ApplyLink ? `<a href="${job.ApplyLink}" style="display: inline-block; background: #0A66C2; color: white; text-decoration: none; padding: 8px 20px; border-radius: 6px; font-size: 13px; font-weight: 600;">Apply Now →</a>` : ''}
          </div>
        `).join('');

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px 16px; background: #f8fafc;">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="font-size: 26px; font-weight: 800; color: #0A66C2; margin: 0 0 4px;">CareerLift</h1>
              <p style="color: #64748b; font-size: 14px; margin: 0;">Your Daily Job Alert - ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <!-- Main Card -->
            <div style="background: white; border-radius: 16px; padding: 28px 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); margin-bottom: 16px;">
              
              <div style="background: linear-gradient(135deg, #0A66C2, #378FE9); border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; color: white;">
                <div style="font-size: 18px; font-weight: 800; margin-bottom: 4px;">🔥 ${topJobs.length} New Jobs Today!</div>
                <div style="font-size: 13px; opacity: 0.9;">
                  ${userSkills.length > 0 ? `Matched to your skills: ${userSkills.slice(0,3).join(', ')}` : 'Latest opportunities on CareerLift'}
                </div>
              </div>

              ${jobCards}

              <a href="https://carrerlift.in" style="display: block; text-align: center; background: linear-gradient(135deg, #0A66C2, #378FE9); color: white; text-decoration: none; padding: 14px; border-radius: 10px; font-weight: 700; font-size: 15px; margin-top: 8px;">
                View All ${allJobs.length} Jobs on CareerLift →
              </a>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding: 0 16px;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px;">
                You're receiving this because you subscribed to CareerLift job alerts.
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                <a href="https://carrerlift.in" style="color: #0A66C2; text-decoration: none;">Visit CareerLift</a> · 
                <a href="https://carrerlift.in/unsubscribe?email=${encodeURIComponent(subscriber.email)}" style="color: #94a3b8;">Unsubscribe</a>
              </p>
            </div>

          </div>
        `;

        // Send email via Resend
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'CareerLift Jobs <onboarding@resend.dev>',
            to: subscriber.email,
            subject: `🔥 ${topJobs.length} New Jobs Today - CareerLift Alert`,
            html: emailHtml
          })
        });

        if (emailRes.ok) {
          sentCount++;
          console.log(`✓ Email sent to ${subscriber.email}`);
          
          // Update last_alerted_at in Supabase
          await fetch(
            `${SUPABASE_URL}/rest/v1/job_alerts?email=eq.${encodeURIComponent(subscriber.email)}`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
              },
              body: JSON.stringify({ last_alerted_at: new Date().toISOString() })
            }
          );
        } else {
          errorCount++;
          console.error(`✗ Failed for ${subscriber.email}:`, await emailRes.text());
        }

        // Small delay between emails to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (err) {
        errorCount++;
        console.error(`Error for subscriber ${subscriber.email}:`, err.message);
      }
    }

    console.log(`=== Cron Done: ${sentCount} sent, ${errorCount} failed ===`);

    return res.status(200).json({
      success: true,
      message: `Alerts sent successfully`,
      stats: {
        totalSubscribers: subscribers.length,
        emailsSent: sentCount,
        errors: errorCount,
        newJobs: newJobs.length
      }
    });

  } catch (error) {
    console.error('Cron error:', error);
    return res.status(500).json({ error: 'Cron failed', message: error.message });
  }
}
