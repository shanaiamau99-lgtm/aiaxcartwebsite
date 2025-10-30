import { supabase, PAYMENT } from './app.js';

const qs = new URLSearchParams(location.search);
const id = qs.get('id');
let product = null;

function payBox(method){
  const p = PAYMENT[method];
  return `
    <strong>${p.label}</strong>
    <div class="pay-flex">
      <img src="${p.qr}" alt="${p.label} QR">
      <div><p><b>Scan & pay exact amount.</b></p></div>
    </div>`;
}

async function getProduct(){
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

async function uploadReceipt(file, orderId){
  if (!file) return null;
  const path = `${orderId}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from('receipts').upload(path, file);
  if (error) throw error;
  const { data: pub } = supabase.storage.from('receipts').getPublicUrl(path);
  return pub.publicUrl;
}

async function init(){
  if (!id) { document.body.innerHTML = 'No product selected.'; return; }
  product = await getProduct();
  document.getElementById('product-card').innerHTML = `
    <h2>${product.title}</h2>
    <div class="muted">${product.category||''}</div>
    <p><b>Price:</b> ₱${Number(product.price).toFixed(2)}</p>
    <p>${product.description||''}</p>
  `;
  const box = document.getElementById('pay-box');
  box.innerHTML = payBox('gcash');
  document.querySelectorAll('input[name="pay"]').forEach(r=>{
    r.addEventListener('change', ()=> box.innerHTML = payBox(r.value));
  });

  document.getElementById('order-form').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const name = document.getElementById('cust-name').value.trim();
    const email = document.getElementById('cust-email').value.trim();
    const contact = document.getElementById('cust-contact').value.trim();
    const method = document.querySelector('input[name="pay"]:checked').value;
    const file = document.getElementById('receipt').files[0];

    // create order row
    const { data: order, error } = await supabase.from('orders')
      .insert({
        product_id: product.id, product_title: product.title, price: product.price,
        customer_name: name, customer_email: email, contact_handle: contact,
        pay_method: method, status: 'pending'
      }).select().single();

    if (error) {
      document.getElementById('order-result').textContent = 'Error: ' + error.message;
      return;
    }

    // upload receipt (optional)
    try {
      const url = await uploadReceipt(file, order.id);
      if (url) await supabase.from('orders').update({ receipt_url: url }).eq('id', order.id);
    } catch(_) {}

    document.getElementById('order-result').textContent =
      `Order placed! ID: ${order.id}. Pay via ${method.toUpperCase()} and message me with this ID.`;
  });
}
init().catch(err => document.getElementById('order-result').textContent = err.message);
