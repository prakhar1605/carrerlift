<div align="center">

<img src="logo.png" alt="Carrerlift Logo" width="80" height="80" style="border-radius:16px" />

# 🚀 Carrerlift

### India's #1 AI-Powered Career Platform for Students

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-carrerlift.in-00D4FF?style=for-the-badge)](https://carrerlift.in)
[![License](https://img.shields.io/badge/License-MIT-7C3AED?style=for-the-badge)](LICENSE)
[![Made in India](https://img.shields.io/badge/Made_in-India_🇮🇳-F59E0B?style=for-the-badge)]()
[![Students](https://img.shields.io/badge/Users-1000+-10B981?style=for-the-badge)]()

*Upload your resume → AI matches you with the best jobs & IIT professors → Apply in one click*

</div>

---

## ✨ What is Carrerlift?

Carrerlift is an AI-powered job portal built specifically for Indian students. Instead of manually browsing hundreds of listings, you upload your resume once and our AI instantly matches you with the most relevant:

- 💼 **843+ active internships & jobs** across India
- 🏛️ **1,583 IIT professor profiles** for research opportunities  
- 👥 **1,837 HR contacts** with direct recruiter access

**No middlemen. No spam. Just AI doing the heavy lifting.**

---

## 🎯 Key Features

| Feature | Description |
|--------|-------------|
| 🤖 **AI Resume Analyzer** | Upload PDF/DOCX → AI extracts skills & matches you to jobs (95% accuracy) |
| 🔬 **Research Matching** | Get matched with IIT professors based on your research interests |
| ✉️ **AI Email Generator** | One-click cold emails for HR & professors in 3 tones |
| 📊 **Skill Gap Analyzer** | See what skills you're missing + a personalized learning roadmap |
| 🔖 **Save Jobs** | Bookmark jobs — saved locally, always accessible |
| 🤖 **AI Career Coach** | Chat with an AI agent for career advice (powered by your resume context) |
| 🔔 **Job Alerts** | Subscribe to email alerts when new matching jobs are added |
| 🔗 **Deep Links** | Share any job with a unique URL (`carrerlift.in/app.html?job=role-company`) |
| 🔐 **Google Sign-In** | One-click auth via Firebase — no passwords |
| ⏱️ **10-Min Free Trial** | Try everything without signing up |

---

## 🖥️ Screenshots

| Landing Page | Job Portal | AI Match |
|---|---|---|
| Hero with social proof | Live job listings | 95% match scores |

> 📸 *Live at [carrerlift.in](https://carrerlift.in)*

---

## 🛠️ Tech Stack

```
Frontend         → Vanilla HTML, CSS, JavaScript (ES Modules)
Auth             → Firebase Authentication (Google Sign-In)
Database/Data    → Google Sheets (via gviz JSON + CSV API)
AI Backend       → OpenRouter API (LLM for resume analysis & email gen)
Deployment       → Vercel (auto-deploy on git push)
Email Alerts     → Resend API + Vercel Cron Jobs
```

**No frameworks. No npm install. Pure fast web.** The entire frontend is ~15 JS modules + CSS files.

---

## 📁 Project Structure

```
carrerlift/
├── index.html              ← Landing page (hero, social proof, features)
├── app.html                ← Main job portal (tabs: Jobs, Research, HR)
├── logo.png                ← App logo
│
├── styles/
│   ├── variables.css       ← Design tokens (colors, fonts, shadows)
│   ├── landing.css         ← Landing page styles
│   ├── layout.css          ← App header, tabs, grid, search
│   ├── cards.css           ← Job/professor/HR card styles
│   ├── modals.css          ← All modal dialogs
│   ├── auth.css            ← Auth modal, trial bar, expired popup
│   └── app.css             ← App-specific layout + mobile responsive
│
├── js/
│   ├── config.js           ← Google Sheet IDs + API endpoints
│   ├── firebase.js         ← Firebase Auth (Google Sign-In)
│   ├── auth.js             ← Landing page auth UI controller
│   ├── trialManager.js     ← 10-minute free trial logic
│   ├── dataLoader.js       ← Fetches & parses Google Sheets data
│   ├── resumeParser.js     ← PDF/DOCX text extraction (PDF.js)
│   ├── jobMatcher.js       ← Keyword scoring & match algorithm
│   ├── renderer.js         ← Renders job/professor/HR cards
│   ├── emailGenerator.js   ← AI cold email modal logic
│   ├── skillGap.js         ← Skill gap analyzer UI
│   ├── alerts.js           ← Job alert subscription
│   ├── agent.js            ← AI Career Coach floating widget
│   ├── ui.js               ← Toast, typewriter, thinking animations
│   └── main.js             ← App entry point — init + event wiring
│
└── api/                    ← Vercel Serverless Functions
    ├── analyze.js          ← POST /api/analyze (resume AI analysis)
    ├── skillgap.js         ← POST /api/skillgap (skill gap AI)
    ├── subscribe.js        ← POST /api/subscribe (job alerts)
    ├── agent.js            ← POST /api/agent (career coach chat)
    └── cron-alerts.js      ← Cron job — daily email alerts
```

---

## ⚡ Getting Started (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [Vercel CLI](https://vercel.com/cli) (`npm i -g vercel`)
- A Google Sheets document with job data (see config.js)
- Firebase project with Google Auth enabled
- OpenRouter API key

### 1. Clone the repo
```bash
git clone https://github.com/your-username/carrerlift.git
cd carrerlift
```

### 2. Set up environment variables
Create a `.env` file in the root:
```env
OPENROUTER_API_KEY=your_openrouter_key
RESEND_API_KEY=your_resend_key
CRON_SECRET=any_random_string
```

### 3. Run locally
```bash
vercel dev
```
Open [http://localhost:3000](http://localhost:3000)

> **Note:** The API routes (`/api/*`) only work via `vercel dev` — not with a plain file server.

### 4. Deploy
```bash
git add -A
git commit -m "your changes"
git push
```
Vercel auto-deploys on every push to `main`. That's it. ✅

---

## 🔧 Configuration

### Adding Jobs / Professors / HR Contacts
All data is pulled from **Google Sheets**. Update the Sheet IDs in `js/config.js`:

```js
export const SHEET_ID       = 'your-google-sheet-id';
export const JOBS_GID       = '0';           // Sheet tab GID for jobs
export const PROFESSORS_GID = '1254290790';  // Sheet tab GID for professors
export const HR_GID         = '1900335835';  // Sheet tab GID for HR contacts
```

Make the Google Sheet **publicly readable** (Anyone with link → Viewer).

### Firebase Setup
1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Google Sign-In** under Authentication → Sign-in method
3. Add your domain to **Authorized domains** (Authentication → Settings)
4. Update `js/firebase.js` with your config keys

---

## 🔐 Security Notes

- **Firebase API Key in frontend is safe** — this is Firebase's intended design. The key only identifies your project; it does not grant admin access. Real security comes from Firebase Auth rules and authorized domain restrictions.
- **Restrict authorized domains** in Firebase Console → Authentication → Settings → Authorized domains (add only `carrerlift.in`)
- **API keys** (OpenRouter, Resend) are stored as Vercel environment variables — never in frontend code

---

## 🗺️ Roadmap

- [ ] Saved jobs sync to Firebase (currently localStorage only)
- [ ] User dashboard — application tracker
- [ ] Resume storage (upload once, access everywhere)
- [ ] More job sources beyond Google Sheets
- [ ] College-specific job filters
- [ ] WhatsApp bot integration

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repo
2. Create your branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📬 Contact

Built with ❤️ for Indian students.

- 🌐 Website: [carrerlift.in](https://carrerlift.in)
- 📧 Email: hello@carrerlift.in
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/carrerlift/issues)

---

<div align="center">

**If this helped you, please ⭐ star the repo — it helps other students find it!**

Made in India 🇮🇳 · MIT License

</div>
