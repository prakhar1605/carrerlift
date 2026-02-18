export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { resumeText, items, type } = req.body;
    if (!resumeText || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'resumeText and items required' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    // ── Keyword Fallback (fast, always works) ────────────────────────────────
    function keywordScore(resumeText, jobText) {
      const stop = new Set(['the','and','for','with','that','this','from','your','have','will','they','been','were','also']);
      const resumeWords = new Set(
        resumeText.toLowerCase().match(/\b[a-z0-9+#.]{3,}\b/g)?.filter(w => !stop.has(w)) || []
      );
      const jobWords = (jobText.toLowerCase().match(/\b[a-z0-9+#.]{3,}\b/g) || []).filter(w => !stop.has(w));
      if (jobWords.length === 0) return 0;
      const matches = jobWords.filter(w => resumeWords.has(w)).length;
      return Math.min(95, Math.round((matches / Math.min(jobWords.length, 40)) * 100));
    }

    // ── Try OpenRouter AI Matching (top 20 only, to save tokens) ────────────
    if (apiKey) {
      try {
        // Pehle keyword se saare score karo
        const keywordScores = {};
        items.forEach(item => {
          keywordScores[item.id] = keywordScore(resumeText, item.text);
        });

        // Top 20 items lo AI ke liye (baaki keyword se hi)
        const top20 = [...items]
          .sort((a, b) => keywordScores[b.id] - keywordScores[a.id])
          .slice(0, 20);

        const itemsList = top20.map((item, i) => `${i + 1}. ID: "${item.id}" | ${item.text.slice(0, 150)}`).join('\n');

        const prompt = `Resume summary:
${resumeText.slice(0, 600)}

Rate how well this resume matches each ${type === 'professors' ? 'professor research area' : 'job'} from 0-100.
Only give high scores (70+) if there is STRONG relevance.

Items:
${itemsList}

Respond ONLY with JSON like: {"scores": {"id1": 85, "id2": 42, ...}}
No markdown, no explanation.`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://carrerlift.in',
            'X-Title': 'CareerLift Matcher'
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.3-70b-instruct:free',
            messages: [
              { role: 'system', content: 'You are a resume matcher. Respond only with valid JSON.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.1,
            max_tokens: 800
          })
        });

        if (response.ok) {
          const aiData = await response.json();
          const content = aiData.choices?.[0]?.message?.content || '';
          const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const parsed = JSON.parse(cleaned);
          const aiScores = parsed.scores || {};

          // Merge: AI scores for top20, keyword scores for rest
          const finalScores = { ...keywordScores };
          Object.entries(aiScores).forEach(([id, score]) => {
            finalScores[id] = score;
          });

          return res.status(200).json({ success: true, scores: finalScores, method: 'ai+keyword' });
        }
      } catch (aiError) {
        console.error('AI matching failed, using keyword fallback:', aiError.message);
      }
    }

    // ── Pure Keyword Fallback ─────────────────────────────────────────────────
    const scores = {};
    items.forEach(item => { scores[item.id] = keywordScore(resumeText, item.text); });
    return res.status(200).json({ success: true, scores, method: 'keyword' });

  } catch (error) {
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
}
