document.addEventListener("DOMContentLoaded", () => {
  const taxSwitch = document.getElementById("switchCheckDefault");

  if (!taxSwitch) return;

  taxSwitch.addEventListener("change", () => {
    const priceSpans = document.querySelectorAll(".base-price");
    const taxLabels = document.querySelectorAll(".tax-info");

    priceSpans.forEach((priceEl, index) => {
      const base = parseFloat(priceEl.dataset.base);

      if (taxSwitch.checked) {
        const total = Math.round(base * 1.18);
        priceEl.textContent = total.toLocaleString("en-IN");
        taxLabels[index].style.display = "inline";
      } else {
        priceEl.textContent = base.toLocaleString("en-IN");
        taxLabels[index].style.display = "none";
      }
    });
  });
});
