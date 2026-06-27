import { getMenuItems, getCategories, getSettings, getSupabaseStatus } from './supabase.js';
import { t, localized } from './i18n.js';
import { $ } from './helpers.js';

let WA_NUMBER = '212630230803';
let SETTINGS = {};

function isOrderingEnabled() {
  return SETTINGS.ordering_enabled !== 'false';
}

function applyCartVisibility() {
  const visible = isOrderingEnabled();
  ['cartOpenBtn', 'cartBadge', 'cartSidebar', 'cartOverlay'].forEach(id => {
    const el = $(id);
    if (el) el.style.display = visible ? '' : 'none';
  });
}

let MENU_DATA = [];
let CATEGORIES = [{ id: null, name: '__all__', icon: '' }];
let CATEGORY_MAP = new Map();
let LOAD_STATUS = 'success';
let MENU_CACHE = { data: null, settings: null };

const SETTINGS_CACHE_KEY = 'dahabcoffee_settings_cache';
const SETTINGS_CACHE_TTL = 300000;

function getCachedSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    return {
      data,
      stale: Date.now() - timestamp > SETTINGS_CACHE_TTL,
    };
  } catch { return null; }
}

function setCachedSettings(data) {
  try {
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch { /* quota exceeded, ignore */ }
}

export async function loadMenuData(forceRefresh = false) {
  if (!forceRefresh && MENU_CACHE.data) {
    MENU_DATA = MENU_CACHE.data.menuData;
    CATEGORIES = MENU_CACHE.data.categories;
    LOAD_STATUS = MENU_CACHE.data.loadStatus;
    buildCategoryMap();
    return;
  }
  try {
    const [items, cats] = await Promise.all([getMenuItems(), getCategories()]);
    if (items.length > 0 && cats.length > 0) {
      MENU_DATA = items.map(item => ({
        id: item.id, name: item.name, category_id: item.category_id,
        price: item.price, description: item.description || '',
        tags: item.tags || [], available: item.available,
        popular: item.popular, image: item.image_url || '',
      }));
      CATEGORIES = [
        { id: null, name: '__all__', icon: '' },
        ...cats.map(c => ({ id: c.id, name: c.name, icon: c.icon_svg || '' })),
      ];
    }
    const status = getSupabaseStatus();
    if ((items.length === 0 || cats.length === 0) && (status.type === 'timeout' || status.type === 'error')) {
      LOAD_STATUS = 'unavailable';
    } else if (items.length === 0 && cats.length === 0) {
      LOAD_STATUS = 'empty';
    } else {
      LOAD_STATUS = 'success';
    }
    if (LOAD_STATUS !== 'unavailable') {
      MENU_CACHE.data = { menuData: MENU_DATA, categories: CATEGORIES, loadStatus: LOAD_STATUS };
    }
  } catch (e) {
    console.warn('Erreur chargement données :', e);
    LOAD_STATUS = 'unavailable';
  }
  buildCategoryMap();
}

function buildCategoryMap() {
  CATEGORY_MAP.clear();
  CATEGORIES.forEach(c => {
    if (c.id !== null) CATEGORY_MAP.set(c.id, c);
  });
}

function getCategoryName(categoryId) {
  const cat = CATEGORY_MAP.get(categoryId);
  return cat ? localized(cat.name) : '';
}

export function applySettings(settings) {
  SETTINGS = settings;
  if (settings.wa_number) WA_NUMBER = settings.wa_number;
  MENU_CACHE.settings = settings;
  setCachedSettings(settings);
  applyCartVisibility();
  renderBranding();
}

export async function loadSettings(forceRefresh = false) {
  console.time('loadSettings');
  if (!forceRefresh && MENU_CACHE.settings) {
    SETTINGS = MENU_CACHE.settings;
    if (SETTINGS.wa_number) WA_NUMBER = SETTINGS.wa_number;
    console.timeEnd('loadSettings');
    renderBranding();
    return;
  }
  if (!forceRefresh) {
    const cached = getCachedSettings();
    if (cached) {
      SETTINGS = cached.data;
      if (SETTINGS.wa_number) WA_NUMBER = SETTINGS.wa_number;
      MENU_CACHE.settings = SETTINGS;
      renderBranding();
      if (!cached.stale) { console.timeEnd('loadSettings'); return; }
    }
  }
  try {
    SETTINGS = await getSettings();
    if (SETTINGS.wa_number) WA_NUMBER = SETTINGS.wa_number;
    MENU_CACHE.settings = SETTINGS;
    setCachedSettings(SETTINGS);
    renderBranding();
  } catch (e) {
    console.warn('Impossible de charger la configuration :', e);
  }
  console.timeEnd('loadSettings');
}

export function renderBranding() {
  const titleEl = $('heroTitle');
  const subtitleEl = $('heroSubtitle');
  const s = SETTINGS;
  if (titleEl) {
    titleEl.classList.remove('skeleton');
    titleEl.textContent = localized(s.restaurant_name) || t('hero.fallback');
  }
  if (subtitleEl && s.restaurant_subtitle) {
    subtitleEl.classList.remove('skeleton');
    subtitleEl.textContent = localized(s.restaurant_subtitle);
  }
  if (s.restaurant_name) {
    const name = localized(s.restaurant_name);
    document.title = name + ' · Restaurant Gastronomique';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', name + ' · Menu Digital');
  }
}

export function renderContact() {
  const wrap = $('contactWrap');
  if (!wrap) return;
  const s = SETTINGS;
  const cards = [];
  if (s.address) cards.push(`<div class="contact-card"><div class="contact-info"><h3>${t('contact.addressTitle')}</h3><p>${s.address}</p></div></div>`);
  if (s.hours) cards.push(`<div class="contact-card"><div class="contact-info"><h3>${t('contact.hoursTitle')}</h3><p>${s.hours}</p></div></div>`);
  if (s.phone) cards.push(`<div class="contact-card"><div class="contact-info"><h3>${t('contact.phoneTitle')}</h3><a href="tel:${s.phone_raw || s.phone}">${s.phone}</a></div></div>`);
  if (s.email) cards.push(`<div class="contact-card"><div class="contact-info"><h3>${t('contact.emailTitle')}</h3><a href="mailto:${s.email}">${s.email}</a></div></div>`);
  if (s.instagram) cards.push(`<div class="contact-card"><div class="contact-info"><h3>${t('contact.instagramTitle')}</h3><a href="${s.instagram}" target="_blank" rel="noopener">${s.instagram}</a></div></div>`);
  if (s.wa_number) {
    const wa = s.wa_number.trim().replace(/^\+/, '');
    cards.push(`<div class="contact-card"><div class="contact-info"><h3>${t('contact.whatsappTitle')}</h3><a href="https://wa.me/${wa}" target="_blank" rel="noopener">${s.wa_number}</a></div></div>`);
  }
  const googleBlock = s.google_reviews_url ? `
    <div class="google-review-block">
      <div class="google-review-stars">${t('contact.reviewStars')}</div>
      <div class="google-review-score">${t('contact.reviewScore')}</div>
      <div class="google-review-count">${t('contact.reviewCount')}</div>
      <p class="google-review-msg">${t('contact.reviewMsg')}</p>
      <a class="google-review-btn" href="${s.google_reviews_url}" target="_blank" rel="noopener">
        <svg class="google-icon" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
        ${t('contact.reviewBtn')}
      </a>
    </div>` : '';
  wrap.innerHTML = `
    <div class="contact-grid">${cards.join('')}</div>
    ${googleBlock}`;
}

let cart = [];
let activeFilterId = null;
let _listenersInitialized = false;
let _addingToCart = false;

function qsa(sel, ctx) {
  return (ctx || document).querySelectorAll(sel);
}

let toastTimer;

export function showToast(msg) {
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

export function showPage(name) {
  qsa('.page').forEach(p => p.classList.remove('active'));
  const page = $('page-' + name);
  if (page) page.classList.add('active');

  qsa('.nav-item').forEach(n => n.classList.remove('active'));
  const bn = $('bnav-' + name);
  if (bn) bn.classList.add('active');

  qsa('.desktop-nav-item').forEach(n => n.classList.remove('active'));
  qsa('.desktop-nav-item').forEach(n => {
    if (n.getAttribute('data-page') === name) n.classList.add('active');
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (name === 'admin') {
    document.body.classList.add('admin-mode');
  } else {
    document.body.classList.remove('admin-mode');
  }
}

function renderHomeCats() {
  const el = $('homeCatGrid');
  if (!el) return;
  el.innerHTML = CATEGORIES.slice(1).map(c => `
    <div class="cat-card" data-category-id="${c.id}">
      <span class="cat-label">${localized(c.name)}</span>
    </div>
  `).join('');
}

export function renderFeatured() {
  const el = $('featuredGrid');
  if (!el) return;
  const featured = MENU_DATA.filter(d => d.popular).slice(0, 6);
  el.innerHTML = featured.map(d => dishCard(d)).join('');
  setupReveal();
}

function dishCard(dish) {
  const showImages = SETTINGS.show_dish_images !== 'false';
  const badges = [];

  badges.push(`<span class="badge badge-category">${getCategoryName(dish.category_id)}</span>`);

  if (!dish.available) {
    badges.push(`<span class="badge badge-unavail">${t('dish.unavailable')}</span>`);
  }

  const noImageClass = showImages ? '' : ' dish-card--no-image';

  const imgBlock = showImages
    ? `<div class="dish-img-wrap">
        ${dish.image
          ? `<img src="${dish.image}" alt="${localized(dish.name)}" class="dish-img"/>`
          : `<div class="dish-img-placeholder"></div>`}
        ${badges.join('')}
      </div>`
    : '';

  const badgesBlock = !showImages && badges.length
    ? `<div class="dish-badges-inline">${badges.join('')}</div>`
    : '';

  return `
  <div class="dish-card${noImageClass}" data-id="${dish.id}">
    ${imgBlock}
    ${badgesBlock}
    <div class="dish-body">
      <div class="dish-name">${localized(dish.name)}</div>
      <div class="dish-price-line">
        <span class="dish-price">${t('dish.price', { price: dish.price })}</span>
      </div>
      <div class="dish-actions">
        ${dish.available ? `
        ${isOrderingEnabled() ? `
        <button class="wa-btn" data-action="order">
          <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.561 4.14 1.541 5.87L0 24l6.268-1.508A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.939 0-3.765-.494-5.353-1.359l-.373-.21-3.863.929.972-3.756-.235-.391A9.963 9.963 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
          ${t('dish.orderBtn')}
        </button>
        <button class="add-cart-btn" data-action="cart">+</button>
        ` : ''}
        ` : `<div class="dish-unavailable-msg">${t('dish.unavailableMsg')}</div>`}
      </div>
    </div>
  </div>`;
}

export function renderFilterChips() {
  const el = $('filterChips');
  if (!el) return;
  el.innerHTML = CATEGORIES.map(c => `
    <button class="chip ${activeFilterId === c.id ? 'active' : ''}" data-category-id="${c.id ?? '__all__'}">${c.id === null ? t('filter.all') : localized(c.name)}</button>
  `).join('');
}

function setFilter(id) {
  activeFilterId = id;
  renderFilterChips();
  renderMenuGrid();
}

function renderMenuStatus() {
  const el = $('noResults');
  if (!el) return;
  if (LOAD_STATUS === 'unavailable') {
    el.innerHTML = `
      <p>${t('menu.unavailable')}</p>
      <p style="margin-top:8px;font-size:12px">${t('menu.unavailableSub')}</p>
      <button class="btn-retry" id="retryBtn">${t('menu.retry')}</button>
    `;
    el.style.display = 'block';
    $('retryBtn')?.addEventListener('click', async () => {
      el.style.display = 'none';
      await initMenu();
    });
  } else if (LOAD_STATUS === 'empty') {
    el.innerHTML = `<p>${t('menu.empty')}</p>`;
    el.style.display = 'block';
  }
}

export function renderMenuGrid(items) {
  if (LOAD_STATUS === 'unavailable') return;
  if (!items) {
    items = MENU_DATA.filter(d => {
      return activeFilterId === null || d.category_id === activeFilterId;
    });
  }

  const grid = $('menuGrid');
  const noRes = $('noResults');
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = '';
    if (noRes) noRes.style.display = 'block';
    return;
  }

  if (noRes) noRes.style.display = 'none';
  grid.innerHTML = items.map(d => dishCard(d)).join('');
  setupReveal();
}

function addToCart(id) {
  if (_addingToCart) return;
  _addingToCart = true;
  setTimeout(() => { _addingToCart = false; }, 300);
  if (!isOrderingEnabled()) return;
  const dish = MENU_DATA.find(d => d.id === id);
  if (!dish) return;
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...dish, qty: 1 });
  }
  updateCartBadge();
  showToast(t('dish.added', { name: localized(dish.name) }));
  const badge = $('cartBadge');
  if (badge) {
    badge.classList.remove('show');
    void badge.offsetWidth;
    badge.classList.add('show');
  }
}

function updateCartBadge() {
  const total = cart.reduce((s, c) => s + c.qty, 0);
  const badge = $('cartBadge');
  if (!badge) return;
  badge.textContent = total;
  if (total > 0) {
    badge.classList.add('show');
  } else {
    badge.classList.remove('show');
  }
}

export function openCart() {
  if (!isOrderingEnabled()) return;
  const overlay = $('cartOverlay');
  const sidebar = $('cartSidebar');
  if (overlay) overlay.classList.add('open');
  if (sidebar) sidebar.classList.add('open');
  renderCartItems();
}

export function closeCart() {
  const overlay = $('cartOverlay');
  const sidebar = $('cartSidebar');
  if (overlay) overlay.classList.remove('open');
  if (sidebar) sidebar.classList.remove('open');
}

function renderCartItems() {
  const container = $('cartItems');
  const footer = $('cartFooter');
  const empty = $('cartEmpty');
  if (!container) return;

  if (!cart.length) {
    if (empty) empty.style.display = 'flex';
    if (footer) footer.style.display = 'none';
    container.innerHTML = '';
    if (empty) container.appendChild(empty);
    return;
  }

  if (empty) empty.style.display = 'none';
  if (footer) footer.style.display = 'block';

  container.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-info">
        <div class="cart-item-name">${localized(item.name)}</div>
        <div class="cart-item-price">${t('dish.price', { price: (item.price * item.qty).toFixed(2) })}</div>
        <div class="cart-qty">
          <button class="qty-btn" data-action="qty" data-delta="-1">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" data-action="qty" data-delta="1">+</button>
        </div>
      </div>
      <button class="cart-remove" data-action="remove">✕</button>
    </div>
  `).join('');

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const totalEl = $('cartTotal');
  if (totalEl) totalEl.textContent = t('dish.price', { price: total.toFixed(2) });
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(c => c.id !== id);
  }
  updateCartBadge();
  renderCartItems();
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  updateCartBadge();
  renderCartItems();
}

function generateTicket() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 100)).padStart(2, '0');
  return `T-${y}${m}${d}-${hh}${mm}${ss}-${rand}`;
}

function orderWhatsApp(id) {
  if (!isOrderingEnabled()) return;
  const dish = MENU_DATA.find(d => d.id === id);
  if (!dish) return;
  const ticket = generateTicket();
  const msg = t('wa.orderMsg', { name: localized(dish.name), price: dish.price, ticket });
  openWhatsApp(msg);
}

export function checkoutWhatsApp() {
  if (!isOrderingEnabled()) return;
  if (!cart.length) return;
  const ticket = generateTicket();
  const lines = cart.map(c => `${c.qty}x ${localized(c.name)} — ${t('dish.price', { price: (c.price * c.qty).toFixed(2) })}`).join('\n');
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const msg = t('wa.cartMsg', { lines, total: total.toFixed(2), ticket });
  openWhatsApp(msg);
}

function openWhatsApp(msg) {
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

function setupReveal() {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

function setupMenuEventListeners() {
  if (_listenersInitialized) return;
  _listenersInitialized = true;
  $('filterChips')?.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (chip?.dataset.categoryId) {
      const id = chip.dataset.categoryId;
      setFilter(id === '__all__' ? null : Number(id));
    }
  });

  document.addEventListener('click', (e) => {
    const card = e.target.closest('.dish-card');
    if (!card) return;
    const id = parseInt(card.dataset.id, 10);
    if (isNaN(id)) return;

    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    e.stopImmediatePropagation();

    if (action === 'cart') {
      addToCart(id);
    } else if (action === 'order') {
      orderWhatsApp(id);
    }
  });

  $('cartItems')?.addEventListener('click', (e) => {
    const item = e.target.closest('.cart-item');
    if (!item) return;
    const id = parseInt(item.dataset.id, 10);
    if (isNaN(id)) return;

    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    if (btn.dataset.action === 'qty') {
      changeQty(id, parseInt(btn.dataset.delta, 10));
    } else if (btn.dataset.action === 'remove') {
      removeFromCart(id);
    }
  });
}

export async function initMenu() {
  console.time('initMenu');
  await Promise.all([loadMenuData(), loadSettings()]);
  renderContact();
  applyCartVisibility();
  updateCartBadge();
  setupReveal();
  setupMenuEventListeners();
  if (LOAD_STATUS === 'unavailable') {
    renderMenuStatus();
    return;
  }
  renderHomeCats();
  renderFeatured();
  renderFilterChips();
  renderMenuGrid();
  console.timeEnd('initMenu');
}
