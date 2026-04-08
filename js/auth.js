/**
 * auth.js — landing page auth UI controller
 * Handles: open/close modal, Google sign-in, sign-out, nav state
 */

import { signInWithGoogle, signOutUser, onAuthChange } from './firebase.js';
import { startTrial } from './trialManager.js';

/* ── DOM refs ── */
const authModal       = document.getElementById('authModal');
// Support both old IDs and new landing page IDs
const navActions      = document.getElementById('navActions')    || document.getElementById('navGuest');
const navActionsIn    = document.getElementById('navActionsLoggedIn') || document.getElementById('navLoggedIn');
const userEmailEl     = document.getElementById('userEmailDisplay');
const userAvatarBtn   = document.getElementById('userAvatarBtn');
const authErrorEl     = document.getElementById('authError');

/* ── Open / Close modal ── */
window.openAuth = function(mode) {
  authModal.classList.add('active');
  authModal.dataset.mode = mode || 'signup';
};
window.closeAuth = function() {
  authModal.classList.remove('active');
  if (authErrorEl) authErrorEl.textContent = '';
};
authModal?.addEventListener('click', e => {
  if (e.target === authModal) window.closeAuth();
});

/* ── Google Sign-In button ── */
window.handleGoogleSignIn = async function() {
  const btn = document.getElementById('googleSignInBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="auth-spinner"></span> Signing in…'; }
  if (authErrorEl) authErrorEl.textContent = '';
  try {
    const user = await signInWithGoogle();
    if (user) {
      window.closeAuth();
      window.location.href = 'app.html';
    }
  } catch (err) {
    if (authErrorEl) authErrorEl.textContent = 'Sign-in failed. Please try again.';
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" class="google-icon" /> Continue with Google'; }
  }
};

/* ── Try Now (no sign in) ── */
window.startTryNow = function(e) {
  e && e.preventDefault();
  startTrial();
  window.location.href = '/app.html';
};

/* ── Sign Out ── */
window.signOut = async function() {
  await signOutUser();
};

/* ── User menu toggle ── */
window.toggleUserMenu = function() {
  const dd = document.getElementById('userDropdown');
  if (!dd) return;
  // Support both class-based (old) and style-based (new) toggle
  if (dd.classList.contains('active')) {
    dd.classList.remove('active');
    dd.style.display = 'none';
  } else if (dd.style.display === 'block') {
    dd.style.display = 'none';
  } else {
    dd.classList.add('active');
    dd.style.display = 'block';
  }
};
document.addEventListener('click', e => {
  const btn = document.getElementById('userAvatarBtn');
  const dd  = document.getElementById('userDropdown');
  if (dd && btn && !btn.contains(e.target) && !dd.contains(e.target)) {
    dd.classList.remove('active');
    dd.style.display = 'none';
  }
});

/* ── Auth state in nav ── */
onAuthChange(user => {
  if (user) {
    navActions?.style && (navActions.style.display = 'none');
    if (navActionsIn) navActionsIn.style.display = 'flex';
    if (userEmailEl)  userEmailEl.textContent = user.email || user.displayName || '';
    if (userAvatarBtn) userAvatarBtn.textContent = (user.displayName || user.email || 'U')[0].toUpperCase();
  } else {
    navActions?.style && (navActions.style.display = 'flex');
    if (navActionsIn) navActionsIn.style.display = 'none';
  }
});
