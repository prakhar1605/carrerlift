/**
 * alerts.js
 * Job Alert subscription — form submit + success state.
 */

import { API_ENDPOINTS } from './config.js';
import { showStatus }    from './ui.js';

/**
 * Subscribe user to daily job alerts.
 * Called from the "Get Free Job Alerts" button.
 */
export async function subscribeToAlerts() {
  const name   = document.getElementById('alertName').value.trim();
  const email  = document.getElementById('alertEmail').value.trim();
  const skills = document.getElementById('alertSkills').value.trim();

  if (!email || !email.includes('@')) {
    showStatus('Please enter a valid email address!', 'error');
    document.getElementById('alertEmail').focus();
    return;
  }

  const btn = document.getElementById('alertSubmitBtn');
  btn.innerHTML = '<span class="loading"></span> Subscribing...';
  btn.disabled  = true;

  try {
    const response = await fetch(API_ENDPOINTS.subscribe, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ email, name, skills }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      document.getElementById('alertForm').style.display  = 'none';
      document.getElementById('alertSuccess').classList.add('active');
      showStatus('Subscribed! Check your email for confirmation.', 'success');

      // Track conversion if GA is available
      if (typeof gtag === 'function') {
        gtag('event', 'subscribe', { event_category: 'job_alerts', event_label: email });
      }
    } else {
      throw new Error(data.message || data.error || 'Subscription failed');
    }
  } catch (err) {
    showStatus(err.message || 'Failed to subscribe. Please try again.', 'error');
    btn.innerHTML = '<i class="fas fa-bell"></i> Get Free Job Alerts';
    btn.disabled  = false;
  }
}
