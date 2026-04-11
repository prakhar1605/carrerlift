/**
 * agent.js — Career Coach Agent
 * Multi-turn conversational agent with resume + jobs context awareness.
 * Uses OpenRouter GPT-4o-mini via a structured system prompt.
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, resumeText, jobContext } = req.body;

    if (!messages || !Array.isArray(messages))
      return res.status(400).json({ error: 'messages array required' });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey)
      return res.status(500).json({ error: 'API key not configured' });

    const systemPrompt = `You are CareerLift's AI Career Coach — an intelligent agentic assistant that helps students find jobs and research internships.

You have access to the following context:

${resumeText ? `== USER RESUME ==\n${resumeText.slice(0, 2000)}\n` : '== RESUME: Not uploaded yet =='}

${jobContext ? `== AVAILABLE JOBS (sample) ==\n${jobContext.slice(0, 1500)}\n` : ''}

== YOUR CAPABILITIES ==
You can help with:
1. Analyzing resume strengths and weaknesses
2. Recommending best-fit jobs from the platform
3. Suggesting which professors to email for research
4. Writing cold emails and cover letters
5. Career roadmap and skill-building advice
6. Interview preparation tips
7. Explaining skill gaps for specific roles

== AGENT BEHAVIOR ==
- Be concise, actionable, and warm
- If resume is not uploaded, gently encourage user to upload it
- Use bullet points for lists
- Always end with a follow-up question or next action
- If asked to write an email, write it completely
- Max 200 words per response unless writing an email/cover letter`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://carrerlift.in',
        'X-Title': 'CareerLift Career Coach Agent',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-10), // last 10 messages for context window
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: 'AI error', details: err.slice(0, 200) });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply)
      return res.status(500).json({ error: 'Empty AI response' });

    return res.status(200).json({ reply, success: true });

  } catch (error) {
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
}
