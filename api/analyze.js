export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { resume } = req.body;

    if (!resume || typeof resume !== 'string' || resume.trim().length < 10) {
      return res.status(400).json({ error: 'Valid resume text is required' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://carrerlift.in',
        'X-Title': 'CareerLift Resume Analyzer'
      },
      body: JSON.stringify({
        // ✅ Free model — gpt-4o-mini paid tha
       model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are an expert career advisor. Analyze resumes concisely and professionally.'
          },
          {
            role: 'user',
            content: `Analyze this resume and provide:

1. KEY SKILLS: Main technical and soft skills
2. EXPERIENCE LEVEL: Junior/Mid/Senior and domain  
3. TOP JOB ROLES: 3-5 best-fit positions
4. RECOMMENDATIONS: Brief career advice

Resume:
${resume.slice(0, 3500)}

Keep response clear and under 300 words.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      return res.status(openRouterResponse.status).json({
        error: 'AI service error',
        message: `OpenRouter returned ${openRouterResponse.status}`,
        details: errorText.substring(0, 200)
      });
    }

    const aiData = await openRouterResponse.json();
    const aiMessage = aiData.choices?.[0]?.message?.content;

    if (!aiMessage) return res.status(500).json({ error: 'No response from AI' });

    return res.status(200).json({
      result: aiMessage.trim(),
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
}
