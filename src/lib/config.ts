export const SHEET_ID       = '1X412u-aXPAzkKqwRn0PgvbjcWMaivWJx-FlyHb6LARc';
export const SHEET_URLS = {
  jobs:       `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=0`,
  professors: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=1254290790`,
  hrCsv:      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=1900335835`,
} as const;

export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDE9OpF9wSpUppgGsnOLx4oO2bxz88MfAg',
  authDomain: 'carrerlift-46528.firebaseapp.com',
  projectId: 'carrerlift-46528',
  storageBucket: 'carrerlift-46528.firebasestorage.app',
  messagingSenderId: '230640648721',
  appId: '1:230640648721:web:abb0c6d9691d1c91f3a7b0',
} as const;

export const GITHUB_URLS = {
  intern_intl : 'https://raw.githubusercontent.com/speedyapply/2026-AI-College-Jobs/main/INTERN_INTL.md',
  newgrad_intl: 'https://raw.githubusercontent.com/speedyapply/2026-AI-College-Jobs/main/NEW_GRAD_INTL.md',
  intern_usa  : 'https://raw.githubusercontent.com/speedyapply/2026-AI-College-Jobs/main/README.md',
  newgrad_usa : 'https://raw.githubusercontent.com/speedyapply/2026-AI-College-Jobs/main/NEW_GRAD_USA.md',
} as const;
