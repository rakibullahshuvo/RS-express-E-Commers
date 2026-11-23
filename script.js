'use strict';
/* RS Express - frontend-only storefront logic (no backend). */
const CURRENCY = '৳';
const U = id => `https://images.unsplash.com/photo-${id}`;
const CATS = { fashion: 'Fashion', electronics: 'Electronics', accessories: 'Accessories', beauty: 'Beauty & Cosmetics', home: 'Home & Lifestyle' };
const CAT_IMG = { fashion: '1490481651871-ab68de25d43d', electronics: '1498049794561-7780e7231661', accessories: '1523275335684-37898b6baf30', beauty: '1596462502278-27bfdc403348', home: '1493663284031-b7e3aefcae8e' };
/* Sample catalogue. Swap img for a local file in assets/images/ whenever you like. */
const PRODUCTS = [
  { id: 1, name: 'Linen Overshirt', cat: 'fashion', price: 3490, old: 4590, rating: 4.6, reviews: 128, img: '1434389677669-e08b4cac3105', isNew: true, best: false, desc: 'Breathable relaxed-fit overshirt in washed linen blend.' },
  { id: 2, name: 'Leather Sneakers', cat: 'fashion', price: 5990, old: 7490, rating: 4.8, reviews: 342, img: '1542291026-7eec264c27ff', isNew: false, best: true, desc: 'Minimal low-top sneakers with a cushioned insole.' },
  { id: 3, name: 'Wireless Headphones', cat: 'electronics', price: 6490, old: 8490, rating: 4.7, reviews: 521, img: '1505740420928-5e560c06d30e', isNew: false, best: true, desc: 'Active noise cancelling with 30 hours of battery life.' },
  { id: 4, name: 'Smartwatch Series S', cat: 'electronics', price: 7990, old: 9990, rating: 4.5, reviews: 210, img: '1546868871-7041f2a55e12', isNew: true, best: false, desc: 'Heart-rate, sleep tracking and a bright AMOLED display.' },
  { id: 5, name: 'Classic Wristwatch', cat: 'accessories', price: 8490, old: 10990, rating: 4.9, reviews: 187, img: '1523275335684-37898b6baf30', isNew: false, best: true, desc: 'Stainless steel case with a genuine leather strap.' },
  { id: 6, name: 'Polarised Sunglasses', cat: 'accessories', price: 2490, old: 3290, rating: 4.4, reviews: 96, img: '1572635196237-14b3f281503f', isNew: true, best: false, desc: 'Lightweight frames with UV400 polarised lenses.' },
  { id: 7, name: 'Leather Backpack', cat: 'accessories', price: 5490, old: 6990, rating: 4.7, reviews: 264, img: '1553062407-98eeb64c6a62', isNew: false, best: true, desc: 'Roomy daily backpack with a padded 15-inch laptop sleeve.' },
  { id: 8, name: 'Eau de Parfum 50ml', cat: 'beauty', price: 4290, old: 5490, rating: 4.6, reviews: 143, img: '1585386959984-a4155224a1ad', isNew: true, best: false, desc: 'Warm amber and sandalwood notes that last all day.' },
  { id: 9, name: 'Daily Skincare Set', cat: 'beauty', price: 2990, old: 3990, rating: 4.8, reviews: 399, img: '1556228453-efd6c1ff04f6', isNew: false, best: true, desc: 'Cleanser, serum and moisturiser for a simple routine.' },
  { id: 10, name: 'Lounge Armchair', cat: 'home', price: 18900, old: 23900, rating: 4.7, reviews: 74, img: '1555041469-a586c61ea9bc', isNew: false, best: false, desc: 'Deep-seat armchair with solid wood legs.' },
  { id: 11, name: 'Ceramic Vase Set', cat: 'home', price: 1990, old: 2590, rating: 4.5, reviews: 88, img: '1578500494198-246f612d3b3d', isNew: true, best: false, desc: 'Set of three hand-glazed vases in neutral tones.' },
  { id: 12, name: 'Mirrorless Camera', cat: 'electronics', price: 64900, old: 74900, rating: 4.8, reviews: 61, img: '1526170375885-4d8ecf77b99f', isNew: false, best: false, desc: '24MP sensor, 4K video and a compact travel body.' }
];

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const money = n => CURRENCY + n.toLocaleString('en-US');
const pct = p => Math.round((1 - p.price / p.old) * 100);
const byId = id => PRODUCTS.find(p => p.id === Number(id));
const imgUrl = (id, w, h) => `${U(id)}?auto=format&fit=crop&w=${w}&h=${h}&q=70`;
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } };
const stars = r => `<span class="stars" role="img" aria-label="Rated ${r} out of 5">${[1, 2, 3, 4, 5].map(i => `<i class="fa-${r >= i - 0.4 ? 'solid' : 'regular'} fa-star"></i>`).join('')}</span>`;

/* ---------- state (persisted in localStorage) ---------- */
let cart = load('rs-cart', {});      // { productId: quantity }
let wish = load('rs-wish', []);      // [productId]
let filter = 'all', sort = 'featured', wishOnly = false;

/* ---------- toast ---------- */
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

/* ---------- rendering ---------- */
const card = p => `<article class="card">
  <div class="card-media"><img src="${imgUrl(p.img, 600, 750)}" alt="${p.name}" width="600" height="750" loading="lazy">
    <span class="badge">-${pct(p)}%</span>
    <button class="icon-btn wish ${wish.includes(p.id) ? 'on' : ''}" data-wish="${p.id}" aria-pressed="${wish.includes(p.id)}" aria-label="Toggle wishlist for ${p.name}"><i class="fa-${wish.includes(p.id) ? 'solid' : 'regular'} fa-heart"></i></button>
    <button class="quick" data-quick="${p.id}">Quick view</button></div>
  <div class="card-body"><span class="cat-label">${CATS[p.cat]}</span><h3>${p.name}</h3>
    <div>${stars(p.rating)}<span class="rev">(${p.reviews})</span></div>
    <p class="price"><b>${money(p.price)}</b><s>${money(p.old)}</s></p>
    <button class="btn btn-dark" data-add="${p.id}"><i class="fa-solid fa-bag-shopping"></i> Add to cart</button></div></article>`;

function sorted(list) {
  const s = [...list];
  const fn = { low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, rating: (a, b) => b.rating - a.rating, discount: (a, b) => pct(b) - pct(a) }[sort];
  return fn ? s.sort(fn) : s;
}

function renderShop() {
  let list = PRODUCTS.filter(p => (filter === 'all' || p.cat === filter) && (!wishOnly || wish.includes(p.id)));
  $('#shopTitle').textContent = wishOnly ? 'Your wishlist' : 'Trending products';
  $('#shopGrid').innerHTML = list.length ? sorted(list).map(card).join('') : `<p class="empty">${wishOnly ? 'Your wishlist is empty. Tap the heart on any product to save it.' : 'No products in this category yet.'}</p>`;
  $('#chips').innerHTML = [['all', 'All'], ...Object.entries(CATS)].map(([k, v]) => `<button class="chip" data-cat="${k}" aria-pressed="${!wishOnly && filter === k}">${v}</button>`).join('');
}

function renderAll() {
  renderShop();
  $('#newGrid').innerHTML = PRODUCTS.filter(p => p.isNew).slice(0, 4).map(card).join('');
  $('#bestGrid').innerHTML = PRODUCTS.filter(p => p.best).sort((a, b) => b.reviews - a.reviews).slice(0, 4).map(card).join('');
}

function renderCart() {
  const ids = Object.keys(cart);
  $('#cartItems').innerHTML = ids.length ? ids.map(id => { const p = byId(id), q = cart[id]; return `<div class="line-item">
    <img src="${imgUrl(p.img, 144, 180)}" alt="${p.name}"><div><h3>${p.name}</h3><p>${money(p.price)}</p>
    <div class="qty"><button data-qty="${id}:-1" aria-label="Decrease quantity">&minus;</button><span aria-live="polite">${q}</span><button data-qty="${id}:1" aria-label="Increase quantity">+</button></div>
    <button class="rm" data-remove="${id}">Remove</button></div></div>`; }).join('') : '<p class="empty">Your cart is empty.</p>';
  const total = ids.reduce((s, id) => s + byId(id).price * cart[id], 0);
  $('#cartSub').textContent = money(total);
  const n = Object.values(cart).reduce((a, b) => a + b, 0);
  $('#cartCount').textContent = n; $('#cartCount').dataset.n = n;
  $('#wishCount').textContent = wish.length; $('#wishCount').dataset.n = wish.length;
  save('rs-cart', cart); save('rs-wish', wish);
}

/* ---------- actions ---------- */
function addToCart(id, n = 1) { cart[id] = Math.min((cart[id] || 0) + n, 10); renderCart(); toast(`${byId(id).name} added to cart`); }
function setQty(id, d) { cart[id] = (cart[id] || 0) + d; if (cart[id] <= 0) delete cart[id]; renderCart(); }
function toggleWish(id) {
  id = Number(id); const on = wish.includes(id);
  wish = on ? wish.filter(w => w !== id) : [...wish, id];
  renderCart(); renderAll(); toast(on ? 'Removed from wishlist' : 'Saved to wishlist');
}
function openDrawer(open) {
  $('#cartDrawer').classList.toggle('open', open); $('#cartDrawer').setAttribute('aria-hidden', !open);
  $('#scrim').hidden = !open; document.body.style.overflow = open ? 'hidden' : '';
  if (open) $('#cartClose').focus(); else $('#cartBtn').focus();
}
function quickView(id) {
  const p = byId(id);
  $('#quickBody').innerHTML = `<img src="${imgUrl(p.img, 800, 900)}" alt="${p.name}"><div class="quick-info"><span class="cat-label">${CATS[p.cat]}</span><h2>${p.name}</h2><div>${stars(p.rating)}<span class="rev">${p.rating} (${p.reviews} reviews)</span></div>
    <p>${p.desc}</p><p class="price"><b>${money(p.price)}</b><s>${money(p.old)}</s><span class="badge" style="position:static">-${pct(p)}%</span></p>
    <button class="btn btn-brand" data-add="${p.id}">Add to cart</button></div>`;
  if (!$('#quickDlg').open) $('#quickDlg').showModal();
}
function goToShop(cat, wishMode = false) {
  filter = cat; wishOnly = wishMode; renderShop(); $('#shop').scrollIntoView();
}

/* ---------- search ---------- */
$('#searchBtn').onclick = () => { $('#searchDlg').showModal(); $('#searchInput').focus(); };
$('#searchInput').addEventListener('input', e => {
  const q = e.target.value.trim().toLowerCase();
  const hits = q ? PRODUCTS.filter(p => (p.name + CATS[p.cat]).toLowerCase().includes(q)).slice(0, 6) : [];
  $('#searchRes').innerHTML = hits.length ? hits.map(p => `<li><button data-quick="${p.id}"><img src="${imgUrl(p.img, 88, 110)}" alt=""><span><b>${p.name}</b><br><small>${money(p.price)}</small></span></button></li>`).join('') : (q ? '<li class="empty">No matching products.</li>' : '');
});

/* ---------- global click handling ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-add],[data-wish],[data-quick],[data-cat],[data-qty],[data-remove],[data-info],[data-close]');
  if (!t) { if (e.target.dialog || e.target.tagName === 'DIALOG') e.target.close(); return; }
  const d = t.dataset;
  if (d.add) addToCart(d.add);
  else if (d.wish) toggleWish(d.wish);
  else if (d.quick) { $('#searchDlg').close(); quickView(d.quick); }
  else if (d.cat) { goToShop(d.cat); }
  else if (d.qty) { const [id, n] = d.qty.split(':'); setQty(id, Number(n)); }
  else if (d.remove) { delete cart[d.remove]; renderCart(); }
  else if (d.info) { e.preventDefault(); toast(`${d.info} is not part of this demo.`); }
  else if ('close' in d) t.closest('dialog').close();
});

/* ---------- header controls ---------- */
$('#cartBtn').onclick = () => openDrawer(true);
$('#cartClose').onclick = $('#scrim').onclick = () => openDrawer(false);
$('#checkoutBtn').onclick = () => toast(Object.keys(cart).length ? 'Demo only: checkout and payment are not implemented.' : 'Your cart is empty.');
$('#wishBtn').onclick = () => goToShop('all', !wishOnly);
$('#accountBtn').onclick = () => toast('Accounts are not part of this demo.');
document.addEventListener('keydown', e => { if (e.key === 'Escape') { openDrawer(false); $('#mainNav').classList.remove('open'); } });

/* Mobile navigation */
const menuBtn = $('#menuBtn');
menuBtn.onclick = () => { const o = $('#mainNav').classList.toggle('open'); menuBtn.setAttribute('aria-expanded', o); };
$('#mainNav').addEventListener('click', e => { if (e.target.tagName === 'A') { $('#mainNav').classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); } });

/* Sorting */
$('#sortSel').onchange = e => { sort = e.target.value; renderShop(); };

/* Dark / light mode (remembers choice, falls back to system preference) */
function setTheme(t) {
  document.documentElement.dataset.theme = t; save('rs-theme', t);
  $('#themeBtn').innerHTML = `<i class="fa-solid fa-${t === 'dark' ? 'sun' : 'moon'}"></i>`;
  $('#themeBtn').setAttribute('aria-label', `Switch to ${t === 'dark' ? 'light' : 'dark'} mode`);
}
$('#themeBtn').onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
setTheme(load('rs-theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

/* Newsletter validation */
$('#newsForm').addEventListener('submit', e => {
  e.preventDefault();
  const v = $('#email').value.trim(), msg = $('#newsMsg'), ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  msg.className = ok ? 'ok' : 'err';
  msg.textContent = ok ? 'Thanks for subscribing! (Demo: nothing was sent.)' : 'Please enter a valid email address.';
  if (ok) { e.target.reset(); toast('Subscribed to the newsletter'); }
});

/* Category cards */
$('#catGrid').innerHTML = Object.entries(CATS).map(([k, v]) => `<button class="cat" data-cat="${k}"><img src="${imgUrl(CAT_IMG[k], 500, 650)}" alt="${v} collection" width="500" height="650" loading="lazy"><span><strong>${v}</strong><small>Explore <i class="fa-solid fa-arrow-right"></i></small></span></button>`).join('');

/* Fallback if a remote image fails to load */
const FALLBACK = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750"><rect width="100%" height="100%" fill="#d9dde1"/><text x="50%" y="50%" text-anchor="middle" font-family="Georgia" font-size="40" fill="#667085">RS Express</text></svg>');
document.addEventListener('error', e => { if (e.target.tagName === 'IMG' && !e.target.dataset.fb) { e.target.dataset.fb = 1; e.target.src = FALLBACK; } }, true);

$('#year').textContent = new Date().getFullYear();
renderAll(); renderCart();
