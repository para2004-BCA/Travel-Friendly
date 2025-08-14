#  Travel-Friendly Room Booking App

This is a full-stack travel room booking platform where users can browse listings, request bookings, and leave reviews. Listing owners can manage booking requests via a dashboard — accepting or rejecting them — and the app automatically notifies users via email.

---

 ## Tech Stack

- **Frontend:** EJS Templates, Bootstrap, Custom CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** Passport.js (Local Strategy)
- **Email Notification:** Nodemailer
- **PDF Reports:** PDFKit
- **Other Libraries:** dotenv, method-override, connect-flash, express-session

---

##  Features

###  General Users
- Sign up and log in securely.
- Browse listings with photos, details, and owner info.
- Request bookings with personal and group info.
- See booking status updates.
- Leave and delete reviews for listings.

###  Listing Owners
- Create, edit, and delete listings with:
  - Title, image, location, price range, description
  - Owner's name, age, gender, address, phone
- Manage booking requests via dashboard.
  - Accept or reject requests.
  - Automatically update booking status.
- View individual user details.
- Download user data as PDF.

###  Email Notifications
- User receives an email on acceptance or rejection.
- Owner receives email when a booking request is made.

---

---

##  Setup Instructions

1. **Clone the Repo**
   ```bash
   git clone https://github.com/yourusername/travel-booking-app.git
   cd travel-booking-app.

# Install Dependencies

npm install

# Environment Variables

DB_URL=mongodb://localhost:27017/travel-booking
SECRET=sessionsecret
GMAIL_USER=your@gmail.com
GMAIL_PASS=yourapppassword

# RUN 
nodemon app.js
Visit: http://localhost:8080

# Project Structure

.
├── routes/
│   ├── listings.js
│   ├── bookings.js
│   └── reviews.js
├── models/
│   ├── listing.js
│   ├── booking.js
│   └── user.js
├── views/
│   ├── listings/
│   ├── bookings/
│   ├── partials/
│   └── layouts/
├── utils/
│   └── sendEmail.js
├── public/
│   ├── css/
│   └── js/
├── app.js
├── .env
└── README.md


