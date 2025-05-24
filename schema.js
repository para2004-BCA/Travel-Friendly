const Joi = require('joi');

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.string().allow("", null),

    // ✅ Valid listing types
    type: Joi.string()
      .valid(
        "Trending",
        "Rooms",
        "Iconic Cities",
        "Mountain",
        "Castles",
        "Amazing Pools",
        "Camping",
        "Farms",
        "Arctic",
        "Domes",
        "Boats"
      )
      .required(),

    // ✅ Owner information
    ownerName: Joi.string().required(),
    ownerAddress: Joi.string().required(),
    ownerAge: Joi.number().min(18).max(120).required(),
    ownerGender: Joi.string().valid("Male", "Female", "Other").required(),
    ownerMobile: Joi.string().pattern(/^[0-9]{10}$/).required()
  }).required()
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required()
  }).required()
});
