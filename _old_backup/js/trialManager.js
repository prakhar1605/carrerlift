/**
 * trialManager.js — 10-minute free trial logic
 * Stores trial start time in localStorage.
 * On app.html, call initTrial() — it will show a soft popup when time is up.
 */

const TRIAL_KEY      = 'cl_trial_start';
const TRIAL_DURATION = 10 * 60 * 1000; // 10 minutes in ms

export function startTrial() {
  if (!localStorage.getItem(TRIAL_KEY)) {
    localStorage.setItem(TRIAL_KEY, Date.now().toString());
  }
}

export function getTrialTimeLeft() {
  const start = parseInt(localStorage.getItem(TRIAL_KEY) || '0', 10);
  if (!start) return 0;
  const elapsed = Date.now() - start;
  return Math.max(0, TRIAL_DURATION - elapsed);
}

export function isTrialActive() {
  return getTrialTimeLeft() > 0;
}

export function isTrialStarted() {
  return !!localStorage.getItem(TRIAL_KEY);
}

export function clearTrial() {
  localStorage.removeItem(TRIAL_KEY);
}
