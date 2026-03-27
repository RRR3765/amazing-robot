let cart = JSON.parse(localStorage.getItem("cart")) || {};

// start scanner
const scanner = new Html5QrcodeScanner("reader", {
  fps: 10,
  qrbox: 250
});

scanner.render(onScanSuccess);

function onScanSuccess(decodedText) {
  let barcode = decodedText;

  let product = JSON.parse(localStorage.getItem(barcode));

  if (product) {
    addToCart(product);
  } else {
    let name = prompt("New product name:");
    let price = prompt("Price:");

    product = { name, price };

    localStorage.setItem(barcode, JSON.stringify(product));
    addToCart(product);
  }
}

function addToCart(product) {
  let key = product.name;

  if (!cart[key]) {
    cart[key] = { ...product, qty: 1 };
  } else {
    cart[key].qty++;
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  let list = document.getElementById("cart");
  list.innerHTML = "";

  Object.values(cart).forEach(item => {
    let li = document.createElement("li");
    li.textContent = `${item.name} - $${item.price} x ${item.qty}`;
    list.appendChild(li);
  });
}

renderCart();