# CareerLift — Local Development

## Environment Variables

Vercel par ye variables set hain. Locally test karne ke liye ek `.env` file banao:

```
OPENROUTER_API_KEY=your_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_key
CRON_SECRET=your_cron_secret
```

## Local Testing (Vercel CLI)

API routes (jo `api/` folder mein hain) sirf Vercel environment mein chalte hain.
Locally test karne ka sabse aasaan tarika:

```bash
# 1. Vercel CLI install karo (ek baar)
npm install -g vercel

# 2. Project root mein `.env` file banao (upar wale variables se)

# 3. Dev server start karo
vercel dev
```

`vercel dev` automatically `.env` file read karta hai aur API routes bhi serve karta hai.
Browser mein kholo: http://localhost:3000

## Project Structure

```
carrerlift/
├── index.html          ← Frontend entry point
├── styles/             ← CSS modules
│   ├── variables.css   ← Design tokens
│   ├── layout.css      ← Header, tabs, grid
│   ├── cards.css       ← Job/professor cards
│   └── modals.css      ← All modals
├── js/                 ← JavaScript modules
│   ├── config.js       ← Sheet IDs, API endpoints
│   ├── dataLoader.js   ← Google Sheets fetch
│   ├── resumeParser.js ← PDF text extraction
│   ├── jobMatcher.js   ← Keyword scoring
│   ├── renderer.js     ← Card rendering
│   ├── emailGenerator.js ← Email modals
│   ├── skillGap.js     ← Skill gap analyzer
│   ├── alerts.js       ← Job alert subscription
│   ├── ui.js           ← Toast, typewriter, animations
│   └── main.js         ← App init + event wiring
└── api/                ← Vercel serverless functions
    ├── analyze.js      ← Resume AI analysis
    ├── skillgap.js     ← Skill gap AI analysis
    ├── subscribe.js    ← Job alert subscription
    └── cron-alerts.js  ← Daily email cron
```
