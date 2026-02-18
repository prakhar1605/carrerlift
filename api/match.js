export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { resumeText, items } = req.body;
    if (!resumeText || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const stop = new Set(['the','and','for','with','that','this','from','your','have','will','they','been','were','also','make','made','using','work']);
    
    const resumeWords = new Set(
      resumeText.toLowerCase().match(/\b[a-z0-9+#.]{3,}\b/g)?.filter(w => !stop.has(w)) || []
    );

    const scores = {};
    items.forEach(item => {
      const jobWords = (item.text.toLowerCase().match(/\b[a-z0-9+#.]{3,}\b/g) || []).filter(w => !stop.has(w));
      if (jobWords.length === 0) { scores[item.id] = 0; return; }
      const matches = jobWords.filter(w => resumeWords.has(w)).length;
      scores[item.id] = Math.min(95, Math.round((matches / Math.min(jobWords.length, 40)) * 100));
    });

    return res.status(200).json({ success: true, scores, method: 'keyword' });

  } catch (error) {
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
}
