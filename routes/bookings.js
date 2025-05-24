const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");
const PDFDocument = require("pdfkit");

// Show the booking request form
router.get("/:id/request", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  res.render("bookings/request.ejs", { listing });
});

// Handle booking form submission
router.post("/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const {
    name,
    email,
    phone,
    age,
    numPeople,
    children,
    startDate,
    endDate,
    message,
  } = req.body;

  if (!startDate || !endDate) {
    req.flash("error", "Start and End dates are required.");
    return res.redirect(`/bookings/${id}/request`);
  }

  const booking = new Booking({
    listing: id,
    user: req.user._id,
    name,
    email,
    phone,
    age,
    numPeople,
    children: Array.isArray(children) ? children : [],
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    message,
    status: "pending",
  });

  await booking.save();
  req.flash("success", "Booking request submitted successfully!");
  res.redirect(`/listings/${id}`);
});

// Owner Dashboard to View Bookings
router.get("/dashboard/:listingId", isLoggedIn, async (req, res) => {
  const { listingId } = req.params;
  const listing = await Listing.findById(listingId);

  if (!listing || !listing.owner.equals(req.user._id)) {
    req.flash("error", "You are not the owner of this listing");
    return res.redirect("/listings");
  }

  const bookings = await Booking.find({ listing: listingId }).populate("user");
  res.render("bookings/dashboard", { bookings, listing });
});

// Accept a Booking
router.post("/:bookingId/accept", isLoggedIn, async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId).populate("listing");

  if (!booking || !booking.listing.owner.equals(req.user._id)) {
    req.flash("error", "Unauthorized");
    return res.redirect("/listings");
  }

  booking.status = "accepted";
  await booking.save();

  const listing = await Listing.findById(booking.listing._id);

  const datesToAdd = [];
  const curr = new Date(booking.startDate);
  while (curr <= booking.endDate) {
    datesToAdd.push(curr.toISOString().split("T")[0]);
    curr.setDate(curr.getDate() + 1);
  }

  listing.bookedDates.push(...datesToAdd);
  listing.bookedDates = [...new Set(listing.bookedDates)];
  await listing.save();

  req.flash("success", "Booking accepted and calendar updated.");
  res.redirect(`/bookings/dashboard/${listing._id}`);
});

// Reject a Booking
router.post("/:bookingId/reject", isLoggedIn, async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId).populate("listing");

  if (!booking || !booking.listing.owner.equals(req.user._id)) {
    req.flash("error", "Unauthorized");
    return res.redirect("/listings");
  }

  await Booking.findByIdAndDelete(bookingId);
  req.flash("success", "Booking request rejected.");
  res.redirect(`/bookings/dashboard/${booking.listing._id}`);
});

// Download PDF of booking requests
router.get("/dashboard/:listingId/download", isLoggedIn, async (req, res) => {
  const { listingId } = req.params;
  const listing = await Listing.findById(listingId);

  if (!listing || !listing.owner.equals(req.user._id)) {
    req.flash("error", "Unauthorized access");
    return res.redirect(`/listings`);
  }

  const bookings = await Booking.find({ listing: listingId }).populate("user");

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=bookings.pdf");
  doc.pipe(res);

  doc.fontSize(16).text(`Booking Requests for "${listing.title}"`, { underline: true });
  doc.moveDown();

  bookings.forEach((booking, i) => {
    const start = booking.startDate ? booking.startDate.toDateString() : "N/A";
    const end = booking.endDate ? booking.endDate.toDateString() : "N/A";
    const username = booking.user?.username || "N/A";
    const userEmail = booking.user?.email || "N/A";
    doc
      .fontSize(12)
      .text(`${i + 1}. ${username} - ${userEmail} | ${start} to ${end} | Status: ${booking.status}`);
    doc.moveDown();
  });

  doc.end();
});

module.exports = router;
