/**
 * auth.js — landing page auth UI controller
 * Handles: open/close modal, Google sign-in, sign-out, nav state
 */

import { signInWithGoogle, signOutUser, onAuthChange } from './firebase.js';
import { startTrial } from './trialManager.js';

/* ── DOM refs ── */
const authModal       = document.getElementById('authModal');
const navActions      = document.getElementById('navActions');
const navActionsIn    = document.getElementById('navActionsLoggedIn');
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
  document.getElementById('userDropdown')?.classList.toggle('active');
};
document.addEventListener('click', e => {
  if (!e.target.closest('.user-menu')) {
    document.getElementById('userDropdown')?.classList.remove('active');
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
