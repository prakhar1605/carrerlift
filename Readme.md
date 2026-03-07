<div align="center">

<img src="logo.png" alt="CareerLift Logo" width="80" />

# CareerLift 🚀

### AI-Powered Jobs & Research Platform for Students

[![Live Site](https://img.shields.io/badge/🌐_Live_Site-carrerlift.in-4F46E5?style=for-the-badge)](https://www.carrerlift.in)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
![HTML](https://img.shields.io/badge/HTML-82%25-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-18%25-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

**Connecting students with top companies and 1500+ IIT professors — powered by AI.**

[View Demo](https://www.carrerlift.in) · [Report Bug](https://github.com/prakhar1605/Naukri-Chakri/issues) · [Request Feature](https://github.com/prakhar1605/Naukri-Chakri/issues)

</div>

---

## 📸 Preview

> CareerLift helps students find jobs, research internships, and cold-email professors — all with AI doing the heavy lifting.

---

## ✨ Features

### 🎯 AI-Powered Job Matching
Upload your resume (PDF/DOC/TXT) or paste it as text, and the AI instantly scans all available listings to surface your **best-fit opportunities** — ranked by relevance, not just keywords.

### 🔬 Research Internship Finder
Access a database of **1500+ IIT professors** across departments. Upload your resume and the AI matches you with professors whose research aligns with your skills and interests.

### 📊 Skill Gap Analyzer
Enter a company and role — the AI compares your resume against the job requirements and gives you a **match percentage**, highlights skills you already have, skills you're missing, and a personalized **learning roadmap**.

### ✉️ AI Job Application Email Generator
Generate a polished cold email to HR/recruiters in seconds. Customize the tone (Professional, Enthusiastic, or Short & Direct) and get a ready-to-send draft with one click.

### 🧪 AI Cold Email for Professors
Generate hyper-personalized outreach emails to IIT professors. Just enter the professor's name, department, your project background, and why you want to work with them — the AI handles the rest.

### 🔔 Daily Job Alerts
Subscribe once and receive a **daily 9 AM email** with new job listings matching your profile. Free forever, no spam.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend / API** | Vercel Serverless Functions (Node.js) |
| **AI** | Claude API (Anthropic) |
| **Database** | Google Sheets (via API) |
| **Hosting** | Vercel |
| **Domain** | carrerlift.in |

---

## 📁 Project Structure

```
Naukri-Chakri/
├── index.html          # Main single-page application
├── vercel.json         # Vercel deployment config & routing rules
├── api/                # Serverless API functions
│   ├── analyze.js      # Resume analysis & AI job matching
│   ├── research.js     # Professor matching logic
│   ├── email.js        # Cold email generator
│   └── ...             # Other API endpoints
└── logo.png            # CareerLift brand logo
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Vercel CLI](https://vercel.com/docs/cli) — `npm i -g vercel`
- An [Anthropic API key](https://console.anthropic.com/)
- A Google Sheet set up as your jobs/professors database

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/prakhar1605/Naukri-Chakri.git
   cd Naukri-Chakri
   ```

2. **Set up environment variables**

   Create a `.env` file in the root:
   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key
   SHEET_ID=your_google_sheet_id
   ```

3. **Run locally with Vercel Dev**
   ```bash
   vercel dev
   ```
   The app will be available at `http://localhost:3000`

### Deploying to Vercel

```bash
vercel --prod
```

Or connect your GitHub repo to Vercel for **automatic deployments** on every push to `main`.

---

## 🔑 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `ANTHROPIC_API_KEY` | Your Claude API key from Anthropic Console | ✅ |
| `GOOGLE_SHEETS_API_KEY` | Google Sheets API key for DB access | ✅ |
| `SHEET_ID` | ID of your Google Sheet (jobs database) | ✅ |
| `PROFESSORS_SHEET_ID` | ID of your professors Google Sheet | ✅ |

> ⚠️ **Never commit your `.env` file.** Add it to `.gitignore`.

---

## 🗺️ Roadmap

- [x] AI resume-based job matching
- [x] IIT professor research matching (1500+ professors)
- [x] Skill gap analyzer
- [x] AI cold email generator (jobs + research)
- [x] Daily job alert subscriptions
- [ ] User authentication (save jobs, track applications)
- [ ] Migrate from Google Sheets → Supabase
- [ ] Application status tracker (Applied / Interview / Offer)
- [ ] Resume builder powered by AI
- [ ] Company review & salary insights
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are what make the open source community great. Any contributions are **much appreciated**.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🐛 Found a Bug?

Open an [issue](https://github.com/prakhar1605/Naukri-Chakri/issues) with:
- A clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

## 👤 Author

**Prakhar**

[![GitHub](https://img.shields.io/badge/GitHub-prakhar1605-181717?style=flat&logo=github)](https://github.com/prakhar1605)

---

<div align="center">

Made with ❤️ for students, by a student.

⭐ **Star this repo if CareerLift helped you!** ⭐

</div>
