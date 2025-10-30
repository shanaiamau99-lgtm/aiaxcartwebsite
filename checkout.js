// after optional receipt upload + order row is created
const tgText =
  `ORDER ID: ${order.id}%0A` +
  `Product: ${product.title}%0A` +
  `Price: ₱${Number(product.price).toFixed(2)}%0A` +
  `Name: ${name}%0A` +
  `Contact: ${contact}%0A` +
  `Method: ${method.toUpperCase()}%0A` +
  `Status: pending`;

const TELEGRAM_USERNAME = "your_tg_username"; // <-- set yours
const tgLink = `https://t.me/${TELEGRAM_USERNAME}?text=${tgText}`;

document.getElementById('order-result').innerHTML =
  `✅ <b>Order placed!</b><br>
   <small>Order ID: <code>${order.id}</code></small><br><br>
   <a class="btn" href="${tgLink}" target="_blank">Message me on Telegram (prefilled)</a>
   <p class="muted">You can also message me on FB/IG and paste the Order ID.</p>`;
