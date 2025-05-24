const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const childSchema = new Schema({
  name: String,
  age: Number,
  gender: String,
});

const bookingRequestSchema = new Schema({
  listing: {
    type: Schema.Types.ObjectId,
    ref: 'Listing',
  },
  userName: String,
  userEmail: String,
  userAge: Number,
  userPhone: String,
  peopleCount: Number,
  children: [childSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('BookingRequest', bookingRequestSchema);
