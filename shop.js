import { supabase } from './app.js';

async function loadProducts(){
  const { data, error } = await supabase
    .from('products').select('*').eq('available', true).order('created_at', {ascending:false});
  if (error) throw error;
  return data;
}
function render(list){
  const grid = document.getElementById('product-grid');
  grid.innerHTML = '';
  list.forEach(p=>{
    const el = document.createElement('div');
    el.className = 'product';
    el.innerHTML = `
      <h3>${p.title}</h3>
      <div class="muted">${p.category || ''}</div>
      <p><b>₱${Number(p.price).toFixed(2)}</b></p>
      <p>${p.description||''}</p>
      <a class="btn" href="product.html?id=${p.id}">Order</a>
    `;
    grid.appendChild(el);
  });
}
loadProducts().then(render).catch(e=>{
  document.getElementById('product-grid').innerHTML = `<p class="muted">Error loading products: ${e.message}</p>`;
});
