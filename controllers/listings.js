const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const Booking = require("../models/booking");

module.exports.index=async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}
module.exports.renderNewForm=(req,res)=>{
    res.render("./listings/new.ejs");
}
module.exports.showListing= async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({path:"reviews", 
        populate:{path:"author",},})
    .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings"); // Add return here
    }
    res.render("listings/show.ejs", { listing });
}
module.exports.createListing = async (req,res,next)=>{
    let response= await  geocodingClient.forwardGeocode({
         query:req.body.listing.location,
         limit: 1
        })
             .send()
       let url=req.file.path;
       let filename=req.file.filename;
        const newListing=new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = {url,filename};
        newListing.geometry =  response.body.features[0].geometry;
       let savedListing =  await newListing.save();
       console.log(savedListing)
        req.flash("success","New Listing Created!");
        res.redirect("/listings"); 
}
module.exports.renderEdit = async(req,res)=>{
    let{id}=req.params;
    const listing= await Listing.findById(id);
     if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings"); // Add return here
    }
   res.render("listings/edit.ejs",{listing});
}
module.exports.updateListing = async(req,res)=>{
    let {id}=req.params;
    let listing =  await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file !== "undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image = {url,filename};
    await listing.save();}

   req.flash("success","Listing  Updated!");
   res.redirect(`/listings/${id}`);
}
module.exports.destroyListing = async(req,res)=>{
    let {id}=req.params;
    let deleteListin=await Listing.findByIdAndDelete(id);
    console.log(deleteListin);
     req.flash("success"," Listing Deleted!");
    res.redirect("/listings");
}
module.exports.searchListings = async (req, res) => {
  const searchTerm = req.query.q || "";
  const regex = new RegExp(escapeRegex(searchTerm), "i");

  const searchConditions = [
    { title: regex },
    { location: regex },
    { country: regex },
  ];
  // Check if searchTerm is a number, then also search by price
  if (!isNaN(searchTerm)) {
    searchConditions.push({ price: Number(searchTerm) });
  }
  const allListings = await Listing.find({
    $or: searchConditions,
  });
  res.render("listings/index.ejs", { allListings });
};
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
module.exports.updateBookings = async (req, res) => {
  const { id } = req.params;
  let { bookedDates } = req.body;
  const listing = await Listing.findById(id);
  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission to update bookings.");
    return res.redirect(`/listings/${id}`);
  }
  listing.bookedDates = Array.isArray(bookedDates)
    ? bookedDates
    : bookedDates.split(",").map(date => date.trim());
  await listing.save();await sendBookingStatusEmail(
  booking.email,
  "Booking Status",
  `Your booking from ${booking.startDate.toDateString()} to ${booking.endDate.toDateString()} has been accepted!`
);

  req.flash("success", "Booking dates updated.");
  res.redirect(`/listings/${id}`);
};


