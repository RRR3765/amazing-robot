let cart = JSON.parse(localStorage.getItem("cart")) || {};
renderCart();

let scanner;
let lastScan = "";
let lastScanTime = 0;

// 🚀 START CAMERA
Html5Qrcode.getCameras().then(devices => {

  if (!devices || devices.length === 0) {
    alert("No camera found");
    return;
  }

  let backCamera = devices.find(d =>
    d.label.toLowerCase().includes("back") ||
    d.label.toLowerCase().includes("rear")
  );

  let cameraId = backCamera ? backCamera.id : devices[0].id;

  scanner = new Html5Qrcode("reader");

  scanner.start(
    cameraId,
    { fps: 15, qrbox: { width: 250, height: 250 } },
    onScanSuccess
  );

});

// 📷 SCAN
async function onScanSuccess(decodedText) {

  let now = Date.now();

  if (decodedText === lastScan && now - lastScanTime < 2000) return;

  lastScan = decodedText;
  lastScanTime = now;

  let barcode = decodedText;

  let savedProduct = JSON.parse(localStorage.getItem("product_" + barcode));

  if (savedProduct) {
    addToCart(savedProduct);
    return;
  }

  await scanner.pause(true);

  let name = prompt("New product name:");
  let price = prompt("Price:");

  if (!name || !price) {
    resumeScanner();
    return;
  }

  let product = { barcode, name, price };

  localStorage.setItem("product_" + barcode, JSON.stringify(product));

  addToCart(product);

  setTimeout(resumeScanner, 1000);
}

// ▶️ resume
async function resumeScanner() {
  try {
    await scanner.resume();
  } catch {}
}

// 🛒 ADD TO CART
function addToCart(product) {

  let key = product.barcode;

  if (!cart[key]) {
    cart[key] = { ...product, qty: 1 };
  } else {
    cart[key].qty++;
  }

  saveCart();
}

// 🗑️ REMOVE FROM CART (NEW)
function removeFromCart(barcode) {

  if (!cart[barcode]) return;

  cart[barcode].qty--;

  if (cart[barcode].qty <= 0) {
    delete cart[barcode];
  }

  saveCart();
}

// 💾 SAVE
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// 📦 RENDER CART
function renderCart() {
  let list = document.getElementById("cart");
  list.innerHTML = "";

  Object.values(cart).forEach(item => {

    let li = document.createElement("li");

    li.innerHTML = `
      <div class="item">
        <span><b>${item.name}</b></span>
        <span>$${item.price} × ${item.qty}</span>
      </div>

      <button onclick="removeFromCart('${item.barcode}')">
        ➖
      </button>
    `;

    list.appendChild(li);
  });
}
