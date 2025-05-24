const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const childSchema = new Schema({
  name: String,
  age: Number,
  gender: String
});

const adultSchema = new Schema({
  name: String,
  age: Number,
  gender: String
});

const bookingSchema = new Schema({
  listing: { type: Schema.Types.ObjectId, ref: 'Listing' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  name: String,
  email: String,
  phone: String,
  age: Number,
  numAdults: Number,
  numChildren: Number,
  adults: [adultSchema],
  children: [childSchema],
  startDate: Date,
  endDate: Date,
  message: String,
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
