document.addEventListener("DOMContentLoaded", () => {
  const filters = document.querySelectorAll(".filter");
  const cards = document.querySelectorAll(".listing-card");

  filters.forEach(filter => {
    filter.addEventListener("click", () => {
      const selectedType = filter.dataset.type;
      cards.forEach(card => {
        if (!selectedType || card.dataset.type === selectedType) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
});
