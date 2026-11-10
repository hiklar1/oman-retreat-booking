const filters = document.querySelector("#filters");
const cards = [...document.querySelectorAll(".stay-card")];
const count = document.querySelector("#results-count");
const emptyState = document.querySelector("#empty-state");
const governorate = document.querySelector("#governorate");
const search = document.querySelector("#search");
const maxPriceInput = document.querySelector("#price");
const poolFilter = document.querySelector("#pool-filter");
const regionChips = [...document.querySelectorAll(".region-chip")];
const dialog = document.querySelector("#booking-dialog");
const bookingForm = document.querySelector("#booking-form");
const checkIn = document.querySelector("#check-in");
const checkOut = document.querySelector("#check-out");
const guestCount = document.querySelector("#guest-count");
const numberFormat = new Intl.NumberFormat("ar-OM");

let selectedPrice = 68;
let poolOnly = false;

function updateListings() {
  const region = governorate.value;
  const query = search.value.trim().toLocaleLowerCase("ar");
  const maxPrice = maxPriceInput.value === "" ? Infinity : Number(maxPriceInput.value);
  let visibleCount = 0;

  for (const card of cards) {
    const matches = (!region || card.dataset.governorate === region)
      && card.dataset.location.toLocaleLowerCase("ar").includes(query)
      && Number(card.dataset.price) <= maxPrice
      && (!poolOnly || card.dataset.pool === "true");
    card.hidden = !matches;
    if (matches) visibleCount += 1;
  }

  count.textContent = `${numberFormat.format(visibleCount)} نماذج توضيحية`;
  emptyState.hidden = visibleCount > 0;
}

function setRegion(region) {
  governorate.value = region;
  for (const chip of regionChips) {
    const selected = chip.dataset.region === region;
    chip.classList.toggle("selected", selected);
    chip.setAttribute("aria-pressed", String(selected));
  }
  setRegion(governorate.value);
}

function formatPrice(value) {
  return numberFormat.format(value);
}

function dateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function updateEstimate() {
  if (!checkIn.value || !checkOut.value) return;
  const start = new Date(`${checkIn.value}T00:00:00`);
  const end = new Date(`${checkOut.value}T00:00:00`);
  const nights = Math.max(1, Math.round((end - start) / 86400000));
  const total = nights * selectedPrice;
  document.querySelector("#night-count").textContent = formatPrice(nights);
  document.querySelector("#total-price").textContent = formatPrice(total);
  document.querySelector("#payment-total").textContent = formatPrice(total);
}

function openBooking(button) {
  selectedPrice = Number(button.dataset.price);
  document.querySelector("#selected-stay").textContent = button.dataset.stay;
  document.querySelector("#nightly-price").textContent = formatPrice(selectedPrice);
  document.querySelector("#booking-step").hidden = false;
  document.querySelector("#payment-step").hidden = true;
  document.querySelector("#result-step").hidden = true;

  const arrival = dateOffset(1);
  checkIn.min = dateOffset(0);
  checkIn.value = arrival;
  checkOut.min = dateOffset(2);
  checkOut.value = dateOffset(2);
  guestCount.value = "2";
  updateEstimate();
  dialog.showModal();
}

filters.addEventListener("submit", (event) => event.preventDefault());
filters.addEventListener("input", updateListings);
filters.addEventListener("change", () => {
  if (document.activeElement === governorate) setRegion(governorate.value);
  else updateListings();
});
governorate.addEventListener("change", () => setRegion(governorate.value));

document.querySelector(".region-chips").addEventListener("click", (event) => {
  const chip = event.target.closest(".region-chip");
  if (chip) setRegion(chip.dataset.region);
});

poolFilter.addEventListener("click", () => {
  poolOnly = !poolOnly;
  poolFilter.setAttribute("aria-pressed", String(poolOnly));
  updateListings();
});

document.addEventListener("click", (event) => {
  const bookingButton = event.target.closest("[data-booking]");
  if (bookingButton) {
    event.preventDefault();
    openBooking(bookingButton);
    return;
  }
  if (event.target.closest("[data-close]")) dialog.close();
});

checkIn.addEventListener("change", () => {
  const earliestCheckout = new Date(`${checkIn.value}T00:00:00`);
  earliestCheckout.setDate(earliestCheckout.getDate() + 1);
  checkOut.min = `${earliestCheckout.getFullYear()}-${String(earliestCheckout.getMonth() + 1).padStart(2, "0")}-${String(earliestCheckout.getDate()).padStart(2, "0")}`;
  if (checkOut.value < checkOut.min) checkOut.value = checkOut.min;
  updateEstimate();
});
checkOut.addEventListener("change", updateEstimate);
guestCount.addEventListener("change", updateEstimate);

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (new Date(`${checkOut.value}T00:00:00`) <= new Date(`${checkIn.value}T00:00:00`)) {
    checkOut.setCustomValidity("اختر تاريخ مغادرة بعد تاريخ الوصول.");
    checkOut.reportValidity();
    checkOut.setCustomValidity("");
    return;
  }
  updateEstimate();
  document.querySelector("#booking-step").hidden = true;
  document.querySelector("#payment-step").hidden = false;
});

document.querySelector("#back-to-booking").addEventListener("click", () => {
  document.querySelector("#payment-step").hidden = true;
  document.querySelector("#booking-step").hidden = false;
});

document.querySelector("#simulate-payment").addEventListener("click", () => {
  document.querySelector("#payment-step").hidden = true;
  document.querySelector("#result-step").hidden = false;
});

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

dialog.addEventListener("close", () => {
  bookingForm.reset();
  document.querySelector("#booking-step").hidden = false;
  document.querySelector("#payment-step").hidden = true;
  document.querySelector("#result-step").hidden = true;
});

updateListings();
