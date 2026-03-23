/**
 * jobMatcher.js
 * Keyword extraction and relevance scoring logic.
 * Pure functions — no DOM access, fully testable.
 */

const STOP_WORDS = new Set([
  'which','that','with','this','from','your','about','their','have','will',
  'they','would','there','these','those','been','were','what','when','where',
  'working','worked','work','using','used','also','make','made',
  'include','includes',
]);

/**
 * Extract the top N keywords (single words + multi-word phrases) from text.
 * @param {string} text
 * @param {number} [topN=50]
 * @returns {string[]}
 */
export function extractKeywords(text, topN = 50) {
  if (!text) return [];

  const freq = {};

  // Multi-word proper-noun phrases (e.g. "Machine Learning", "React Native")
  const phrases = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}\b/g) || [];
  phrases.forEach(phrase => {
    const lower = phrase.toLowerCase();
    if (!STOP_WORDS.has(lower)) freq[lower] = (freq[lower] || 0) + 3;
  });

  // Individual tokens
  const words = text.toLowerCase().match(/\b[a-zA-Z0-9+#.+-]{3,}\b/g) || [];
  words.forEach(w => {
    if (!STOP_WORDS.has(w)) freq[w] = (freq[w] || 0) + 1;
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(x => x[0]);
}

/**
 * Score a single item against a list of keywords.
 * Higher score = better keyword match.
 *
 * @param {Object}   item         - Job or professor object
 * @param {string[]} keywords     - Keyword list from extractKeywords()
 * @param {string[]} searchFields - Which fields of `item` to search in
 * @returns {number}
 */
export function scoreItem(item, keywords, searchFields) {
  if (!keywords || keywords.length === 0) return 0;

  const haystack = searchFields.map(field => item[field] || '').join(' ').toLowerCase();
  let score = 0;

  keywords.forEach(keyword => {
    // Full keyword match in any field
    if (haystack.includes(keyword)) score += 2;

    // Partial phrase match (all parts present but maybe not consecutive)
    const parts = keyword.split(/\s+/);
    if (parts.length > 1 && parts.every(p => haystack.includes(p))) score += 1;
  });

  // Bonus: keyword appears in the primary/title field
  const primaryField = searchFields[0];
  if (primaryField && item[primaryField]) {
    const titleText = item[primaryField].toLowerCase();
    keywords.forEach(keyword => {
      if (titleText.includes(keyword)) score += 1;
    });
  }

  return score;
}

/**
 * Build a matchScores map from a dataset.
 * @param {Object[]} items        - Array of job or professor objects
 * @param {string[]} keywords     - Keywords to score against
 * @param {string[]} searchFields - Fields to search within each item
 * @param {Function} keyFn        - Derives the map key from an item
 * @param {number}   [scaleFactor=8] - Multiplier to convert raw score → percentage
 * @returns {Object} key → percentage score
 */
export function buildMatchScores(items, keywords, searchFields, keyFn, scaleFactor = 8) {
  const scores = {};
  items.forEach(item => {
    const raw = scoreItem(item, keywords, searchFields);
    if (raw > 0) {
      scores[keyFn(item)] = Math.min(100, raw * scaleFactor);
    }
  });
  return scores;
}
