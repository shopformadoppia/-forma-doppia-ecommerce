

/* ==============================
   FORMA DOPPIA SETTINGS
============================== */

const STORAGE = {
 theme: "formaDoppiaTheme",
 orderNotifications: "fdOrderNotifications",
 promoNotifications: "fdPromoNotifications",
 delivery: "fdDeliveryPreferences",
 language: "fdLanguage",
 currency: "fdCurrency"
};

const defaultTheme = "classic";

const themeButtons = document.querySelectorAll("[data-theme-choice]");
const message = document.getElementById("settingsMessage");

/* NOTIFICATION ELEMENTS */

const orderNotifications = document.getElementById("orderNotifications");
const promoNotifications = document.getElementById("promoNotifications");

/* DELIVERY ELEMENTS */

const deliveryForm = document.getElementById("deliveryPreferencesForm");
const deliveryName = document.getElementById("deliveryName");
const deliveryPhone = document.getElementById("deliveryPhone");
const deliveryAddress = document.getElementById("deliveryAddress");

/* GENERAL ELEMENTS */

const languageSelect = document.getElementById("languageSelect");
const currencySelect = document.getElementById("currencySelect");
const resetButton = document.getElementById("resetSettings");


/* MESSAGE */

function showMessage(text) {
 if (!message) return;

 message.textContent = text;
 message.classList.add("show");

 clearTimeout(showMessage.timer);

 showMessage.timer = setTimeout(() => {
  message.classList.remove("show");
 }, 2500);
}


/* THEME */

function applyTheme(theme) {
 const allowedThemes = ["classic", "dark", "sage", "midnight"];

 if (!allowedThemes.includes(theme)) {
  theme = defaultTheme;
 }

 document.documentElement.setAttribute("data-theme", theme);

 themeButtons.forEach(button => {
  const selected = button.dataset.themeChoice === theme;

  button.classList.toggle("selected", selected);
  button.setAttribute("aria-pressed", selected ? "true" : "false");
 });

 localStorage.setItem(STORAGE.theme, theme);
}

const savedTheme = localStorage.getItem(STORAGE.theme) || defaultTheme;

applyTheme(savedTheme);

themeButtons.forEach(button => {
 button.addEventListener("click", () => {
  const selectedTheme = button.dataset.themeChoice;

  applyTheme(selectedTheme);
  showMessage("Theme preference saved.");
 });
});


/* NOTIFICATIONS */

function loadNotifications() {
 orderNotifications.checked =
  localStorage.getItem(STORAGE.orderNotifications) !== "false";

 promoNotifications.checked =
  localStorage.getItem(STORAGE.promoNotifications) === "true";
}

function saveNotification(key, enabled) {
 localStorage.setItem(key, enabled ? "true" : "false");
 showMessage("Notification preference saved.");
}

loadNotifications();

orderNotifications.addEventListener("change", () => {
 saveNotification(STORAGE.orderNotifications, orderNotifications.checked);
});

promoNotifications.addEventListener("change", () => {
 saveNotification(STORAGE.promoNotifications, promoNotifications.checked);
});


/* DELIVERY PREFERENCES */

function loadDeliveryPreferences() {
 const saved = localStorage.getItem(STORAGE.delivery);

 if (!saved) return;

 try {
  const data = JSON.parse(saved);

  deliveryName.value = data.name || "";
  deliveryPhone.value = data.phone || "";
  deliveryAddress.value = data.address || "";

 } catch (error) {
  console.error("Unable to load delivery preferences:", error);
 }
}

loadDeliveryPreferences();

deliveryForm.addEventListener("submit", event => {
 event.preventDefault();

 const data = {
  name: deliveryName.value.trim(),
  phone: deliveryPhone.value.trim(),
  address: deliveryAddress.value.trim()
 };

 localStorage.setItem(STORAGE.delivery, JSON.stringify(data));

 showMessage("Delivery preferences saved.");
});


/* LANGUAGE AND CURRENCY */

languageSelect.value =
 localStorage.getItem(STORAGE.language) || "English";

currencySelect.value =
 localStorage.getItem(STORAGE.currency) || "PHP";

languageSelect.addEventListener("change", () => {
 localStorage.setItem(STORAGE.language, languageSelect.value);
 showMessage("Language preference saved.");
});

currencySelect.addEventListener("change", () => {
 localStorage.setItem(STORAGE.currency, currencySelect.value);
 showMessage("Currency preference saved.");
});


/* RESET PREFERENCES */

resetButton.addEventListener("click", () => {
 const confirmed = confirm(
  "Are you sure you want to reset your settings preferences?"
 );

 if (!confirmed) return;

 Object.values(STORAGE).forEach(key => {
  localStorage.removeItem(key);
 });

 applyTheme(defaultTheme);
 loadNotifications();

 deliveryName.value = "";
 deliveryPhone.value = "";
 deliveryAddress.value = "";

 languageSelect.value = "English";
 currencySelect.value = "PHP";

 showMessage("Your preferences have been reset.");
});


/* SETTINGS NAVIGATION */

const navLinks = document.querySelectorAll(".settings-nav");

navLinks.forEach(link => {
 link.addEventListener("click", () => {
  navLinks.forEach(item => item.classList.remove("active"));
  link.classList.add("active");
 });
});

console.log("Forma Doppia Settings loaded.");
