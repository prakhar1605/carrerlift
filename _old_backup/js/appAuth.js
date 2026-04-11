/**
 * appAuth.js — runs on app.html
 * - If user is signed in: full access
 * - If trial is active: show countdown bar, show soft popup when expired
 * - If no trial and no auth: redirect to landing
 */

import { onAuthChange } from './firebase.js';
import {
  isTrialStarted, getTrialTimeLeft, isTrialActive, clearTrial
} from './trialManager.js';

let trialInterval = null;

function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function showTrialBar(timeLeftMs) {
  const bar = document.getElementById('trialBar');
  const timerEl = document.getElementById('trialTimer');
  if (!bar || !timerEl) return;
  bar.style.display = 'flex';
  timerEl.textContent = formatTime(timeLeftMs);
}

function hideTrialBar() {
  const bar = document.getElementById('trialBar');
  if (bar) bar.style.display = 'none';
}

function showTrialExpiredPopup() {
  hideTrialBar();
  const popup = document.getElementById('trialExpiredModal');
  if (popup) popup.classList.add('active');
}

function startTrialCountdown() {
  trialInterval = setInterval(() => {
    const left = getTrialTimeLeft();
    const timerEl = document.getElementById('trialTimer');
    if (timerEl) timerEl.textContent = formatTime(left);
    if (left <= 0) {
      clearInterval(trialInterval);
      showTrialExpiredPopup();
    }
  }, 1000);
}

/* ── Main guard ── */
onAuthChange(user => {
  if (user) {
    // Signed-in user — full access, hide trial UI
    clearTrial();
    hideTrialBar();
    clearInterval(trialInterval);
    // Show user avatar in app header
    const appUserBtn = document.getElementById('appUserBtn');
    const appUserEmail = document.getElementById('appUserEmail');
    if (appUserBtn) appUserBtn.textContent = (user.displayName || user.email || 'U')[0].toUpperCase();
    if (appUserEmail) appUserEmail.textContent = user.email || user.displayName || '';
    document.getElementById('appNavLoggedIn')?.style && (document.getElementById('appNavLoggedIn').style.display = 'flex');
    document.getElementById('appNavGuest')?.style && (document.getElementById('appNavGuest').style.display = 'none');
    return;
  }

  // Not signed in — check trial
  if (isTrialStarted() && isTrialActive()) {
    showTrialBar(getTrialTimeLeft());
    startTrialCountdown();
    document.getElementById('appNavGuest')?.style && (document.getElementById('appNavGuest').style.display = 'flex');
    document.getElementById('appNavLoggedIn')?.style && (document.getElementById('appNavLoggedIn').style.display = 'none');
  } else if (isTrialStarted() && !isTrialActive()) {
    // Trial already expired
    showTrialExpiredPopup();
  } else {
    // No trial, no auth — redirect
    window.location.href = '/';
  }
});

/* ── Expired popup actions ── */
window.dismissTrialExpired = function() {
  window.location.href = '/';
};
