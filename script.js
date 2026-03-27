let cart = JSON.parse(localStorage.getItem("cart")) || {};
renderCart();

let lastScan = "";
let lastScanTime = 0;

let scanner;

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
    {
      fps: 15,
      qrbox: { width: 250, height: 250 }
    },
    onScanSuccess
  );

});

async function onScanSuccess(decodedText) {

  let now = Date.now();

  // 🚫 BLOCK DUPLICATES (same barcode within 2 seconds)
  if (decodedText === lastScan && now - lastScanTime < 2000) {
    return;
  }

  lastScan = decodedText;
  lastScanTime = now;

  // ⏸ PAUSE SCANNING (prevents spam + freezing)
  try {
    await scanner.pause(true);
  } catch (e) {
    console.log("pause error ignored");
  }

  let barcode = decodedText;

  let product = JSON.parse(localStorage.getItem(barcode));

  if (!product) {
    let name = prompt("New product name:");
    let price = prompt("Price:");

    if (!name || !price) {
      resumeScanner();
      return;
    }

    product = { name, price };
    localStorage.setItem(barcode, JSON.stringify(product));
  }

  addToCart(product);

  // ⏱ resume after short delay (smooth scanning)
  setTimeout(() => {
    resumeScanner();
  }, 1200);
}

async function resumeScanner() {
  try {
    await scanner.resume();
  } catch (e) {
    console.log("resume error ignored");
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

    li.innerHTML = `
      <span>${item.name}</span>
      <span>$${item.price} × ${item.qty}</span>
    `;

    list.appendChild(li);
  });
}
