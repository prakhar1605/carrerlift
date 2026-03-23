export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, name, skills } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    // Save to Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/job_alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        name: name || '',
        skills: skills || '',
        is_active: true
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to save subscription' });
    }

    // Send welcome email via Resend
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'CareerLift <onboarding@resend.dev>',
          to: email,
          subject: '🎉 You\'re subscribed to CareerLift Job Alerts!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #f8fafc;">
              <div style="background: white; border-radius: 16px; padding: 40px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                
                <div style="text-align: center; margin-bottom: 32px;">
                  <h1 style="font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #0A66C2, #378FE9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 8px;">CareerLift</h1>
                  <p style="color: #64748b; font-size: 14px; margin: 0;">AI-Powered Jobs & Research Platform</p>
                </div>

                <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 12px;">You're all set! 🎉</h2>
                <p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 20px;">
                  Hi ${name || 'there'},<br><br>
                  Welcome to CareerLift job alerts! You'll receive a daily email every morning at 9 AM with new job opportunities matching your skills.
                </p>

                ${skills ? `
                <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
                  <p style="font-size: 13px; font-weight: 700; color: #0369a1; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">Your Skills on Watch</p>
                  <p style="color: #0f172a; font-size: 14px; margin: 0;">${skills}</p>
                </div>
                ` : ''}

                <div style="background: #f8fafc; border-radius: 10px; padding: 20px; margin-bottom: 28px;">
                  <p style="font-size: 13px; font-weight: 700; color: #64748b; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">What to expect</p>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; gap: 10px; align-items: flex-start;">
                      <span style="color: #10b981; font-size: 16px;">✓</span>
                      <span style="color: #475569; font-size: 14px;">Daily alerts every morning at 9 AM</span>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: flex-start;">
                      <span style="color: #10b981; font-size: 16px;">✓</span>
                      <span style="color: #475569; font-size: 14px;">Only new jobs added that day</span>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: flex-start;">
                      <span style="color: #10b981; font-size: 16px;">✓</span>
                      <span style="color: #475569; font-size: 14px;">Matched to your specific skills</span>
                    </div>
                  </div>
                </div>

                <a href="https://carrerlift.in" style="display: block; text-align: center; background: linear-gradient(135deg, #0A66C2, #378FE9); color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; margin-bottom: 24px;">Browse Jobs Now →</a>

                <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
                  Don't want alerts? <a href="https://carrerlift.in/unsubscribe?email=${encodeURIComponent(email)}" style="color: #0A66C2;">Unsubscribe here</a>
                </p>
              </div>
            </div>
          `
        })
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Subscribed successfully! Check your email for confirmation.' 
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
}
