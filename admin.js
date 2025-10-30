import { supabase } from './app.js';

const authBox = document.getElementById('auth-box');
const adminArea = document.getElementById('admin-area');
const prodList = document.getElementById('prodList');
const orderList = document.getElementById('orderList');
const stats = document.getElementById('stats');

document.getElementById('loginBtn').addEventListener('click', async ()=>{
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  document.getElementById('authMsg').textContent = error ? error.message : 'Logged in!';
  if (!error) showAdmin();
});
document.getElementById('logoutBtn').addEventListener('click', async ()=>{
  await supabase.auth.signOut(); location.reload();
});

async function showAdmin(){
  authBox.classList.add('hidden');
  adminArea.classList.remove('hidden');
  await Promise.all([loadProducts(), loadOrders(), loadStats()]);
}

async function loadProducts(){
  const { data, error } = await supabase.from('products').select('*').order('created_at',{ascending:false});
  if (error) { prodList.textContent = error.message; return; }
  prodList.innerHTML = '';
  data.forEach(p=>{
    const div = document.createElement('div');
    div.className='product';
    div.innerHTML = `
      <b>${p.title}</b> — ₱${Number(p.price).toFixed(2)} — <i>${p.category||''}</i> — ${p.available?'Available':'Hidden'}
      <div class="muted">${p.description||''}</div>
      <button data-id="${p.id}" class="edit btn">Edit</button>
      <button data-id="${p.id}" class="toggle btn">Toggle</button>
    `;
    prodList.appendChild(div);
  });

  // Edit fill
  prodList.querySelectorAll('.edit').forEach(b=>b.onclick = ()=>{
    const p = data.find(x=>x.id===b.dataset.id);
    document.getElementById('ptitle').value = p.title;
    document.getElementById('pcat').value = p.category||'';
    document.getElementById('pprice').value = p.price;
    document.getElementById('pdesc').value = p.description||'';
    document.getElementById('pavail').checked = !!p.available;
    document.getElementById('prodForm').dataset.editId = p.id;
  });

  // Toggle availability
  prodList.querySelectorAll('.toggle').forEach(b=>b.onclick = async ()=>{
    const p = data.find(x=>x.id===b.dataset.id);
    await supabase.from('products').update({available: !p.available}).eq('id', p.id);
    loadProducts();
  });
}

document.getElementById('prodForm').addEventListener('submit', async(e)=>{
  e.preventDefault();
  const body = {
    title: document.getElementById('ptitle').value,
    category: document.getElementById('pcat').value || null,
    price: Number(document.getElementById('pprice').value||0),
    description: document.getElementById('pdesc').value || null,
    available: document.getElementById('pavail').checked
  };
  const editId = e.target.dataset.editId;
  if (editId){
    await supabase.from('products').update(body).eq('id', editId);
    delete e.target.dataset.editId;
  } else {
    await supabase.from('products').insert(body);
  }
  e.target.reset();
  loadProducts();
});

async function loadOrders(){
  const { data, error } = await supabase.from('orders').select('*').order('created_at',{ascending:false});
  if (error) { orderList.textContent = error.message; return; }
  orderList.innerHTML = '';
  data.forEach(o=>{
    const div = document.createElement('div');
    div.className='product';
    div.innerHTML = `
      <b>${o.product_title}</b> — ₱${Number(o.price).toFixed(2)} — <i>${o.pay_method}</i>
      <div class="muted">Order ${o.id}<br>${o.customer_name} • ${o.customer_email} • ${o.contact_handle}</div>
      ${o.receipt_url ? `<div><a href="${o.receipt_url}" target="_blank">View receipt</a></div>`:''}
      <label>Status:
        <select data-id="${o.id}" class="status">
          ${['pending','paid','completed','cancelled'].map(s=>`<option ${s===o.status?'selected':''}>${s}</option>`).join('')}
        </select>
      </label>
      <textarea data-id="${o.id}" class="note" placeholder="Admin note...">${o.admin_note||''}</textarea>
      <button data-id="${o.id}" class="save btn">Save</button>
    `;
    orderList.appendChild(div);
  });

  orderList.querySelectorAll('.save').forEach(b=>b.onclick = async ()=>{
    const id = b.dataset.id;
    const status = orderList.querySelector(`select.status[data-id="${id}"]`).value;
    const note = orderList.querySelector(`textarea.note[data-id="${id}"]`).value;
    await supabase.from('orders').update({status, admin_note:note}).eq('id', id);
    loadStats();
  });
}

async function loadStats(){
  const { data, error } = await supabase
    .from('orders')
    .select('product_title, status')
    .in('status', ['paid','completed']);
  if (error) { stats.textContent = ''; return; }
  const countByTitle = {};
  data.forEach(o => { countByTitle[o.product_title] = (countByTitle[o.product_title]||0) + 1; });
  const lines = Object.entries(countByTitle).map(([k,v])=> `${k}: ${v} sold`);
  stats.textContent = lines.length ? lines.join(' • ') : 'No sold items yet.';
}
