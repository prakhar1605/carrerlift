/**
 * resumeParser.js
 * Handles all resume input: PDF extraction and plain-text paste.
 * Fires a custom 'resumeReady' event on the document when text is available.
 */

/* PDF.js worker is set globally in index.html before this module loads */

/**
 * Extract plain text from a PDF File object using PDF.js.
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function extractTextFromPDF(file) {
  if (typeof pdfjsLib === 'undefined') {
    throw new Error('PDF.js not loaded — cannot read PDF files.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf         = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText      = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page        = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map(item => item.str).join(' ') + ' ';
  }

  return fullText.trim();
}

/**
 * Read a plain-text or .doc file as a string.
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function readTextFile(file) {
  return file.text();
}

/**
 * Resolve the correct reader based on file type.
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function extractResumeText(file) {
  const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  return isPDF ? extractTextFromPDF(file) : readTextFile(file);
}
