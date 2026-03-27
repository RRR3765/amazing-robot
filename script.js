let cart = JSON.parse(localStorage.getItem("cart")) || {};
renderCart();

let scanner;
let lastScan = "";
let lastScanTime = 0;

// 🚀 Start camera
Html5Qrcode.getCameras().then(devices => {

  if (!devices || devices.length === 0) {
    alert("No camera found");
    return;
  }

  // 🎯 try to pick back camera
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

}).catch(err => {
  console.error(err);
  alert("Camera permission denied or not supported");
});

// 📷 MAIN SCAN FUNCTION
async function onScanSuccess(decodedText) {

  let now = Date.now();

  // 🚫 prevent duplicate scans (same barcode spam)
  if (decodedText === lastScan && now - lastScanTime < 2000) {
    return;
  }

  lastScan = decodedText;
  lastScanTime = now;

  let barcode = decodedText;

  // 🧠 CHECK IF PRODUCT ALREADY EXISTS
  let savedProduct = JSON.parse(localStorage.getItem("product_" + barcode));

  if (savedProduct) {
    // ✅ already known → just add to cart
    addToCart(savedProduct);
    return;
  }

  // ⏸ pause scanner while user inputs data (prevents freezing/bugs)
  try {
    await scanner.pause(true);
  } catch (e) {
    console.log("pause ignored");
  }

  // ❌ NEW PRODUCT → ask once
  let name = prompt("New product name:");
  let price = prompt("Price:");

  if (!name || !price) {
    resumeScanner();
    return;
  }

  let product = {
    barcode,
    name,
    price
  };

  // 💾 SAVE FOR FUTURE SCANS (THIS IS THE MEMORY SYSTEM)
  localStorage.setItem("product_" + barcode, JSON.stringify(product));

  // 🛒 ADD TO CART
  addToCart(product);

  // ⏱ resume scanner after short delay
  setTimeout(() => {
    resumeScanner();
  }, 1000);
}

// ▶️ resume scanner safely
async function resumeScanner() {
  try {
    await scanner.resume();
  } catch (e) {
    console.log("resume ignored");
  }
}

// 🛒 ADD TO CART
function addToCart(product) {

  let key = product.barcode;

  if (!cart[key]) {
    cart[key] = {
      name: product.name,
      price: product.price,
      barcode: product.barcode,
      qty: 1
    };
  } else {
    cart[key].qty++;
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// 📦 RENDER CART UI
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
