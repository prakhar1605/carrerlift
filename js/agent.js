/**
 * agent.js — Career Coach Agent (Frontend)
 * Floating chat widget with multi-turn conversation.
 * Shares resume context from main.js via window.agentContext.
 */

/* ── State ── */
let chatHistory    = [];
let isAgentOpen    = false;
let isAgentTyping  = false;

/* ── DOM refs (created dynamically) ── */
let agentPanel, agentMessages, agentInput, agentSendBtn;

/* ─────────────────────────────────────────────
   BUILD UI
───────────────────────────────────────────── */
export function initCareerAgent() {
  injectStyles();
  buildFAB();
  buildPanel();
  addSuggestedPrompts();
}

function buildFAB() {
  const fab = document.createElement('button');
  fab.id        = 'agentFAB';
  fab.className = 'agent-fab';
  fab.innerHTML = `
    <div class="agent-fab-icon"><i class="fas fa-robot"></i></div>
    <div class="agent-fab-label">AI Career Coach</div>
    <div class="agent-fab-dot"></div>`;
  fab.addEventListener('click', toggleAgent);
  document.body.appendChild(fab);
}

function buildPanel() {
  agentPanel = document.createElement('div');
  agentPanel.id        = 'agentPanel';
  agentPanel.className = 'agent-panel';
  agentPanel.innerHTML = `
    <div class="agent-header">
      <div class="agent-header-left">
        <div class="agent-avatar"><i class="fas fa-robot"></i></div>
        <div>
          <div class="agent-name">AI Career Coach</div>
          <div class="agent-status"><span class="agent-online-dot"></span>Online · Powered by GPT-4o</div>
        </div>
      </div>
      <button class="agent-close-btn" id="agentCloseBtn"><i class="fas fa-times"></i></button>
    </div>

    <div class="agent-pipeline">
      <div class="pipeline-label">ACTIVE AGENTS</div>
      <div class="pipeline-steps">
        <div class="pipeline-step active" data-agent="resume">
          <i class="fas fa-file-alt"></i><span>Resume<br>Parser</span>
        </div>
        <div class="pipeline-arrow">→</div>
        <div class="pipeline-step active" data-agent="skills">
          <i class="fas fa-brain"></i><span>Skills<br>Extractor</span>
        </div>
        <div class="pipeline-arrow">→</div>
        <div class="pipeline-step active" data-agent="matcher">
          <i class="fas fa-crosshairs"></i><span>Job<br>Matcher</span>
        </div>
        <div class="pipeline-arrow">→</div>
        <div class="pipeline-step active" data-agent="coach">
          <i class="fas fa-comments"></i><span>Career<br>Coach</span>
        </div>
      </div>
    </div>

    <div class="agent-messages" id="agentMessages">
      <div class="agent-msg agent">
        <div class="agent-msg-avatar"><i class="fas fa-robot"></i></div>
        <div class="agent-msg-bubble">
          👋 Hi! I'm your AI Career Coach. I can help you find the best jobs, write cold emails, analyze skill gaps, and plan your career path.<br><br>
          ${window.agentContext?.resumeText
            ? '✅ I can see your resume! Ask me anything.'
            : '📎 <strong>Upload your resume first</strong> for personalized advice, or just ask me anything!'}
        </div>
      </div>
    </div>

    <div class="agent-suggestions" id="agentSuggestions"></div>

    <div class="agent-input-row">
      <input type="text" id="agentInput" class="agent-input" placeholder="Ask me anything about your career…" />
      <button id="agentSendBtn" class="agent-send-btn"><i class="fas fa-paper-plane"></i></button>
    </div>`;

  document.body.appendChild(agentPanel);

  agentMessages = document.getElementById('agentMessages');
  agentInput    = document.getElementById('agentInput');
  agentSendBtn  = document.getElementById('agentSendBtn');

  document.getElementById('agentCloseBtn').addEventListener('click', toggleAgent);
  agentSendBtn.addEventListener('click', sendMessage);
  agentInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });
}

function addSuggestedPrompts() {
  const suggestions = [
    '🎯 Which jobs match me best?',
    '📧 Write a cold email for a professor',
    '🧠 What skills should I learn?',
    '📄 Review my resume',
  ];
  const el = document.getElementById('agentSuggestions');
  if (!el) return;
  el.innerHTML = suggestions.map(s =>
    `<button class="agent-chip" onclick="window.agentSendQuick('${s}')">${s}</button>`
  ).join('');
}

window.agentSendQuick = (text) => {
  if (agentInput) { agentInput.value = text; sendMessage(); }
};

/* ─────────────────────────────────────────────
   TOGGLE
───────────────────────────────────────────── */
function toggleAgent() {
  isAgentOpen = !isAgentOpen;
  agentPanel.classList.toggle('open', isAgentOpen);
  document.getElementById('agentFAB').classList.toggle('open', isAgentOpen);
  if (isAgentOpen) agentInput?.focus();
}

export function openCareerAgent() {
  isAgentOpen = false;
  toggleAgent();
}

/* ─────────────────────────────────────────────
   SEND MESSAGE
───────────────────────────────────────────── */
async function sendMessage() {
  const text = agentInput?.value.trim();
  if (!text || isAgentTyping) return;

  // Hide suggestions after first message
  const suggestions = document.getElementById('agentSuggestions');
  if (suggestions) suggestions.style.display = 'none';

  appendMsg('user', text);
  chatHistory.push({ role: 'user', content: text });
  agentInput.value = '';
  showTyping();

  try {
    const res = await fetch('/api/agent', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        messages  : chatHistory,
        resumeText: window.agentContext?.resumeText || '',
        jobContext : window.agentContext?.jobContext  || '',
      }),
    });

    const data = await res.json();
    hideTyping();

    if (data.reply) {
      chatHistory.push({ role: 'assistant', content: data.reply });
      appendMsg('agent', data.reply);
    } else {
      appendMsg('agent', '⚠️ Sorry, I ran into an issue. Please try again!');
    }
  } catch {
    hideTyping();
    appendMsg('agent', '⚠️ Connection error. Please check your internet.');
  }
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function appendMsg(role, text) {
  const isAgent = role === 'agent';
  const div = document.createElement('div');
  div.className = `agent-msg ${role}`;

  // Convert markdown-like **bold** and newlines
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');

  div.innerHTML = isAgent
    ? `<div class="agent-msg-avatar"><i class="fas fa-robot"></i></div>
       <div class="agent-msg-bubble">${formatted}</div>`
    : `<div class="agent-msg-bubble user-bubble">${formatted}</div>`;

  agentMessages.appendChild(div);
  agentMessages.scrollTop = agentMessages.scrollHeight;
}

function showTyping() {
  isAgentTyping = true;
  agentSendBtn.disabled = true;
  const div = document.createElement('div');
  div.className = 'agent-msg agent';
  div.id        = 'agentTyping';
  div.innerHTML = `
    <div class="agent-msg-avatar"><i class="fas fa-robot"></i></div>
    <div class="agent-msg-bubble">
      <div class="typing-dots"><span></span><span></span><span></span></div>
    </div>`;
  agentMessages.appendChild(div);
  agentMessages.scrollTop = agentMessages.scrollHeight;
}

function hideTyping() {
  isAgentTyping = false;
  agentSendBtn.disabled = false;
  document.getElementById('agentTyping')?.remove();
}

/* ─────────────────────────────────────────────
   STYLES (injected dynamically)
───────────────────────────────────────────── */
function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
/* ── FAB ── */
.agent-fab {
  position: fixed; bottom: 28px; right: 28px; z-index: 9000;
  background: linear-gradient(135deg, #00D4FF, #7C3AED);
  border: none; border-radius: 100px; cursor: pointer;
  display: flex; align-items: center; gap: 10px;
  padding: 13px 20px 13px 16px;
  box-shadow: 0 8px 32px rgba(0,212,255,0.35);
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  color: #080B14;
}
.agent-fab:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,212,255,0.5); }
.agent-fab.open  { opacity: 0; pointer-events: none; transform: scale(0.8); }
.agent-fab-icon  { font-size: 18px; }
.agent-fab-label { font-family: 'DM Sans',sans-serif; font-size: 14px; font-weight: 700; white-space:nowrap; }
.agent-fab-dot   {
  position: absolute; top: 8px; right: 8px;
  width: 9px; height: 9px; border-radius: 50%;
  background: #10B981; border: 2px solid #080B14;
  animation: pulse2 2s infinite;
}

/* ── PANEL ── */
.agent-panel {
  position: fixed; bottom: 28px; right: 28px; z-index: 9001;
  width: 380px; height: 620px;
  background: #0D1117; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px; display: flex; flex-direction: column;
  box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 60px rgba(0,212,255,0.08);
  transform: translateY(20px) scale(0.95); opacity: 0; pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  overflow: hidden;
}
.agent-panel.open { transform: translateY(0) scale(1); opacity: 1; pointer-events: all; }

/* ── HEADER ── */
.agent-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 18px; border-bottom: 1px solid rgba(255,255,255,0.08);
  background: linear-gradient(135deg,rgba(0,212,255,0.06),rgba(124,58,237,0.06));
  flex-shrink: 0;
}
.agent-header-left { display: flex; align-items: center; gap: 12px; }
.agent-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  background: linear-gradient(135deg,#00D4FF,#7C3AED);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; color: #080B14; flex-shrink:0;
}
.agent-name   { font-family:'Sora',sans-serif; font-size:14px; font-weight:700; color:#F1F5F9; }
.agent-status { font-size:11px; color:#64748B; display:flex; align-items:center; gap:5px; margin-top:2px; }
.agent-online-dot {
  width:7px; height:7px; border-radius:50%; background:#10B981;
  box-shadow:0 0 6px rgba(16,185,129,0.8);
}
.agent-close-btn {
  background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);
  border-radius:8px; width:30px; height:30px;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; color:#94A3B8; font-size:13px; transition:all 0.2s;
}
.agent-close-btn:hover { background:rgba(239,68,68,0.15); color:#FCA5A5; }

/* ── PIPELINE ── */
.agent-pipeline {
  padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(0,0,0,0.2); flex-shrink:0;
}
.pipeline-label {
  font-size:9px; font-weight:800; letter-spacing:1px;
  color:#475569; margin-bottom:8px; text-transform:uppercase;
}
.pipeline-steps { display:flex; align-items:center; gap:4px; }
.pipeline-step {
  display:flex; flex-direction:column; align-items:center; gap:3px;
  padding:6px 8px; border-radius:8px; flex:1; text-align:center;
  border:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.02);
  font-size:9px; color:#475569; transition:all 0.3s;
}
.pipeline-step i { font-size:12px; }
.pipeline-step.active {
  border-color:rgba(0,212,255,0.25); background:rgba(0,212,255,0.06);
  color:#00D4FF;
}
.pipeline-arrow { color:#334155; font-size:12px; flex-shrink:0; }

/* ── MESSAGES ── */
.agent-messages {
  flex:1; overflow-y:auto; padding:14px 14px 8px;
  display:flex; flex-direction:column; gap:12px;
  scrollbar-width:thin; scrollbar-color:rgba(255,255,255,0.1) transparent;
}
.agent-msg { display:flex; align-items:flex-end; gap:8px; }
.agent-msg.user { flex-direction:row-reverse; }
.agent-msg-avatar {
  width:28px; height:28px; border-radius:50%; flex-shrink:0;
  background:linear-gradient(135deg,#00D4FF,#7C3AED);
  display:flex; align-items:center; justify-content:center;
  font-size:12px; color:#080B14;
}
.agent-msg-bubble {
  max-width:78%; background:rgba(255,255,255,0.06);
  border:1px solid rgba(255,255,255,0.08); border-radius:16px 16px 16px 4px;
  padding:10px 14px; font-size:13px; line-height:1.7; color:#CBD5E1;
}
.user-bubble {
  background:linear-gradient(135deg,rgba(0,212,255,0.15),rgba(124,58,237,0.15));
  border-color:rgba(0,212,255,0.2); color:#F1F5F9;
  border-radius:16px 16px 4px 16px;
}

/* ── TYPING DOTS ── */
.typing-dots { display:flex; gap:4px; align-items:center; padding:2px 0; }
.typing-dots span {
  width:7px; height:7px; border-radius:50%;
  background:#00D4FF; opacity:0.4;
  animation:typingBounce 1.2s ease-in-out infinite;
}
.typing-dots span:nth-child(2) { animation-delay:0.2s; }
.typing-dots span:nth-child(3) { animation-delay:0.4s; }
@keyframes typingBounce { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-6px);opacity:1} }

/* ── SUGGESTIONS ── */
.agent-suggestions {
  display:flex; gap:6px; flex-wrap:wrap; padding:6px 14px;
  flex-shrink:0;
}
.agent-chip {
  background:rgba(0,212,255,0.08); border:1px solid rgba(0,212,255,0.2);
  color:#94A3B8; padding:5px 10px; border-radius:100px;
  font-family:'DM Sans',sans-serif; font-size:11px; font-weight:600;
  cursor:pointer; transition:all 0.2s; white-space:nowrap;
}
.agent-chip:hover { background:rgba(0,212,255,0.16); color:#00D4FF; }

/* ── INPUT ── */
.agent-input-row {
  display:flex; gap:8px; padding:12px 14px;
  border-top:1px solid rgba(255,255,255,0.06); flex-shrink:0;
}
.agent-input {
  flex:1; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);
  border-radius:12px; padding:10px 14px; color:#F1F5F9;
  font-family:'DM Sans',sans-serif; font-size:13px;
}
.agent-input:focus { outline:none; border-color:#00D4FF; background:rgba(0,212,255,0.06); }
.agent-input::placeholder { color:#475569; }
.agent-send-btn {
  background:linear-gradient(135deg,#00D4FF,#7C3AED); border:none;
  border-radius:12px; width:40px; height:40px; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  color:#080B14; font-size:15px; transition:all 0.2s; flex-shrink:0;
}
.agent-send-btn:hover:not(:disabled) { transform:scale(1.08); }
.agent-send-btn:disabled { opacity:0.5; cursor:not-allowed; }

/* ── MOBILE ── */
@media(max-width:480px){
  .agent-panel { width:calc(100vw - 20px); right:10px; bottom:10px; height:75vh; }
  .agent-fab   { bottom:18px; right:18px; }
}`;
  document.head.appendChild(style);
}
