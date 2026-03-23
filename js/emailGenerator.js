/**
 * emailGenerator.js
 * Handles two email-generation modals:
 *   1. Research cold email  → #emailModal
 *   2. Job application email → #jobEmailModal
 *
 * Both call /api/analyze with a prompt and render the result.
 */

import { API_ENDPOINTS } from './config.js';
import { showStatus } from './ui.js';

/* ─────────────────────────────────────────────
   RESEARCH COLD EMAIL MODAL
───────────────────────────────────────────── */

let currentProfData = null;

/** Open the research cold-email modal for a given professor. */
export function openEmailModal(profData) {
  currentProfData = profData;
  document.getElementById('emailProfName').textContent = profData.name || 'Professor';
  document.getElementById('emailProfDept').textContent = profData.dept || 'Department';
  document.getElementById('emailProfInst').textContent = profData.inst || 'Institution';
  document.getElementById('generatedEmailBox').classList.remove('active');
  const btn = document.getElementById('generateEmailBtn');
  btn.innerHTML = '<i class="fas fa-magic"></i> Generate Personalized Email';
  btn.disabled  = false;
  document.getElementById('emailModal').classList.add('active');
}

/** Generate a cold email for a professor using the AI API. */
export async function generateColdEmail() {
  const studentName    = document.getElementById('studentName').value.trim();
  const studentCourse  = document.getElementById('studentCourse').value.trim();
  const studentProject = document.getElementById('studentProject').value.trim();
  const studentReason  = document.getElementById('studentReason').value.trim();

  if (!studentName || !studentCourse)  { showStatus('Please enter your name and course details', 'error'); return; }
  if (!studentProject)                 { showStatus('Please describe your project or research', 'error'); return; }

  const btn = document.getElementById('generateEmailBtn');
  btn.innerHTML = '<span class="loading"></span> Generating...';
  btn.disabled  = true;

  const prompt = buildResearchEmailPrompt({ studentName, studentCourse, studentProject, studentReason });

  try {
    const emailText = await callGenerateEmail(prompt);
    displayGeneratedEmail({
      emailText,
      textElId     : 'generatedEmailText',
      boxId        : 'generatedEmailBox',
      sendBtnId    : 'sendEmailBtn',
      toEmail      : currentProfData.email,
    });
    showStatus('Email generated successfully!', 'success');
  } catch {
    // Fallback template
    const fallback = buildResearchEmailFallback({ studentName, studentCourse, studentProject, studentReason });
    displayGeneratedEmail({
      emailText    : fallback,
      textElId     : 'generatedEmailText',
      boxId        : 'generatedEmailBox',
      sendBtnId    : 'sendEmailBtn',
      toEmail      : currentProfData.email,
    });
    showStatus('Email template generated!', 'success');
  } finally {
    btn.innerHTML = '<i class="fas fa-magic"></i> Generate Personalized Email';
    btn.disabled  = false;
  }
}

/* ─────────────────────────────────────────────
   JOB APPLICATION EMAIL MODAL
───────────────────────────────────────────── */

let currentJobEmailData = null;

/** Open the job application email modal for a given job. */
export function openJobEmailModal(jobData) {
  currentJobEmailData = jobData;
  document.getElementById('jobEmailRole').textContent     = jobData.role     || 'Role';
  document.getElementById('jobEmailCompany').textContent  = jobData.company  || 'Company';
  document.getElementById('jobEmailLocation').textContent = jobData.location || '';
  document.getElementById('generatedJobEmailBox').classList.remove('active');
  const btn = document.getElementById('generateJobEmailBtn');
  btn.innerHTML = '<i class="fas fa-magic"></i> Generate Application Email';
  btn.disabled  = false;
  document.getElementById('jobEmailModal').classList.add('active');
}

/** Generate a job application email using the AI API. */
export async function generateJobEmail() {
  const studentName   = document.getElementById('jobStudentName').value.trim();
  const studentCourse = document.getElementById('jobStudentCourse').value.trim();
  const studentExp    = document.getElementById('jobStudentProject').value.trim();
  const tone          = document.getElementById('jobEmailTone').value;

  if (!studentName || !studentCourse) { showStatus('Please enter your name and course details', 'error'); return; }
  if (!studentExp)                    { showStatus('Please describe your relevant experience', 'error'); return; }

  const btn = document.getElementById('generateJobEmailBtn');
  btn.innerHTML = '<span class="loading"></span> Generating...';
  btn.disabled  = true;

  const prompt = buildJobEmailPrompt({ studentName, studentCourse, studentExp, tone });

  try {
    const emailText = await callGenerateEmail(prompt);
    const lines     = emailText.split('\n');
    const subject   = lines[0].replace('Subject: ', '').trim();
    const body      = lines.slice(2).join('\n');

    displayGeneratedEmail({
      emailText,
      textElId  : 'generatedJobEmailText',
      boxId     : 'generatedJobEmailBox',
      sendBtnId : 'sendJobEmailBtn',
      toEmail   : currentJobEmailData.email,
      subject,
      body,
    });
    showStatus('Email generated!', 'success');
  } catch {
    const fallback = buildJobEmailFallback({ studentName, studentCourse, studentExp });
    displayGeneratedEmail({
      emailText : fallback,
      textElId  : 'generatedJobEmailText',
      boxId     : 'generatedJobEmailBox',
      sendBtnId : 'sendJobEmailBtn',
      toEmail   : currentJobEmailData.email,
    });
    showStatus('Email template generated!', 'success');
  } finally {
    btn.innerHTML = '<i class="fas fa-magic"></i> Generate Application Email';
    btn.disabled  = false;
  }
}

/* ─────────────────────────────────────────────
   SHARED HELPERS (private)
───────────────────────────────────────────── */

async function callGenerateEmail(prompt) {
  const res = await fetch(API_ENDPOINTS.analyze, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ resume: prompt }),
  });
  if (!res.ok) throw new Error('API error');
  const data = await res.json();
  if (!data.result) throw new Error('Empty response');
  return data.result;
}

function displayGeneratedEmail({ emailText, textElId, boxId, sendBtnId, toEmail, subject, body }) {
  document.getElementById(textElId).textContent = emailText;
  document.getElementById(boxId).classList.add('active');

  const sendBtn = document.getElementById(sendBtnId);
  if (toEmail) {
    const sub  = subject || emailText.split('\n')[0].replace('Subject: ', '');
    const bod  = body    || emailText.split('\n').slice(2).join('\n');
    sendBtn.href  = `mailto:${toEmail}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(bod)}`;
    sendBtn.style.display = 'flex';
  } else {
    sendBtn.style.display = 'none';
  }
}

function buildResearchEmailPrompt({ studentName, studentCourse, studentProject, studentReason }) {
  return `You are an expert academic email writer. Generate a highly personalized, professional cold email from a student to a professor requesting a research internship.

PROFESSOR DETAILS:
- Name: ${currentProfData.name}
- Department: ${currentProfData.dept}
- Institution: ${currentProfData.inst}
- Research Areas: ${currentProfData.research}

STUDENT DETAILS:
- Name: ${studentName}
- Course: ${studentCourse}
- Their Project/Research: ${studentProject}
- Why this professor: ${studentReason || 'Based on the professor research areas'}

REQUIREMENTS:
1. Start with "Subject: Research Internship Inquiry - [specific research area]"
2. Then blank line
3. Then "Dear Prof. [Last Name],"
4. Reference SPECIFIC research areas
5. Connect student's project to professor's research
6. Keep it concise (200-250 words max)
7. Professional but warm tone
8. Clear call-to-action
9. Sign off with student's full name and course

Write ONLY the email. No explanations.`;
}

function buildResearchEmailFallback({ studentName, studentCourse, studentProject, studentReason }) {
  const profLastName  = (currentProfData.name || '').split(' ').pop();
  const researchAreas = (currentProfData.research || '').split(',').slice(0, 2).join(' and ');
  return `Subject: Research Internship Inquiry - ${researchAreas || currentProfData.dept}

Dear Prof. ${profLastName},

I hope this email finds you well. I am ${studentName}, a ${studentCourse}, writing to express my strong interest in pursuing a research internship under your guidance.

I came across your research on ${researchAreas || 'your research areas'} and found it deeply fascinating.${studentReason ? ' ' + studentReason + '.' : ''}

${studentProject ? `In my recent work, ${studentProject} This experience has given me hands-on expertise that aligns well with your research focus.` : ''}

I am eager to contribute to your research group and learn from your expertise. I would be grateful for the opportunity to discuss how my background could support your ongoing work.

Thank you for your time and consideration.

Warm regards,
${studentName}
${studentCourse}`;
}

function buildJobEmailPrompt({ studentName, studentCourse, studentExp, tone }) {
  const toneMap = {
    professional : 'professional, confident, and formal',
    enthusiastic : 'enthusiastic, energetic, and passionate',
    concise      : 'short, direct, and to-the-point (max 150 words body)',
  };
  return `You are an expert job application email writer. Generate a highly personalized cold email from a student to HR/Recruiter for a job opening.

JOB DETAILS:
- Role: ${currentJobEmailData.role}
- Company: ${currentJobEmailData.company}
- Location: ${currentJobEmailData.location || 'Not specified'}
- Description: ${(currentJobEmailData.description || '').slice(0, 600)}

STUDENT DETAILS:
- Name: ${studentName}
- Course: ${studentCourse}
- Experience/Background: ${studentExp}

TONE: ${toneMap[tone] || 'professional'}

REQUIREMENTS:
1. Start with: Subject: Application for [Role] - [Student Name]
2. Then blank line
3. Email body starting with "Dear Hiring Team," or "Dear [Company] Recruiter,"
4. Mention specific aspects of the company/role
5. Connect student's experience directly to job requirements
6. Keep body under 200 words
7. Strong, specific call-to-action at end
8. Sign off professionally

Write ONLY the email. No explanations.`;
}

function buildJobEmailFallback({ studentName, studentCourse, studentExp }) {
  return `Subject: Application for ${currentJobEmailData.role} - ${studentName}

Dear Hiring Team at ${currentJobEmailData.company},

I hope this email finds you well. I am ${studentName}, a ${studentCourse}, writing to express my strong interest in the ${currentJobEmailData.role} position at ${currentJobEmailData.company}.

${studentExp}

I am confident that my background aligns well with the requirements for this role. I would love the opportunity to contribute to ${currentJobEmailData.company}'s growth and learn from your team.

I have attached my resume for your consideration. I would be grateful for a brief call to discuss how I can add value to your team.

Thank you for your time and consideration.

Best regards,
${studentName}
${studentCourse}`;
}

/* ── Copy button handler (shared) ── */
export function handleCopyEmail(textElId, copyBtnId) {
  const text = document.getElementById(textElId).textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById(copyBtnId);
    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i> Copy'; btn.classList.remove('copied'); }, 2000);
  });
}
