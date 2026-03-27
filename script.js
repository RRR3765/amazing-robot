let cart = JSON.parse(localStorage.getItem("cart")) || {};
renderCart();

let lastScan = null;
let scanCooldown = false;

Html5Qrcode.getCameras().then(devices => {

  if (!devices || devices.length === 0) {
    alert("No camera found");
    return;
  }

  // pick back camera if possible
  let backCamera = devices.find(d =>
    d.label.toLowerCase().includes("back") ||
    d.label.toLowerCase().includes("rear")
  );

  let cameraId = backCamera ? backCamera.id : devices[0].id;

  const scanner = new Html5Qrcode("reader");

  scanner.start(
    cameraId,
    {
      fps: 15,              // smoother scanning
      qrbox: { width: 250, height: 250 }
    },
    onScanSuccess
  );

}).catch(err => {
  console.error(err);
  alert("Camera permission blocked or not supported");
});

function onScanSuccess(decodedText) {

  // prevent double scanning spam
  if (scanCooldown) return;
  if (decodedText === lastScan) return;

  lastScan = decodedText;
  scanCooldown = true;

  let barcode = decodedText;

  let product = JSON.parse(localStorage.getItem(barcode));

  if (!product) {
    let name = prompt("New product name:");
    let price = prompt("Price:");

    if (!name || !price) {
      scanCooldown = false;
      return;
    }

    product = { name, price };

    localStorage.setItem(barcode, JSON.stringify(product));
  }

  addToCart(product);

  // cooldown so it feels like real scanner (important)
  setTimeout(() => {
    scanCooldown = false;
  }, 1200);
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

    li.innerHTML = `
      <span>${item.name}</span>
      <span>$${item.price} × ${item.qty}</span>
    `;

    list.appendChild(li);
  });
}
