export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { resume, jobTitle, jobDescription, jobCompany } = req.body;

    if (!resume || !jobTitle) {
      return res.status(400).json({ error: 'Resume and job details are required' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

    const prompt = `You are an expert career coach. Analyze the skill gap between this resume and job.

RESUME:
${resume.slice(0, 2500)}

JOB:
Title: ${jobTitle}
Company: ${jobCompany || 'Company'}
Description: ${jobDescription ? jobDescription.slice(0, 800) : 'No description provided'}

Respond ONLY with this exact JSON (no markdown, no extra text):
{
  "overallScore": 72,
  "verdict": "Strong Match",
  "matchedSkills": [
    {"skill": "Python", "proficiency": 85, "evidence": "Multiple projects mentioned"},
    {"skill": "FastAPI", "proficiency": 80, "evidence": "Used in internship"}
  ],
  "missingSkills": [
    {"skill": "Kubernetes", "importance": "High", "reason": "Required for deployment"},
    {"skill": "System Design", "importance": "Medium", "reason": "Senior-level requirement"}
  ],
  "roadmap": [
    {
      "month": "Month 1",
      "focus": "Kubernetes Basics",
      "tasks": ["Complete Kubernetes official tutorial", "Deploy one project on K8s"],
      "resources": [
        {"title": "Kubernetes Crash Course", "url": "https://www.youtube.com/results?search_query=kubernetes+crash+course", "type": "YouTube"},
        {"title": "Kubernetes for Beginners", "url": "https://www.coursera.org/search?query=kubernetes", "type": "Coursera"}
      ]
    }
  ],
  "timeToReady": "2-3 months",
  "quickTip": "Your RAG and LangChain experience is a big plus. Focus on deployment skills."
}

Base analysis on ACTUAL resume content. Max 3 months roadmap.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://carrerlift.in',
        'X-Title': 'CareerLift Skill Gap Analyzer'
      },
      body: JSON.stringify({
        // ✅ Free model
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are a skill gap analyzer. Always respond with valid JSON only. No markdown, no extra text, no explanation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1200
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: 'AI service error', details: errorText.substring(0, 200) });
    }

    const aiData = await response.json();
    const aiMessage = aiData.choices?.[0]?.message?.content;
    if (!aiMessage) return res.status(500).json({ error: 'No response from AI' });

    let analysis;
    try {
      const cleaned = aiMessage.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleaned);
    } catch (parseError) {
      return res.status(500).json({ error: 'Failed to parse AI response', raw: aiMessage.substring(0, 300) });
    }

    return res.status(200).json({ success: true, analysis });

  } catch (error) {
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
}
