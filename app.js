const exprees=require("express");
const app=exprees();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodoverride=require("method-override");
const ejsMate=require("ejs-mate");


const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";


main()
 .then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log(err);
})

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(exprees.urlencoded({extended:true}));
app.use(methodoverride("_method"));  
app.engine('ejs',ejsMate);
app.use(exprees.static(path.join(__dirname,"/public")));

app.get("/",(req,res)=>{
    res.send("Hi ,I am root");
});

//Index Route
app.get("/listings",async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
});


//new Route
app.get("/listings/new",(req,res)=>{
    res.render("./listings/new.ejs");
});



//show Route
app.get("/listings/:id",async(req,res)=>{
     let{id}=req.params;
     const listing= await Listing.findById(id);
     res.render("listings/show.ejs",{listing});
});

//create Route
app.post("/listings",async (req,res)=>{
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});

app.get("/listings/:id/edit", async(req,res)=>{
    let{id}=req.params;
    const listing= await Listing.findById(id);
   res.render("listings/edit.ejs",{listing});
})


//Updata Route
app.put("/listings/:id",async(req,res)=>{
    let {id}=req.params;
   await Listing.findByIdAndUpdate(id,{...req.body.listing});
   res.redirect(`/listings/${id}`);
});

//Delete Route
app.delete("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    let deleteListin=await Listing.findByIdAndDelete(id);
    console.log(deleteListin);
    res.redirect("/listings");
});


// app.get("/testListing",async (req,res)=>{
//       let sampleListing=new Listing({
//         title:"my new villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calangute,goa",
//         country:"India",
//       });
//    await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });



app.listen(8080,()=>{
    console.log("server is listing to port 8080");
});