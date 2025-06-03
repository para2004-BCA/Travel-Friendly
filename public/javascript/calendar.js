
  document.addEventListener("DOMContentLoaded", () => {
    const calendarEl = document.getElementById("calendar");

    if (calendarEl && Array.isArray(bookedDates)) {
      flatpickr(calendarEl, {
        mode: "multiple",
        defaultDate: bookedDates,
        dateFormat: "Y-m-d",
        inline: true,
        clickOpens: false,
        minDate: "today", // ✅ Hide past dates
        disable: [],       // Don't disable any dates, just show booked
        showMonths: 2,
      });
    }
  });

