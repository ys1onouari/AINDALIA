import { initMenu, showPage, loadSettings } from './menu.js';
import { initNavigation } from './navigation.js';
import { login } from './auth.js';
import { supabaseReady } from './supabase.js';
import { i18nReady, translatePage, changeLanguage, t } from './i18n.js';
import { $ } from './helpers.js';
import { LOCK_KEY } from './constants.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.time('total');
  console.time('i18nReady');
  const earlySettings = loadSettings();
  await i18nReady;
  console.timeEnd('i18nReady');
  translatePage();
  console.time('settingsRemaining');
  await earlySettings;
  console.timeEnd('settingsRemaining');

  document.querySelectorAll('[data-i18n-lang]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const lang = btn.getAttribute('data-i18n-lang');
      document.querySelectorAll('[data-i18n-lang]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      await changeLanguage(lang);
      translatePage();
      try {
        await initMenu();
      } catch (e) {
        console.warn('Erreur initMenu :', e);
      }
    });
  });

  try {
    await initMenu();
  } catch (e) {
    console.warn('Erreur initMenu :', e);
  }
  initNavigation();
  initAuth();
  if (window.__DAHAB_DEBUG?.enabled) {
    import('./debug.js').then(m => m.initDebug()).catch(() => {});
  }
  console.timeEnd('total');
});

/* ============================================
   Lock système — 3 tentatives, blocage 24h
   ============================================ */


function getLockState() {
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    if (!raw) return { attempts: 0, lockedUntil: 0 };
    const state = JSON.parse(raw);
    if (Date.now() >= state.lockedUntil) {
      localStorage.removeItem(LOCK_KEY);
      return { attempts: 0, lockedUntil: 0 };
    }
    return state;
  } catch {
    return { attempts: 0, lockedUntil: 0 };
  }
}

function setLockState(state) {
  localStorage.setItem(LOCK_KEY, JSON.stringify(state));
}

function isLocked() {
  return Date.now() < getLockState().lockedUntil;
}

function remainingLockMs() {
  const remaining = getLockState().lockedUntil - Date.now();
  return remaining > 0 ? remaining : 0;
}

function formatDuration(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

function recordFailedAttempt() {
  const state = getLockState();
  state.attempts++;
  if (state.attempts >= 3) {
    state.lockedUntil = Date.now() + 86400000;
  }
  setLockState(state);
}

function resetLock() {
  localStorage.removeItem(LOCK_KEY);
}

function updateLockDisplay() {
  const lock = $('authLock');
  const timer = $('authLockTimer');
  if (!lock || !timer) return;
  if (isLocked()) {
    lock.classList.add('show');
    timer.textContent = formatDuration(remainingLockMs());
  } else {
    lock.classList.remove('show');
  }
}

/* --- Auth state --- */

let isLoggedIn = false;

let lockInterval = null;

function initAuth() {
  const btn = $('adminBtn');
  const overlay = $('authOverlay');
  const close = $('authClose');
  const form = $('authForm');
  const email = $('authEmail');
  const password = $('authPassword');
  const errorEl = $('authError');
  const lock = $('authLock');

  if (!btn || !overlay) return;

  supabaseReady.then(sup => {
    sup.auth.getSession().then(({ data }) => {
      if (data?.session) {
        setLoggedIn(btn, true);
        resetLock();
      }
    }).catch(() => {});
  }).catch(() => {});

  const toggle = $('authToggle');
  toggle?.addEventListener('click', () => {
    toggle.classList.toggle('on');
    toggle.setAttribute('aria-checked', toggle.classList.contains('on'));
  });

  btn.addEventListener('click', () => {
    if (isLoggedIn) {
      showAdminPage();
    } else {
      overlay.classList.add('open');
      if (isLocked()) {
        updateLockDisplay();
        lockInterval = setInterval(updateLockDisplay, 30000);
      }
    }
  });

  close?.addEventListener('click', () => {
    overlay.classList.remove('open');
    clearInterval(lockInterval);
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('open');
      clearInterval(lockInterval);
    }
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    lock.classList.remove('show');

    if (isLocked()) {
      updateLockDisplay();
      return;
    }

    try {
      await login(email.value, password.value);
      resetLock();
      overlay.classList.remove('open');
      clearInterval(lockInterval);
      setLoggedIn(btn, true);
      showAdminPage();
    } catch (err) {
      recordFailedAttempt();
      errorEl.textContent = err.message === 'Invalid login credentials'
        ? t('auth.errorInvalid')
        : t('auth.errorGeneric');
      if (isLocked()) {
        errorEl.textContent = '';
        updateLockDisplay();
      }
    }
  });
}

function setLoggedIn(btn, loggedIn) {
  isLoggedIn = loggedIn;
  if (loggedIn) {
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
    btn.title = t('auth.btnDashboard');
  } else {
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
    btn.title = t('auth.btnAdmin');
  }
}

let adminModulePromise = null;

async function showAdminPage() {
  document.querySelectorAll('[data-page="admin"]').forEach(el => el.style.display = '');
  showPage('admin');
  try {
    if (!adminModulePromise) {
      adminModulePromise = import('./admin-dashboard.js');
    }
    const adminModule = await adminModulePromise;
    await adminModule.initAdmin();
  } catch (e) {
    console.warn("Erreur d'initialisation de l'administration :", e);
  }
}
