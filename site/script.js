const filters = document.querySelector("#filters");
const cards = [...document.querySelectorAll(".stay-card")];
const count = document.querySelector("#results-count");
const emptyState = document.querySelector("#empty-state");

function updateListings() {
  const governorate = document.querySelector("#governorate").value;
  const maxPrice = Number(document.querySelector("#price").value) || Infinity;
  const minGuests = Number(document.querySelector("#guests").value) || 0;
  let visibleCount = 0;

  for (const card of cards) {
    const matches = (!governorate || card.dataset.governorate === governorate)
      && Number(card.dataset.price) <= maxPrice
      && Number(card.dataset.guests) >= minGuests;
    card.hidden = !matches;
    if (matches) visibleCount += 1;
  }

  count.textContent = `${new Intl.NumberFormat("ar-OM").format(visibleCount)} نماذج تجريبية`;
  emptyState.hidden = visibleCount > 0;
}

filters.addEventListener("change", updateListings);
filters.addEventListener("reset", () => requestAnimationFrame(updateListings));
