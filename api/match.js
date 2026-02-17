/**
 * /api/match.js
 * 
 * Real semantic resume-job matching using:
 * - Hugging Face free embedding API (sentence-transformers/all-MiniLM-L6-v2)
 * - Cosine similarity for actual semantic matching
 * 
 * Resume pe likh sakte ho:
 * "Semantic resume-job matching using sentence embeddings (all-MiniLM-L6-v2) 
 *  and cosine similarity via Hugging Face Inference API"
 */

const HF_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
const HF_API_URL = `https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_MODEL}`;

// ─── Cosine Similarity ───────────────────────────────────────────────────────
// Ye actual ML hai — do vectors ke beech angle measure karta hai
// 1.0 = same meaning, 0.0 = completely different
function cosineSimilarity(vecA, vecB) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot   += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ─── Get Embeddings from HuggingFace ────────────────────────────────────────
// Free tier: ~1000 req/day, no credit card needed
async function getEmbeddings(texts, hfKey) {
  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hfKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: texts,
      options: { wait_for_model: true }  // first call pe model load hoga
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HuggingFace API error ${response.status}: ${err.slice(0, 200)}`);
  }

  return await response.json(); // array of embedding vectors
}

// ─── Fallback: Keyword Matching ──────────────────────────────────────────────
// Agar HF API fail ho toh ye use hoga (old approach)
function keywordFallbackScore(resumeText, jobText) {
  const stopWords = new Set(['the','and','for','with','that','this','from','your','their','have','will','they','been','were','what','when','where','also','make','made','include']);
  const resumeWords = new Set(
    resumeText.toLowerCase().match(/\b[a-z0-9+#.]{3,}\b/g)?.filter(w => !stopWords.has(w)) || []
  );
  const jobWords = (jobText.toLowerCase().match(/\b[a-z0-9+#.]{3,}\b/g) || [])
    .filter(w => !stopWords.has(w));
  
  if (jobWords.length === 0) return 0;
  const matches = jobWords.filter(w => resumeWords.has(w)).length;
  return Math.min(100, Math.round((matches / Math.min(jobWords.length, 50)) * 100));
}

// ─── Main Handler ────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { resumeText, items, type } = req.body;
    // items = array of { id, text } — jobs ya professors
    // type = 'jobs' | 'professors'

    if (!resumeText || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'resumeText and items array required' });
    }

    const hfKey = process.env.HF_API_KEY;

    // ── Path 1: Real Semantic Matching (HuggingFace) ──────────────────────────
    if (hfKey) {
      try {
        // Resume ka ek concise summary banao (tokens save karne ke liye)
        const resumeSummary = resumeText.slice(0, 800);

        // Saare texts ek saath embed karo (batch — efficient hai)
        const allTexts = [resumeSummary, ...items.map(item => item.text.slice(0, 300))];
        const embeddings = await getEmbeddings(allTexts, hfKey);

        const resumeEmbedding = embeddings[0];  // pehla = resume
        const itemEmbeddings = embeddings.slice(1);  // baaki = jobs/professors

        // Har item ke liye cosine similarity calculate karo
        const scores = {};
        items.forEach((item, idx) => {
          const similarity = cosineSimilarity(resumeEmbedding, itemEmbeddings[idx]);
          // 0-1 range ko 0-100 percentage mein convert karo
          // Threshold: 0.3 se upar hi match count hoga (noise filter)
          scores[item.id] = similarity >= 0.3
            ? Math.round(similarity * 100)
            : 0;
        });

        return res.status(200).json({
          success: true,
          scores,
          method: 'semantic',  // frontend pe dikh sakta hai
          model: HF_MODEL
        });

      } catch (hfError) {
        // HF fail hua toh fallback pe chale jao — site band nahi hogi
        console.error('HuggingFace failed, using keyword fallback:', hfError.message);
      }
    }

    // ── Path 2: Keyword Fallback (agar HF key nahi ya HF fail hua) ───────────
    const scores = {};
    items.forEach(item => {
      scores[item.id] = keywordFallbackScore(resumeText, item.text);
    });

    return res.status(200).json({
      success: true,
      scores,
      method: 'keyword',  // frontend jaanta hai semantic nahi hua
    });

  } catch (error) {
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
}
