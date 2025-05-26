const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const listingSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  image: {
    url: String,
    filename: String
  },
  price: Number,
  location: String,
  country: String,
  type: {
    type: String,
    enum: [
      'Trending', 'Rooms', 'Iconic Cities', 'Mountain',
      'Castles', 'Amazing Pools', 'Camping', 'Farms',
      'Arctic', 'Domes', 'Boats'
    ],
    required: true
  },  
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  bookedDates: [Date],
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: "Review"
  }],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  ownerName: String,
ownerAddress: String,
ownerAge: Number,
ownerGender: String,
ownerMobile: String,
});
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});
module.exports = mongoose.model("Listing", listingSchema);
