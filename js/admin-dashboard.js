import {
  getCategories, addCategory, updateCategory, deleteCategory,
  getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, uploadImage,
  getSettings, upsertSettings,
} from './supabase.js';
import { supabaseReady } from './supabase.js';
import { loadMenuData, renderFeatured, renderFilterChips, renderMenuGrid, renderContact, showToast } from './menu.js';
import { showConfirm, showAlert } from './modal.js';
import { t, localized } from './i18n.js';
import { LANGUAGES } from './locales/config.js';
import { $ } from './helpers.js';
import { validateCategory, validateItem, validateSettings } from './admin-validation.js';

/* --- Init --- */
let items = [];
let cats = [];

export async function initAdmin() {
  [items, cats] = await Promise.all([getMenuItems(), getCategories()]);
  renderAll();
  bindEvents();
  await loadConfig();
}

/* --- Helpers --- */
function langFields(prefix, data, field) {
  return LANGUAGES.map(lng => {
    const val = data?.[field]?.[lng] ?? '';
    const label = t(`admin.form${prefix}`) + ` (${lng.toUpperCase()})`;
    const isTextarea = prefix === 'Description';
    const tag = isTextarea ? 'textarea' : 'input';
    const extra = isTextarea ? '' : 'type="text"';
    return `<div class="form-group">
      <label>${label}</label>
      <${tag} name="${field}${lng.toUpperCase()}" ${extra} value="${isTextarea ? '' : val.replace(/"/g, '&quot;')}" ${lng === 'fr' && field === 'name' ? 'required' : ''}>${isTextarea ? val : ''}</${tag}>
    </div>`;
  }).join('');
}

function buildJsonb(formData, field) {
  const obj = {};
  LANGUAGES.forEach(lng => {
    obj[lng] = formData.get(field + lng.toUpperCase()) || '';
  });
  return obj;
}

/* --- Render --- */
function renderAll() {
  renderItems();
  renderItemsHeader();
  renderCatsHeader();
  renderCats();
}

function renderItemsHeader() {
  const header = document.querySelector('.admin-view[data-admin-view="items"] .admin-view-header');
  if (!header) return;
  const actions = header.querySelector('.admin-header-actions');
  if (actions) return;
  const addBtn = header.querySelector('#adminAddItemBtn');
  const wrap = document.createElement('div');
  wrap.className = 'admin-header-actions';
  wrap.innerHTML = `
    <button class="admin-btn-import" id="adminImportBtn">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      ${t('admin.importXlsx')}
    </button>
    <button class="admin-btn-export" id="adminExportBtn">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      ${t('admin.exportXlsx')}
    </button>
    <button class="admin-btn-import" id="adminDeleteAllBtn" style="border-color:rgba(212,85,74,0.3);color:var(--danger)">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      ${t('admin.deleteAll')}
    </button>`;
  if (addBtn) addBtn.after(wrap);
}

function getCatName(catId) {
  const c = cats.find(c => c.id === catId);
  return c ? localized(c.name) : '';
}

function renderItems() {
  const tbody = $('adminItemsBody');
  if (!tbody) return;
  tbody.innerHTML = items.map(item => {
    const img = item.image_url
      ? `<img src="${item.image_url}" class="item-img" alt="${localized(item.name)}"/>`
      : `<div class="item-img-placeholder"></div>`;
    return `<tr>
      <td data-label="${t('admin.tableImage')}">${img}</td>
      <td data-label="${t('admin.tableName')}"><strong style="color:var(--text)">${localized(item.name)}</strong></td>
      <td data-label="${t('admin.tableCategory')}">${getCatName(item.category_id)}</td>
      <td data-label="${t('admin.tablePrice')}">${t('dish.price', { price: item.price })}</td>
      <td data-label="${t('admin.tableAvail')}"><span class="badge-dot ${item.available ? 'on' : 'off'}"></span></td>
      <td data-label="${t('admin.tableActions')}">
        <button class="admin-action-btn edit" data-edit-item="${item.id}" title="${t('admin.editTitle')}">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="admin-action-btn delete" data-delete-item="${item.id}" title="${t('admin.deleteTitle')}">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </td>
    </tr>`;
  }).join('');
}

function renderCatsHeader() {
  const header = document.querySelector('.admin-view[data-admin-view="categories"] .admin-view-header');
  if (!header) return;
  if (header.querySelector('.admin-header-actions')) return;
  const addBtn = header.querySelector('#adminAddCatBtn');
  const wrap = document.createElement('div');
  wrap.className = 'admin-header-actions';
  wrap.innerHTML = `
    <button class="admin-btn-import" id="adminCatImportBtn">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Importer XLSX
    </button>
    <button class="admin-btn-export" id="adminCatExportBtn">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      ${t('admin.exportXlsx')}
    </button>
    <button class="admin-btn-import" id="adminDeleteAllCatsBtn" style="border-color:rgba(212,85,74,0.3);color:var(--danger)">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      ${t('admin.deleteAll')}
    </button>`;
  if (addBtn) addBtn.after(wrap);
}

function renderCats() {
  const tbody = $('adminCatsBody');
  if (!tbody) return;
  tbody.innerHTML = cats.map(cat => `
    <tr>
      <td data-label="${t('admin.tableName')}"><strong style="color:var(--text)">${localized(cat.name)}</strong></td>
      <td data-label="${t('admin.tableOrder')}">${cat.sort_order ?? '-'}</td>
      <td data-label="${t('admin.tableActions')}">
        <button class="admin-action-btn edit" data-edit-cat="${cat.id}" title="${t('admin.editTitle')}">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="admin-action-btn delete" data-delete-cat="${cat.id}" title="${t('admin.deleteTitle')}">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </td>
    </tr>`
  ).join('');
}

/* --- Modal --- */
const overlay = $('adminModalOverlay');
const content = $('adminModalContent');

function openModal(html) {
  content.innerHTML = html;
  overlay.classList.add('open');
}

function closeModal() {
  overlay.classList.remove('open');
}

overlay?.addEventListener('click', (e) => {
  if (e.target === overlay) closeModal();
});

/* --- Forms --- */
function itemFormHtml(item) {
  const isEdit = !!item;
  return `<h2>${isEdit ? t('admin.itemFormEdit') : t('admin.itemFormNew')}</h2>
    <form id="adminItemForm">
      ${langFields('Name', item, 'name')}
      <div class="form-row">
        <div class="form-group">
          <label>${t('admin.formCategory')}</label>
          <select name="categoryId" required>
            <option value="">—</option>
            ${cats.map(c => `<option value="${c.id}" ${item?.category_id === c.id ? 'selected' : ''}>${localized(c.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>${t('admin.formPrice')}</label>
          <input name="price" type="number" step="0.5" min="0" value="${item?.price ?? ''}" required/>
        </div>
      </div>
      ${langFields('Description', item, 'description')}
      <div class="form-row">
        <div class="form-group">
          <label>${t('admin.formImage')}</label>
          <div class="admin-upload">
            <input name="image" type="file" accept="image/*" id="adminFileInput"/>
            <label for="adminFileInput" class="admin-upload-label">${t('admin.formChooseImage')}</label>
            ${item?.image_url ? `<img src="${item.image_url}" class="image-preview show" id="adminPreview"/>` : '<img class="image-preview" id="adminPreview"/>'}
          </div>
        </div>
        <div class="form-group">
          <label>${t('admin.formAvailability')}</label>
          <div class="toggle-wrap">
            <button type="button" class="toggle ${item?.available !== false ? 'on' : ''}" id="adminAvailToggle"></button>
            <span class="toggle-label">${item?.available !== false ? t('admin.formAvailable') : t('admin.formUnavailable')}</span>
          </div>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-cancel" data-admin-close>${t('admin.formCancel')}</button>
        <button type="submit" class="btn-save">${isEdit ? t('admin.formSave') : t('admin.formAdd')}</button>
      </div>
    </form>`;
}

function catFormHtml(cat) {
  const isEdit = !!cat;
  return `<h2>${isEdit ? t('admin.catFormEdit') : t('admin.catFormNew')}</h2>
    <form id="adminCatForm">
      ${langFields('Name', cat, 'name')}
      <div class="form-group"><label>${t('admin.formOrder')}</label><input name="sortOrder" type="number" min="0" value="${cat?.sort_order ?? ''}"/></div>
      <div class="form-actions">
        <button type="button" class="btn-cancel" data-admin-close>${t('admin.formCancel')}</button>
        <button type="submit" class="btn-save">${isEdit ? t('admin.formSave') : t('admin.formAdd')}</button>
      </div>
    </form>`;
}

/* --- Event binding --- */
function bindEvents() {
  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.accept = '.xlsx,.xls';
  importInput.style.display = 'none';
  importInput.id = 'adminXlsxInput';
  document.body.appendChild(importInput);
  importInput.addEventListener('change', async () => {
    if (importInput.files[0]) await importXLSX(importInput.files[0]);
    importInput.value = '';
  });

  const catImportInput = document.createElement('input');
  catImportInput.type = 'file';
  catImportInput.accept = '.xlsx,.xls';
  catImportInput.style.display = 'none';
  catImportInput.id = 'adminCatXlsxInput';
  document.body.appendChild(catImportInput);
  catImportInput.addEventListener('change', async () => {
    if (catImportInput.files[0]) await importCatsXLSX(catImportInput.files[0]);
    catImportInput.value = '';
  });

  document.querySelectorAll('[data-admin-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-admin-view]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
      document.querySelector(`.admin-view[data-admin-view="${btn.dataset.adminView}"]`)?.classList.add('active');
    });
  });

  $('adminAddItemBtn')?.addEventListener('click', () => {
    openModal(itemFormHtml());
    setupItemForm();
  });

  $('adminAddCatBtn')?.addEventListener('click', () => {
    openModal(catFormHtml());
    setupCatForm();
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('#adminExportBtn')) exportXLSX();
    if (e.target.closest('#adminImportBtn')) importInput.click();
    if (e.target.closest('#adminCatExportBtn')) exportCatsXLSX();
    if (e.target.closest('#adminCatImportBtn')) catImportInput.click();
    if (e.target.closest('#adminDeleteAllBtn')) deleteAllItems();
    if (e.target.closest('#adminDeleteAllCatsBtn')) deleteAllCats();
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-admin-close]')) closeModal();
  });

  document.addEventListener('click', async (e) => {
    const ei = e.target.closest('[data-edit-item]');
    if (ei) {
      const id = Number(ei.dataset.editItem);
      const item = items.find(i => i.id === id);
      if (item) { openModal(itemFormHtml(item)); setupItemForm(item); }
      return;
    }
    const di = e.target.closest('[data-delete-item]');
    if (di) {
      const id = Number(di.dataset.deleteItem);
      if (await showConfirm(t('admin.deleteConfirmItem'))) { await deleteMenuItem(id); await refresh(); }
      return;
    }
    const ec = e.target.closest('[data-edit-cat]');
    if (ec) {
      const id = Number(ec.dataset.editCat);
      const cat = cats.find(c => c.id === id);
      if (cat) { openModal(catFormHtml(cat)); setupCatForm(cat); }
      return;
    }
    const dc = e.target.closest('[data-delete-cat]');
    if (dc) {
      const id = Number(dc.dataset.deleteCat);
      if (await showConfirm(t('admin.deleteConfirmCat'))) { await deleteCategory(id); await refresh(); }
    }
  });

  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('#adminShowDishImages, #adminOrderingEnabled');
    if (!toggle) return;
    const isOn = toggle.classList.toggle('on');
    toggle.setAttribute('aria-checked', isOn);
    const label = toggle.nextElementSibling;
    if (!label) return;
    if (toggle.id === 'adminShowDishImages') {
      label.textContent = isOn
        ? t('admin.configShowDishImagesOn')
        : t('admin.configShowDishImagesOff');
    } else if (toggle.id === 'adminOrderingEnabled') {
      label.textContent = isOn
        ? t('admin.configOrderingEnabledOn')
        : t('admin.configOrderingEnabledOff');
    }
  });
}

function setupItemForm(item) {
  const form = document.getElementById('adminItemForm');
  if (!form) return;
  const toggle = document.getElementById('adminAvailToggle');
  const label = toggle?.nextElementSibling;
  let available = item?.available !== false;

  toggle?.addEventListener('click', () => {
    available = !available;
    toggle.classList.toggle('on', available);
    label.textContent = available ? t('admin.formAvailable') : t('admin.formUnavailable');
  });

  const fileInput = form.querySelector('input[type="file"]');
  const fileLabel = document.querySelector('label[for="adminFileInput"]');
  fileInput?.addEventListener('change', () => {
    const preview = document.getElementById('adminPreview');
    if (preview && fileInput.files[0]) {
      preview.src = URL.createObjectURL(fileInput.files[0]);
      preview.classList.add('show');
    }
    if (fileLabel && fileInput.files[0]) {
      fileLabel.textContent = fileInput.files[0].name;
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const errors = validateItem(fd);
    if (errors.length) {
      showAlert(errors.join('\n'), t('admin.validationError'));
      return;
    }
    let imageUrl = item?.image_url || '';
    const file = fd.get('image');
    if (file && file.size > 0) {
      const uploaded = await uploadImage(file);
      if (uploaded) imageUrl = uploaded;
    }

    const payload = {
      name: buildJsonb(fd, 'name'),
      category_id: fd.get('categoryId') ? Number(fd.get('categoryId')) : null,
      price: Number(fd.get('price')),
      description: buildJsonb(fd, 'description'),
      available,
      image_url: imageUrl,
    };
    if (item) await updateMenuItem(item.id, payload);
    else await addMenuItem(payload);
    closeModal();
    await refresh();
  });
}

function setupCatForm(cat) {
  const form = document.getElementById('adminCatForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const errors = validateCategory(fd);
    if (errors.length) {
      showAlert(errors.join('\n'), t('admin.validationError'));
      return;
    }
    const payload = {
      name: buildJsonb(fd, 'name'),
      sort_order: fd.get('sortOrder') ? Number(fd.get('sortOrder')) : 0,
    };
    if (cat) await updateCategory(cat.id, payload);
    else await addCategory(payload.name, '', payload.sort_order);
    closeModal();
    await refresh();
  });
}

async function refresh() {
  [items, cats] = await Promise.all([getMenuItems(), getCategories()]);
  renderAll();
  await loadMenuData(true);
  renderFeatured();
  renderFilterChips();
  renderMenuGrid();
  loadConfig();
}

/* --- Delete All --- */
async function deleteAllItems() {
  if (!await showConfirm(t('admin.deleteAllItems'))) return;
  for (const item of items) {
    await deleteMenuItem(item.id);
  }
  showToast(t('admin.toastDeleteAllDone'));
  await refresh();
}

async function deleteAllCats() {
  if (!await showConfirm(t('admin.deleteAllCats'))) return;
  for (const cat of cats) {
    await deleteCategory(cat.id);
  }
  showToast(t('admin.toastDeleteAllCatsDone'));
  await refresh();
}

/* --- XLSX Import / Export --- */

const XLSX_CDN = 'https://esm.sh/xlsx@0.18.5';

function itemToRow(item) {
  const row = {};
  LANGUAGES.forEach(lng => {
    const key = `Nom (${lng.toUpperCase()})`;
    row[key] = item.name?.[lng] || '';
  });
  row['Catégorie'] = getCatName(item.category_id);
  row['Prix'] = item.price;
  LANGUAGES.forEach(lng => {
    const key = `Description (${lng.toUpperCase()})`;
    row[key] = item.description?.[lng] || '';
  });
  row['Disponible'] = item.available ? 'Oui' : 'Non';
  row['Populaire'] = item.popular ? 'Oui' : 'Non';
  return row;
}

function findColumn(keys, lang, label) {
  const expected = `${label} (${lang.toUpperCase()})`;
  if (keys.includes(expected)) return expected;
  return null;
}

function rowToItem(row, idx) {
  const keys = Object.keys(row);
  const nameFr = String(row[findColumn(keys, 'fr', 'Nom') || 'Nom (FR)'] || '').trim();
  if (!nameFr) throw new Error(`Ligne ${idx + 1} : Nom (FR) manquant`);
  const name = {};
  LANGUAGES.forEach(lng => {
    const col = findColumn(keys, lng, 'Nom');
    name[lng] = col ? String(row[col] || '').trim() : '';
  });
  const categoryName = String(row['Catégorie'] || '').trim();
  if (!categoryName) throw new Error(`Ligne ${idx + 1} : Catégorie manquante pour « ${nameFr} »`);
  const cat = cats.find(c => localized(c.name) === categoryName || c.name?.fr === categoryName);
  if (!cat) throw new Error(`Ligne ${idx + 1} : Catégorie « ${categoryName} » introuvable pour « ${nameFr} »`);
  const price = Number(row['Prix']);
  if (isNaN(price) || price <= 0) throw new Error(`Ligne ${idx + 1} : Prix invalide pour « ${nameFr} »`);
  const available = String(row['Disponible'] || 'Oui').toLowerCase() === 'oui';
  const popular = String(row['Populaire'] || 'Non').toLowerCase() === 'oui';
  const description = {};
  LANGUAGES.forEach(lng => {
    const col = findColumn(keys, lng, 'Description');
    description[lng] = col ? String(row[col] || '') : '';
  });
  return { name, category_id: cat.id, price, description, available, popular };
}

async function getXLSX() {
  const mod = await import(XLSX_CDN);
  return mod.default || mod;
}

async function exportXLSX() {
  try {
    const XLSX = await getXLSX();
    const ws = XLSX.utils.json_to_sheet(items.map(itemToRow));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plats');
    const data = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aindalia_plats_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(t('admin.toastExportDone'));
  } catch (e) {
    showToast(t('admin.toastExportError', { msg: e.message }));
  }
}

async function importXLSX(file) {
  try {
    const buf = await file.arrayBuffer();
    const XLSX = await getXLSX();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws);
    if (!rows.length) { showToast(t('admin.toastImportEmpty')); return; }
    const results = { created: 0, updated: 0, errors: [] };
    for (let i = 0; i < rows.length; i++) {
      try {
        const data = rowToItem(rows[i], i);
        const existing = items.find(it => it.name?.fr?.toLowerCase() === data.name.fr.toLowerCase());
        if (existing) {
          data.image_url = existing.image_url || '';
          await updateMenuItem(existing.id, data);
          results.updated++;
        } else {
          data.image_url = '';
          await addMenuItem(data);
          results.created++;
        }
      } catch (err) {
        results.errors.push(err.message);
      }
    }
    let msg = t('admin.importResultItems', { created: results.created, updated: results.updated });
    if (results.errors.length) msg += t('admin.importResultErrors', { count: results.errors.length });
    showToast(msg);
    if (results.errors.length) {
      await showAlert(results.errors.join('\n'), t('admin.importErrorTitle'));
    }
    await refresh();
  } catch (e) {
    showToast(t('admin.toastImportError', { msg: e.message }));
  }
}

/* --- XLSX Catégories --- */

function catToRow(cat) {
  const row = {};
  LANGUAGES.forEach(lng => {
    const key = `Nom (${lng.toUpperCase()})`;
    row[key] = cat.name?.[lng] || '';
  });
  row['Ordre'] = cat.sort_order ?? 0;
  return row;
}

function rowToCat(row, idx) {
  const keys = Object.keys(row);
  const nameFr = String(row[findColumn(keys, 'fr', 'Nom') || 'Nom (FR)'] || '').trim();
  if (!nameFr) throw new Error(`Ligne ${idx + 1} : Nom (FR) manquant`);
  const name = {};
  LANGUAGES.forEach(lng => {
    const col = findColumn(keys, lng, 'Nom');
    name[lng] = col ? String(row[col] || '').trim() : '';
  });
  return {
    name,
    sort_order: Number(row['Ordre']) || 0,
  };
}

async function exportCatsXLSX() {
  try {
    const XLSX = await getXLSX();
    const ws = XLSX.utils.json_to_sheet(cats.map(catToRow));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Catégories');
    const data = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aindalia_categories_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(t('admin.toastExportDone'));
  } catch (e) {
    showToast(t('admin.toastImportError', { msg: e.message }));
  }
}

async function importCatsXLSX(file) {
  try {
    const buf = await file.arrayBuffer();
    const XLSX = await getXLSX();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws);
    if (!rows.length) { showToast(t('admin.toastImportEmpty')); return; }
    const results = { created: 0, updated: 0, errors: [] };
    for (let i = 0; i < rows.length; i++) {
      try {
        const data = rowToCat(rows[i], i);
        const existing = cats.find(c => c.name?.fr?.toLowerCase() === data.name.fr.toLowerCase());
        if (existing) {
          await updateCategory(existing.id, data);
          results.updated++;
        } else {
          await addCategory(data.name, '', data.sort_order);
          results.created++;
        }
      } catch (err) {
        results.errors.push(err.message);
      }
    }
    let msg = t('admin.importResultCats', { created: results.created, updated: results.updated });
    if (results.errors.length) msg += t('admin.importResultErrors', { count: results.errors.length });
    showToast(msg);
    if (results.errors.length) {
      await showAlert(results.errors.join('\n'), t('admin.importErrorTitle'));
    }
    await refresh();
  } catch (e) {
    showToast(t('admin.toastImportError', { msg: e.message }));
  }
}

/* --- Config --- */
let configData = {};
const CONFIG_KEYS = ['restaurant_name','restaurant_subtitle','address','hours','phone','phone_raw','email','instagram','wa_number','google_reviews_url','show_dish_images','ordering_enabled'];

async function loadConfig() {
  try {
    configData = await getSettings();
    const form = document.getElementById('adminConfigForm');
    if (!form) return;
    CONFIG_KEYS.forEach(key => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) input.value = configData[key] || '';
    });
    const showDishImagesToggle = document.getElementById('adminShowDishImages');
    const showDishImagesLabel = showDishImagesToggle?.nextElementSibling;
    const showImages = configData.show_dish_images !== 'false';
    if (showDishImagesToggle) {
      showDishImagesToggle.classList.toggle('on', showImages);
      showDishImagesToggle.setAttribute('aria-checked', showImages);
    }
    if (showDishImagesLabel) {
      showDishImagesLabel.textContent = showImages
        ? t('admin.configShowDishImagesOn')
        : t('admin.configShowDishImagesOff');
    }
    const orderingToggle = document.getElementById('adminOrderingEnabled');
    const orderingLabel = orderingToggle?.nextElementSibling;
    const orderingEnabled = configData.ordering_enabled !== 'false';
    if (orderingToggle) {
      orderingToggle.classList.toggle('on', orderingEnabled);
      orderingToggle.setAttribute('aria-checked', orderingEnabled);
    }
    if (orderingLabel) {
      orderingLabel.textContent = orderingEnabled
        ? t('admin.configOrderingEnabledOn')
        : t('admin.configOrderingEnabledOff');
    }
  } catch (e) {
    console.warn('Échec du chargement de la configuration :', e);
  }
}

$('adminSaveConfig')?.addEventListener('click', async () => {
  const form = document.getElementById('adminConfigForm');
  if (!form) return;
  const fd = new FormData(form);
  const errors = validateSettings(fd);
  if (errors.length) {
    showAlert(errors.join('\n'), t('admin.validationError'));
    return;
  }
  const updates = {};
  CONFIG_KEYS.forEach(key => { updates[key] = fd.get(key) || ''; });
  const showDishImagesToggle = document.getElementById('adminShowDishImages');
  updates.show_dish_images = showDishImagesToggle?.classList.contains('on') ? 'true' : 'false';
  const orderingToggle = document.getElementById('adminOrderingEnabled');
  updates.ordering_enabled = orderingToggle?.classList.contains('on') ? 'true' : 'false';
  configData = updates;
  const { applySettings } = await import('./menu.js');
  applySettings(updates);
  renderContact();
  upsertSettings(updates).then(r => {
    if (r !== null) showToast(t('admin.toastConfigSaved'));
    else showToast(t('admin.toastConfigError', { msg: t('admin.toastConfigErrorFallback') }));
  });
});

/* --- Logout --- */
$('adminLogoutBtn')?.addEventListener('click', async () => {
  const supabase = await supabaseReady;
  await supabase.auth.signOut();
  window.location.reload();
});
