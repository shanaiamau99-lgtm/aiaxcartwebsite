// script.js — handles categories, products, and PM links

// 💬 set your social usernames here
const CONTACTS = {
  telegramUsername: "your_tg_username",   // e.g. "aiaxcart"
  facebookUsername: "your.fb.username",   // e.g. "aiashop"
  instagramUsername: "your.ig.username"   // e.g. "aiaxcartshop"
};

// Load product data
async function loadData() {
  const res = await fetch("products.json");
  return res.json();
}

// Helper to create elements
function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") e.className = v;
    else if (k === "html") e.innerHTML = v;
    else e.setAttribute(k, v);
  });
  if (!Array.isArray(children)) children = [children];
  children.forEach(c => {
    if (typeof c === "string") e.appendChild(document.createTextNode(c));
    else if (c) e.appendChild(c);
  });
  return e;
}

// Build category sidebar
function buildCategories(categories) {
  const nav = document.getElementById("catlist");
  nav.innerHTML = "";
  const ul = el("ul");
  categories.forEach(cat => {
    const li = el("li");
    const a = el("a", { href: "#", onclick: `filterCategory('${cat.id}');return false;` }, cat.name);
    li.appendChild(a);
    if (cat.children && cat.children.length) {
      const sub = el("ul");
      cat.children.forEach(s => {
        const sa = el("a", { href: "#", onclick: `filterCategory('${s.id}');return false;` }, s.name);
        const sli = el("li", {}, sa);
        sub.appendChild(sli);
      });
      li.appendChild(sub);
    }
    ul.appendChild(li);
  });
  nav.appendChild(ul);
}

let DATA = null;
let currentCategory = null;

// Show products
function showProducts(list) {
  const container = document.getElementById("products");
  container.innerHTML = "";
  if (!list || list.length === 0) {
    container.appendChild(el("p", {}, "No products found in this category."));
    return;
  }
  list.forEach(p => {
    const card = el("div", { class: "card" });
    card.appendChild(el("h4", {}, p.title));
    card.appendChild(el("div", { class: "meta" }, `₱${p.price} • ${p.category}`));
    card.appendChild(el("p", {}, p.note || ""));
    const btn = el("button", { class: "btn primary" }, "Order");
    btn.addEventListener("click", () => openOrderModal(p));
    card.appendChild(el("div", { class: "actions" }, btn));
    container.appendChild(card);
  });
}

// Filter products by category
function filterCategory(catId) {
  currentCategory = catId;
  const bc = document.getElementById("breadcrumb");
  bc.textContent = "Category: " + catId;
  const filtered = DATA.products.filter(p => p.category === catId);
  showProducts(filtered);
}

// Order modal
function openOrderModal(product) {
  const modal = document.getElementById("orderModal");
  modal.classList.remove("hidden");
  const text = makeOrderText(product);
  document.getElementById("orderSummary").innerHTML = `
    <strong>${product.title}</strong>
    <div class="meta">Price: ₱${product.price}</div>
    <hr>
    <pre id="orderText">${text}</pre>
  `;
  document.getElementById("copyBtn").onclick = () => {
    copyToClipboard(text);
    alert("Copied! Paste it when you message me.");
  };
  document.getElementById("tgBtn").onclick = () => {
    copyToClipboard(text);
    openTelegramPrefill(text);
  };
  document.getElementById("fbBtn").onclick = () => {
    copyToClipboard(text);
    openMessenger();
  };
  document.getElementById("igBtn").onclick = () => {
    copyToClipboard(text);
    openInstagram();
  };
  document.getElementById("modalClose").onclick = () => modal.classList.add("hidden");
}

// Message text
function makeOrderText(p) {
  const now = new Date().toLocaleString();
  return `ORDER REQUEST
Service: ${p.title}
Category: ${p.category}
Price: ₱${p.price}
Note: ${p.note || "-"}
Time: ${now}

Name:
Contact (tg/fb/ig):
Remarks:`;
}

// Clipboard helper
function copyToClipboard(text) {
  if (navigator.clipboard) navigator.clipboard.writeText(text);
  else {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

// Social functions
function openTelegramPrefill(text) {
  const u = CONTACTS.telegramUsername;
  if (!u || u === "your_tg_username") return alert("Set your Telegram username in script.js");
  const link = `https://t.me/${u}?text=${encodeURIComponent(text)}`;
  window.open(link, "_blank");
}
function openMessenger() {
  const u = CONTACTS.facebookUsername;
  if (!u || u === "your.fb.username") return alert("Set your Facebook username in script.js");
  window.open(`https://m.me/${u}`, "_blank");
}
function openInstagram() {
  const u = CONTACTS.instagramUsername;
  if (!u || u === "your.ig.username") return alert("Set your Instagram username in script.js");
  window.open(`https://instagram.com/${u}`, "_blank");
}

// Init
window.addEventListener("DOMContentLoaded", async () => {
  DATA = await loadData();
  buildCategories(DATA.categories);
  document.getElementById("tg-profile").href = `https://t.me/${CONTACTS.telegramUsername}`;
  document.getElementById("fb-profile").href = `https://m.me/${CONTACTS.facebookUsername}`;
  document.getElementById("ig-profile").href = `https://instagram.com/${CONTACTS.instagramUsername}`;
  showProducts(DATA.products);
  window.filterCategory = filterCategory;
});
