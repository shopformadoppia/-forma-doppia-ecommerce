
import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const $ = (s) => document.querySelector(s);

const peso = n => "₱" + Number(n).toLocaleString("en-PH", {
  maximumFractionDigits: 2
});

/* =================================
   PRODUCT INFORMATION
================================= */

const products = [
  {
    id: "p1",
    name: "Original Color",
    price: 2000,
    img: "images/product-1.png",
    finish: "Original natural wood finish",
    shortDescription: "A natural wood-look convertible chair-ladder with a simple and timeless appearance."
  },
  {
    id: "p2",
    name: "Whitewash Wood",
    price: 2300,
    img: "images/product-2.png",
    finish: "Whitewash wood finish",
    shortDescription: "A light whitewash finish that gives your furniture a clean and refreshing look."
  },
  {
    id: "p3",
    name: "Walnut Finish",
    price: 2300,
    img: "images/product-3.png",
    finish: "Walnut brown finish",
    shortDescription: "A warm walnut-inspired finish designed to complement classic and modern interiors."
  },
  {
    id: "p4",
    name: "Sage Green",
    price: 2300,
    img: "images/product-4.png",
    finish: "Sage green finish",
    shortDescription: "A soft sage green finish that adds a calm and natural touch to your space."
  },
  {
    id: "p5",
    name: "Matte Black",
    price: 2300,
    img: "images/product-5.png",
    finish: "Matte black finish",
    shortDescription: "A minimalist matte black finish for a clean and modern furniture style."
  },
  {
    id: "p6",
    name: "With Cushion",
    price: 2500,
    img: "images/product-6.png",
    finish: "Cushioned seating finish",
    shortDescription: "A convertible chair-ladder variation with an added cushion for a more comfortable seating experience."
  }
];

/* SAMPLE SPECIFICATIONS FOR SCHOOL PROJECT DEMONSTRATION */

const productSpecifications = {
  productType: "Convertible Chair-Ladder Furniture",
  material: "Wooden frame with metal connecting hardware",
  dimensions: "Chair mode: 45 × 45 × 60 cm; Ladder mode: 45 × 55 × 90 cm",
  weight: "Approximately 6.5 kg",
  loadCapacity: "70 kg",
  inclusions: [
    "1 Forma Doppia convertible chair-ladder",
    "Product care and usage guide"
  ],
  features: [
    "Dual-purpose chair and ladder design",
    "Space-saving furniture concept",
    "Convertible design for different household needs",
    "Designed for practical indoor use"
  ],
  usage: [
    "Place the furniture on a stable and level surface.",
    "Check that the structure is properly positioned before use.",
    "Use the chair configuration for seating.",
    "Use the ladder configuration only when properly set up.",
    "Avoid sudden movements and uneven weight distribution."
  ],
  care: [
    "Wipe the surface using a clean, soft cloth.",
    "Keep the furniture dry and away from excessive moisture.",
    "Avoid harsh chemicals and abrasive cleaning materials.",
    "Check connecting hardware regularly.",
    "Store in a clean and dry location when not in use."
  ],
  safety: [
    "Maximum sample load capacity: 70 kg.",
    "Do not exceed the stated sample capacity.",
    "Always use on a flat and stable surface.",
    "Do not use if the furniture appears damaged or unstable.",
    "Keep children supervised when the ladder configuration is used."
  ]
};

let cart = [];

try {
  cart = JSON.parse(localStorage.getItem("fd_cart") || "[]");
} catch {
  cart = [];
}

function saveCart() {
  localStorage.setItem("fd_cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = cart.reduce((n, x) => n + x.qty, 0);
  });
}

function addToCart(id, qty = 1) {
  const found = cart.find(x => x.id === id);

  if (found) found.qty += qty;
  else cart.push({ id, qty });

  saveCart();
  alert("Added to cart!");
}

function setCartForBuyNow(id) {
  cart = [{ id, qty: 1 }];
  saveCart();
  location.href = "cart.html";
}

function openModal(id) {
  $("#" + id)?.classList.add("show");
}

function closeModal(id) {
  $("#" + id)?.classList.remove("show");
}

window.closeModal = closeModal;

/* =================================
   NAVIGATION
================================= */

function nav() {
  const header = $("#siteHeader");
  if (!header) return;

  header.innerHTML = `
    <div class="header-inner">

      <a class="brand" href="home.html">
        <img src="images/logo.png" alt="Forma Doppia logo">
        <span>
          FORMA DOPPIA
          <small>STEP UP YOUR COMFORT</small>
        </span>
      </a>

      <button
        class="menu-toggle"
        id="menuToggle"
        type="button"
        aria-label="Open menu"
        aria-expanded="false">
        ☰
      </button>

      <nav class="nav-links" id="navLinks">
        <a href="home.html">Home</a>
        <a href="shop.html">Shop Now</a>
        <a href="about.html">About Us</a>
        <a href="delivery.html">Delivery</a>
        <a href="policies.html">Policies</a>
        <a href="faqs.html">FAQs</a>
        <a href="contact.html">Contact</a>
        <button id="accountNav" type="button">Sign In</button>
        <a href="cart.html">
          Cart <span class="cart-count">0</span>
        </a>
      </nav>

    </div>
  `;

  const menuToggle = $("#menuToggle");
  const navLinks = $("#navLinks");

  menuToggle?.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle?.setAttribute("aria-expanded", "false");
    });
  });

  $("#accountNav")?.addEventListener("click", async () => {
    navLinks?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");

    if (auth.currentUser) {
      if (confirm("Are you sure you want to sign out?")) {
        await signOut(auth);
        alert("You have signed out.");
      }
    } else {
      openModal("accountModal");
    }
  });

  updateCartCount();
}

nav();

/* ACCOUNT STATUS */

onAuthStateChanged(auth, user => {
  const button = $("#accountNav");

  if (button) {
    button.textContent = user ? "Sign Out" : "Sign In";
  }
});

/* =================================
   ACCOUNT MODAL
================================= */

function createAccountModal() {
  if ($("#accountModal")) return;

  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop" id="accountModal">
      <div class="modal">

        <button class="modal-close"
          onclick="closeModal('accountModal')">×</button>

        <h2>Account Access</h2>

        <div id="authMessage" class="notice">
          Sign in or create your Forma Doppia account.
        </div>

        <form id="loginForm" class="form-stack">
          <label>
            Email
            <input type="email" id="loginEmail" required>
          </label>

          <label>
            Password
            <input type="password" id="loginPassword" required>
          </label>

          <button class="btn" type="submit">SIGN IN</button>
        </form>

        <hr style="margin:18px 0">

        <h3>Create an Account</h3>

        <form id="registerForm" class="form-stack">
          <label>
            Full Name
            <input id="registerName" required>
          </label>

          <label>
            Email
            <input type="email" id="registerEmail" required>
          </label>

          <label>
            Password
            <input type="password" id="registerPassword"
              minlength="6" required>
          </label>

          <label>
            Phone Number
            <input id="registerPhone" required>
          </label>

          <button class="btn gold" type="submit">
            CREATE ACCOUNT
          </button>
        </form>

        <p style="font-size:12px;margin-top:12px">
          You may browse as a guest without signing in.
          Checkout requires an account.
        </p>

        <button class="btn outline"
          style="margin-top:10px"
          onclick="closeModal('accountModal')">
          CONTINUE AS GUEST
        </button>

      </div>
    </div>

    <div class="modal-backdrop" id="welcomeModal">
      <div class="modal">

        <button class="modal-close"
          onclick="closeModal('welcomeModal')">×</button>

        <p class="eyebrow">Welcome to Forma Doppia</p>

        <h2>Enjoy 12% OFF your first purchase!</h2>

        <p>
          Your welcome discount is available for your
          first eligible order.
        </p>

        <button class="btn"
          onclick="closeModal('welcomeModal')">
          CONTINUE SHOPPING
        </button>

      </div>
    </div>
  `);

  /* SIGN IN */

  $("#loginForm").addEventListener("submit", async e => {
    e.preventDefault();

    const msg = $("#authMessage");

    try {
      await signInWithEmailAndPassword(
        auth,
        $("#loginEmail").value,
        $("#loginPassword").value
      );

      msg.textContent = "Successfully signed in.";

      closeModal("accountModal");
      location.reload();

    } catch (err) {
      msg.textContent = err.message;
    }
  });

  /* CREATE ACCOUNT */

  $("#registerForm").addEventListener("submit", async e => {
    e.preventDefault();

    const msg = $("#authMessage");

    try {
      const name = $("#registerName").value.trim();
      const email = $("#registerEmail").value.trim();
      const phone = $("#registerPhone").value.trim();

      const cred = await createUserWithEmailAndPassword(
        auth,
        email,
        $("#registerPassword").value
      );

      await updateProfile(cred.user, {
        displayName: name
      });

      await setDoc(doc(db, "customers", cred.user.uid), {
        name,
        email,
        phone,
        createdAt: serverTimestamp(),
        welcomeDiscount: {
          percent: 12,
          status: "available"
        }
      });

      closeModal("accountModal");
      openModal("welcomeModal");

    } catch (err) {
      msg.textContent = err.message;
    }
  });
}

createAccountModal();

/* =================================
   PRODUCTS
================================= */

function renderProducts() {
  const grid = $("#productGrid");
  if (!grid) return;

  const draw = list => {
    grid.innerHTML = list.map(p => `
      <article class="product-card">

        <img src="${p.img}"
          alt="${p.name}"
          data-detail="${p.id}">

        <div class="product-info">

          <h3 data-detail="${p.id}">${p.name}</h3>

          <div class="price">${peso(p.price)}</div>

          <p style="font-size:13px;color:#777;margin:5px 0 12px">
            ${p.shortDescription}
          </p>

          <span class="detail-link"
            data-detail="${p.id}">
            View Full Details
          </span>

          <div class="card-actions">

            <button class="btn" data-add="${p.id}">
              ADD TO CART
            </button>

            <button class="btn gold" data-buy="${p.id}">
              BUY NOW
            </button>

          </div>
        </div>
      </article>
    `).join("");
  };

  draw(products);

  grid.addEventListener("click", e => {
    const detail = e.target.closest("[data-detail]");
    const add = e.target.closest("[data-add]");
    const buy = e.target.closest("[data-buy]");

    if (detail) showDetails(detail.dataset.detail);
    if (add) addToCart(add.dataset.add);
    if (buy) setCartForBuyNow(buy.dataset.buy);
  });

  $("#productSearch")?.addEventListener("input", e => {
    const q = e.target.value.toLowerCase();

    draw(
      products.filter(p =>
        p.name.toLowerCase().includes(q)
      )
    );
  });
}

/* =================================
   COMPLETE PRODUCT DETAILS
================================= */

function showDetails(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  const specs = productSpecifications;

  const featuresHTML = specs.features.map(item =>
    `<li>${item}</li>`
  ).join("");

  const inclusionsHTML = specs.inclusions.map(item =>
    `<li>${item}</li>`
  ).join("");

  const usageHTML = specs.usage.map(item =>
    `<li>${item}</li>`
  ).join("");

  const careHTML = specs.care.map(item =>
    `<li>${item}</li>`
  ).join("");

  const safetyHTML = specs.safety.map(item =>
    `<li>${item}</li>`
  ).join("");

  $("#detailContent").innerHTML = `

    <img src="${p.img}"
      alt="${p.name}"
      style="width:100%;max-height:280px;object-fit:contain;margin-bottom:15px">

    <p class="eyebrow">Forma Doppia Collection</p>

    <h2>${p.name}</h2>

    <div class="price">${peso(p.price)}</div>

    <p style="margin-bottom:18px">
      ${p.shortDescription}
      This variation combines a functional furniture concept
      with a design intended to make everyday spaces more versatile.
    </p>

    <div class="panel" style="margin-bottom:18px">

      <h3 style="color:var(--green);margin-bottom:10px">
        Product Overview
      </h3>

      <p>
        The Forma Doppia Convertible Chair-Ladder is a
        dual-purpose furniture concept designed to function
        as both a chair and a ladder. It offers a practical
        furniture solution for spaces where functionality
        and efficient use of space are important.
      </p>

    </div>

    <div class="policy-block">

      <h3>Key Features</h3>

      <ul class="info-list">
        ${featuresHTML}
      </ul>

    </div>

    <div class="policy-block">

      <h3>Product Specifications</h3>

      <p style="font-size:12px;color:var(--muted);margin-bottom:10px">
        Sample Project Specifications
      </p>

      <ul class="info-list">

        <li>
          <b>Product Name:</b>
          Forma Doppia ${p.name}
        </li>

        <li>
          <b>Product Type:</b>
          ${specs.productType}
        </li>

        <li>
          <b>Finish:</b>
          ${p.finish}
        </li>

        <li>
          <b>Material:</b>
          ${specs.material}
        </li>

        <li>
          <b>Sample Dimensions:</b>
          ${specs.dimensions}
        </li>

        <li>
          <b>Sample Product Weight:</b>
          ${specs.weight}
        </li>

        <li>
          <b>Sample Maximum Load Capacity:</b>
          ${specs.loadCapacity}
        </li>

        <li>
          <b>Color / Variation:</b>
          ${p.name}
        </li>

        ${p.id === "p6" ? `
          <li>
            <b>Additional Feature:</b>
            Cushioned seating
          </li>
        ` : ""}

      </ul>

    </div>

    <div class="policy-block">

      <h3>What's Included</h3>

      <ul class="info-list">
        ${inclusionsHTML}
        ${p.id === "p6" ? "<li>Seat cushion</li>" : ""}
      </ul>

    </div>

    <div class="policy-block">

      <h3>How to Use</h3>

      <ul class="info-list">
        ${usageHTML}
      </ul>

    </div>

    <div class="policy-block">

      <h3>Care and Maintenance</h3>

      <ul class="info-list">
        ${careHTML}
      </ul>

    </div>

    <div class="policy-block">

      <h3>Safety Reminders</h3>

      <ul class="info-list">
        ${safetyHTML}
      </ul>

    </div>

    <div class="notice">
      <b>Project Demonstration Notice:</b>
      The dimensions, weight, material, and other specifications
      displayed here are illustrative sample information created
      for the Forma Doppia school project. They are not verified
      measurements or certified product specifications.
    </div>

    <div class="two-buttons">

      <button class="btn"
        onclick="window.addProduct('${p.id}')">
        ADD TO CART
      </button>

      <button class="btn gold"
        onclick="window.buyProduct('${p.id}')">
        BUY NOW
      </button>

    </div>

  `;

  openModal("detailModal");
}

window.addProduct = addToCart;
window.buyProduct = setCartForBuyNow;

renderProducts();

/* =================================
   CART
================================= */

function renderCart() {
  const target = $("#cartItems");
  if (!target) return;

  if (!cart.length) {
    target.innerHTML = "<p>Your cart is empty.</p>";
    $("#cartSummary").innerHTML = "";
    return;
  }

  target.innerHTML = cart.map(item => {
    const p = products.find(x => x.id === item.id);
    if (!p) return "";

    return `
      <div class="cart-row">

        <img src="${p.img}" alt="${p.name}">

        <div>
          <b>${p.name}</b>
          <div>${peso(p.price)}</div>

          <div class="qty-controls">
            <button data-minus="${p.id}">−</button>
            <span>${item.qty}</span>
            <button data-plus="${p.id}">+</button>
            <button data-remove="${p.id}">Remove</button>
          </div>
        </div>

        <strong>${peso(p.price * item.qty)}</strong>

      </div>
    `;
  }).join("");

  const subtotal = cart.reduce((sum, item) => {
    const p = products.find(x => x.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);

  $("#cartSummary").innerHTML = `
    <div class="total-line">
      <b>Subtotal</b>
      <b>${peso(subtotal)}</b>
    </div>

    <button class="btn" id="checkoutButton">
      PROCEED TO CHECKOUT
    </button>
  `;

  target.onclick = e => {
    const minus = e.target.closest("[data-minus]")?.dataset.minus;
    const plus = e.target.closest("[data-plus]")?.dataset.plus;
    const remove = e.target.closest("[data-remove]")?.dataset.remove;

    if (minus) {
      const x = cart.find(i => i.id === minus);
      x.qty--;

      if (x.qty < 1) {
        cart = cart.filter(i => i.id !== minus);
      }
    }

    if (plus) {
      cart.find(i => i.id === plus).qty++;
    }

    if (remove) {
      cart = cart.filter(i => i.id !== remove);
    }

    saveCart();
    renderCart();
  };

  $("#checkoutButton")?.addEventListener("click", () => checkout());
}

renderCart();

/* =================================
   CHECKOUT
================================= */

async function checkout() {
  if (!auth.currentUser) {
    openModal("accountModal");
    return;
  }

  const existing = $("#checkoutModal");

  if (existing) {
    openModal("checkoutModal");
    return;
  }

  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop show" id="checkoutModal">

      <div class="modal">

        <button class="modal-close"
          onclick="closeModal('checkoutModal')">×</button>

        <h2>Checkout</h2>

        <form id="checkoutForm" class="form-stack">

          <label>
            Full Name
            <input id="customerName" required
              value="${auth.currentUser.displayName || ""}">
          </label>

          <label>
            Email
            <input id="customerEmail" type="email" required
              value="${auth.currentUser.email || ""}">
          </label>

          <label>
            Phone Number
            <input id="customerPhone" required>
          </label>

          <label>
            Complete Delivery Address
            <textarea id="customerAddress" required></textarea>
          </label>

          <label>
            Payment Method
            <select id="paymentMethod" required>
              <option value="">Choose payment</option>
              <option>GCash</option>
              <option>Maya</option>
              <option>Cash on Delivery</option>
            </select>
          </label>

          <label>
            Payment Reference (if applicable)
            <input id="paymentReference">
          </label>

          <label>
            Order Notes
            <textarea id="orderNotes"></textarea>
          </label>

          <div class="notice" id="checkoutTotal"></div>

          <button class="btn gold" type="submit">
            PLACE ORDER
          </button>

        </form>

        <p id="checkoutMessage"></p>

      </div>
    </div>
  `);

  const userRef = doc(db, "customers", auth.currentUser.uid);
  let customerData = {};

  try {
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      customerData = snap.data();
    }
  } catch {}

  if (customerData.phone) {
    $("#customerPhone").value = customerData.phone;
  }

  const subtotal = cart.reduce((s, i) => {
    const p = products.find(p => p.id === i.id);
    return s + (p ? p.price * i.qty : 0);
  }, 0);

  const discountData = customerData.welcomeDiscount;

  const hasDiscount =
    discountData?.percent === 12 &&
    discountData?.status === "available";

  const discount = hasDiscount ? subtotal * 0.12 : 0;

  $("#checkoutTotal").innerHTML = `
    Subtotal: ${peso(subtotal)}<br>
    Welcome discount: ${peso(discount)}<br>
    <b>Estimated total: ${peso(subtotal - discount)}</b>
  `;

  $("#checkoutForm").addEventListener("submit", async e => {
    e.preventDefault();

    const message = $("#checkoutMessage");

    try {
      const items = cart.map(i => {
        const p = products.find(x => x.id === i.id);

        return {
          productId: p.id,
          name: p.name,
          price: p.price,
          quantity: i.qty
        };
      });

      await addDoc(collection(db, "orders"), {
        userId: auth.currentUser.uid,
        customerName: $("#customerName").value,
        email: $("#customerEmail").value,
        phone: $("#customerPhone").value,
        deliveryAddress: $("#customerAddress").value,
        paymentMethod: $("#paymentMethod").value,
        paymentReference: $("#paymentReference").value,
        notes: $("#orderNotes").value,

        items,
        subtotal,
        discount,
        estimatedTotal: subtotal - discount,

        orderStatus: "pending_confirmation",
        paymentStatus: "pending",
        createdAt: serverTimestamp()
      });

      if (hasDiscount) {
        await updateDoc(userRef, {
          "welcomeDiscount.status": "redeemed"
        });
      }

      cart = [];
      saveCart();

      message.textContent =
        "Your order has been submitted. Thank you for shopping with Forma Doppia!";

      $("#checkoutForm").remove();

      renderCart();

    } catch (err) {
      message.textContent =
        "Unable to submit order: " + err.message;
    }
  });
}

/* REFRESH CART IF NEEDED */

if (location.hash === "#cart") {
  renderCart();
}

/* =================================
   CLICKWRAP ACCOUNT ACCESS
================================= */

const params = new URLSearchParams(location.search);

if (params.get("account") === "1") {
  openModal("accountModal");
}

if (params.get("guest") === "1") {
  closeModal("accountModal");
}
