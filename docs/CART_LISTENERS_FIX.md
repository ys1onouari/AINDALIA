# CART LISTENERS FIX — Listeners accumulés sur document

## Problème

**Symptôme visible :** Après avoir changé de langue (ou re-visité la page menu dans une SPA), chaque clic sur le bouton "+" d'un plat ajoute une quantité multiple au lieu de 1. Par exemple, après 2 changements de langue, un seul clic ajoute 3 unités. Le badge du panier affiche un nombre anormalement élevé.

**Cause racine technique :** La fonction `setupMenuEventListeners()` attache des listeners anonymes sur `document` et `#cartItems` via `addEventListener`. Elle est appelée à chaque exécution de la fonction d'initialisation du menu (`initMenu()`). Si `initMenu()` est rappelée (changement de langue, retour sur la page menu dans une SPA), les listeners s'accumulent sans jamais être retirés — il n'y a aucun `removeEventListener` nulle part.

Avec N listeners sur `document`, un clic sur "+" déclenche `addToCart()` N fois. Le premier appel pousse l'item dans le panier, les N-1 suivants incrémentent la quantité. L'item n'est pas dupliqué dans le tableau, mais sa `qty` est N fois plus élevée que prévu.

---

## Diagnostic rapide

### Test manuel

1. Ouvrir la page, ajouter un plat → vérifier qty = 1 dans le panier
2. Changer de langue (FR → EN)
3. Cliquer sur le même plat → la qty passe à **3** (au lieu de 2)
4. Changer de langue 2 fois de plus → cliquer → la qty passe à **6** au lieu de 3
5. À chaque changement de langue, le multiplicateur augmente

### Ce qu'on cherche dans le code

Chercher dans le projet :

```
function setupMenuEventListeners()
```

Si cette fonction existe et qu'elle est appelée depuis une fonction d'initialisation (`initMenu()`, `initPage()`, etc.) qui peut être exécutée plusieurs fois dans la session, le bug est présent.

Chercher ensuite :

```
document.addEventListener('click'
```

Si ce ou ces listeners sont attachés dans `setupMenuEventListeners()` avec des callbacks anonymes (pas de référence nommée), et qu'il n'y a pas de `removeEventListener` correspondant, le bug est confirmé.

---

## Les 3 fixes à appliquer

### Fix 1 — Idempotence de `setupMenuEventListeners()`

**Objectif :** Faire en sorte que `setupMenuEventListeners()` ne fasse son travail qu'une seule fois, même si elle est appelée N fois.

**Étape 1 — Ajouter deux flags module-level**

Chercher dans le fichier :

```js
let cart = [];
```

Ajouter **après** `let cart = []` (et après les éventuelles autres variables déclarées à la suite) :

```js
let _listenersInitialized = false;
```

**Étape 2 — Ajouter le guard en tête de la fonction**

Chercher :

```js
function setupMenuEventListeners() {
```

Remplacer par :

```js
function setupMenuEventListeners() {
  if (_listenersInitialized) return;
  _listenersInitialized = true;
```

**Code final attendu :**

```js
function setupMenuEventListeners() {
  if (_listenersInitialized) return;
  _listenersInitialized = true;
  $('filterChips')?.addEventListener('click', (e) => {
    // ... reste du code inchangé ...
  });
  document.addEventListener('click', (e) => {
    // ... reste du code inchangé ...
  });
  // ...
}
```

---

### Fix 2 — `stopImmediatePropagation`

**Objectif :** Si malgré le Fix 1 des listeners se sont déjà accumulés avant le correctif (ou si d'autres chemins de code attachent des listeners sur `document`), cette modification empêche les autres listeners du même élément de s'exécuter.

Chercher dans `setupMenuEventListeners()` :

```js
    e.stopPropagation();
```

Remplacer par :

```js
    e.stopImmediatePropagation();
```

**Avant :**

```js
    const action = btn.dataset.action;
    e.stopPropagation();
    if (action === 'cart') {
      addToCart(id);
    } else if (action === 'order') {
      orderWhatsApp(id);
    }
```

**Après :**

```js
    const action = btn.dataset.action;
    e.stopImmediatePropagation();
    if (action === 'cart') {
      addToCart(id);
    } else if (action === 'order') {
      orderWhatsApp(id);
    }
```

---

### Fix 3 — Guard anti-clics multiples sur `addToCart`

**Objectif :** Empêcher `addToCart()` d'être exécutée plusieurs fois en rafale (double-clic, clics très rapides), ce qui pourrait contourner les autres protections ou amplifier le problème si d'autres listeners survivent.

**Étape 1 — Ajouter un flag module-level**

Chercher :

```js
let _listenersInitialized = false;
```

Ajouter **après** (ou à côté des autres flags) :

```js
let _addingToCart = false;
```

**Étape 2 — Ajouter le guard en tête de la fonction**

Chercher :

```js
function addToCart(id) {
  if (!isOrderingEnabled()) return;
  const dish = MENU_DATA.find(d => d.id === id);
```

Remplacer par :

```js
function addToCart(id) {
  if (_addingToCart) return;
  _addingToCart = true;
  setTimeout(() => { _addingToCart = false; }, 300);
  if (!isOrderingEnabled()) return;
  const dish = MENU_DATA.find(d => d.id === id);
```

**Note :** Le délai de 300 ms est un équilibre entre réactivité et protection. Ajustable selon le contexte (200-500 ms). Le flag se réarme automatiquement via `setTimeout`, donc l'utilisateur peut cliquer à nouveau après 300 ms sans intervention manuelle.

---

## Vérifications post-fix

Une fois les 3 fixes appliqués, exécuter ces tests manuels :

| # | Test | Résultat attendu |
|---|---|---|
| 1 | Charger la page → cliquer "+" sur un plat → ouvrir le panier | qty = 1 |
| 2 | Changer de langue (FR → EN) → cliquer "+" sur le même plat | qty = 2 (incrémentation normale) |
| 3 | Changer de langue 3 fois de suite → cliquer "+" | qty s'incrémente de 1 (pas 3 ou 4) |
| 4 | Double-clic rapide sur "+" | qty = 1 (le second clic est bloqué) |
| 5 | Boutons +/- dans le panier | fonctionnent normalement |
| 6 | Bouton remove (✕) dans le panier | fonctionne normalement |
| 7 | Checkout WhatsApp | fonctionne normalement |
| 8 | Filtres par catégorie | fonctionnent normalement |
| 9 | Navigation SPA (pages) | fonctionne normalement |

---

## Note pour `AGENTS.md`

Ajouter dans la section **Gotchas** (après les lignes existantes, avant la dernière ligne sur les secrets) :

```
- `setupMenuEventListeners()` is idempotent (guarded by `_listenersInitialized`) — do NOT move it out of `initMenu()`, the flag ensures it runs once
```
