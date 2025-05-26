const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const sendBookingStatusEmail = async (to, name, listingTitle, status, startDate, endDate) => {
  let subject = "";
  let html = "";

  const formattedStart = new Date(startDate).toDateString();
  const formattedEnd = new Date(endDate).toDateString();

  if (status === "accepted") {
    subject = `✅ Booking Accepted – Your stay at ${listingTitle}`;
    html = `
      <p>Hi <b>${name}</b>,</p>
      <p>Your booking for <strong>${listingTitle}</strong> from <b>${formattedStart}</b> to <b>${formattedEnd}</b> has been <span style="color:green"><b>accepted</b></span>.</p>
      <p>Thank you for booking with our travel-friendly app. We hope you enjoy your stay!</p>
    `;
  } else if (status === "rejected") {
    subject = `❌ Booking Rejected – ${listingTitle}`;
    html = `
      <p>Hi <b>${name}</b>,</p>
      <p>Unfortunately, your booking for <strong>${listingTitle}</strong> from <b>${formattedStart}</b> to <b>${formattedEnd}</b> has been <span style="color:red"><b>rejected</b></span>.</p>
      <p>You can explore other listings anytime on our travel-friendly app.</p>
    `;
  }

  await transporter.sendMail({
    from: `"Travel-Friendly App" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendBookingStatusEmail;
