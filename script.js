let cart = JSON.parse(localStorage.getItem("cart")) || {};

// render cart on load
renderCart();

// start camera
Html5Qrcode.getCameras().then(devices => {

  if (!devices || devices.length === 0) {
    alert("No camera found");
    return;
  }

  // try to find back camera
  let backCamera = devices.find(d =>
    d.label.toLowerCase().includes("back") ||
    d.label.toLowerCase().includes("rear")
  );

  let cameraId = backCamera ? backCamera.id : devices[0].id;

  const scanner = new Html5Qrcode("reader");

  scanner.start(
    cameraId,
    {
      fps: 10,
      qrbox: 250
    },
    onScanSuccess
  );

}).catch(err => {
  console.error(err);
  alert("Camera permission denied or not supported");
});

let scanning = true;

function onScanSuccess(decodedText) {
  if (!scanning) return;

  scanning = false;

  let barcode = decodedText;

  let product = JSON.parse(localStorage.getItem(barcode));

  if (!product) {
    let name = prompt("New product name:");
    let price = prompt("Price:");

    if (!name || !price) {
      scanning = true;
      return;
    }

    product = { name, price };

    localStorage.setItem(barcode, JSON.stringify(product));
  }

  addToCart(product);

  // small delay so it doesn't double-scan
  setTimeout(() => {
    scanning = true;
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
