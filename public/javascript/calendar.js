document.addEventListener("DOMContentLoaded", () => {
  const calendarInput = document.querySelector("#calendar");
  const hiddenInput = document.querySelector("#bookedDatesInput");

  if (calendarInput && typeof bookedDates !== "undefined") {
    flatpickr(calendarInput, {
      mode: "multiple",
      dateFormat: "Y-m-d",
      defaultDate: bookedDates,
      disable: isOwner ? [] : bookedDates,
      inline: true,
      showMonths: 2,
      clickOpens: isOwner,
      onChange: function (selectedDates) {
        if (isOwner && hiddenInput) {
          const formattedDates = selectedDates.map(date =>
            date.toISOString().split("T")[0]
          );
          hiddenInput.value = formattedDates.join(",");
        }
      }
    });
  }
});
