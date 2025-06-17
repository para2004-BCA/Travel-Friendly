const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");
const PDFDocument = require("pdfkit");
const sendBookingStatusEmail = require("../utils/sendemail");
const User = require("../models/user");


// Show booking request form
router.get("/:id/request", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  res.render("bookings/request.ejs", { listing });
});

// Handle booking submission
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
    adults=[],
    children=[],
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
    adults:Array.isArray(adults)?adults:[adults],
    children: Array.isArray(children) ? children : [children],
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    message,
    status: "pending",
  });

  await booking.save();
  // Find owner info
const owner = await User.findById(listing.owner);

// Send email to owner
await sendBookingStatusEmail(
  owner.email,
  owner.username,
  listing.title,
  "new_request",
  booking.startDate,
  booking.endDate,
  booking.name  // booked user's name
);

  req.flash("success", "Booking request submitted successfully!");
  res.redirect(`/listings/${id}`);
});

// Dashboard: View all bookings for a listing
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

// Accept a booking
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

  await sendBookingStatusEmail(
    booking.email,
    booking.name,
    listing.title,
    "accepted",
    booking.startDate,
    booking.endDate
  );

  req.flash("success", "Booking accepted and updated.");
  res.redirect(`/bookings/dashboard/${listing._id}`);
});

// Reject a booking
router.post("/:bookingId/reject", isLoggedIn, async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId).populate("listing");

  if (!booking || !booking.listing.owner.equals(req.user._id)) {
    req.flash("error", "Unauthorized");
    return res.redirect("/listings");
  }

  await sendBookingStatusEmail(
    booking.email,
    booking.name,
    booking.listing.title,
    "rejected",
    booking.startDate,
    booking.endDate
  );

  await Booking.findByIdAndDelete(bookingId);
  req.flash("success", "Booking request rejected.");
  res.redirect(`/bookings/dashboard/${booking.listing._id}`);
});

// View single booking details
router.get("/dashboard/:listingId/booking/:bookingId", isLoggedIn, async (req, res) => {
  const { listingId, bookingId } = req.params;

  const listing = await Listing.findById(listingId);
  const booking = await Booking.findById(bookingId).populate("user");

  if (!listing || !listing.owner.equals(req.user._id)) {
    req.flash("error", "Unauthorized access");
    return res.redirect("/listings");
  }

  res.render("bookings/view", { booking, listing });
});

// Download individual booking as PDF
router.get("/dashboard/:listingId/booking/:bookingId/download", isLoggedIn, async (req, res) => {
  const { listingId, bookingId } = req.params;
  const listing = await Listing.findById(listingId);
  const booking = await Booking.findById(bookingId).populate("user");

  if (!listing || !listing.owner.equals(req.user._id)) {
    req.flash("error", "Unauthorized");
    return res.redirect("/listings");
  }

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=booking-${booking._id}.pdf`);
  doc.pipe(res);

  doc.fontSize(16).text(`Booking Details for ${listing.title}`, { underline: true }).moveDown();
  doc.text(`Name: ${booking.name}`);
  doc.text(`Email: ${booking.email}`);
  doc.text(`Phone: ${booking.phone}`);
  doc.text(`Age: ${booking.age}`);
  doc.text(`People: ${booking.numPeople}`);
  doc.text(`Start: ${booking.startDate.toDateString()}`);
  doc.text(`End: ${booking.endDate.toDateString()}`);
  doc.text(`Message: ${booking.message || "None"}`);
if (booking.adults && booking.adults.length > 0) {
    doc.moveDown().text("Adult Guests:");
    booking.adults.forEach((adult, i) => {
      doc.text(`${i + 1}. ${adult.name} - ${adult.age} - ${adult.gender}`);
    });
  }


  if (booking.children.length > 0) {
    doc.moveDown().text("Children:");
    booking.children.forEach((child, i) => {
      doc.text(`${i + 1}. ${child.name} - ${child.age} - ${child.gender}`);
    });
  }
  doc.end();
});

// ✅ Download ALL bookings as PDF (for dashboard)
router.get("/dashboard/:listingId/download", isLoggedIn, async (req, res) => {
  const { listingId } = req.params;
  const listing = await Listing.findById(listingId);

  if (!listing || !listing.owner.equals(req.user._id)) {
    req.flash("error", "Unauthorized access");
    return res.redirect("/listings");
  }

  const bookings = await Booking.find({ listing: listingId });

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=bookings-summary.pdf");
  doc.pipe(res);

  doc.fontSize(18).text(`Booking Summary for ${listing.title}`, { underline: true });
  doc.moveDown();

  bookings.forEach((booking, index) => {
    doc.fontSize(12).text(
      `${index + 1}. Name: ${booking.name}
      Email: ${booking.email}
      Phone: ${booking.phone}
      Dates: ${booking.startDate.toDateString()} - ${booking.endDate.toDateString()}
      Status: ${booking.status}`
    );
    doc.moveDown();
  });

  doc.end();
});


module.exports = router;
