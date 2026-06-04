const express=require("express");
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const app=express();
const Listing=require("./models/listing.js");
const ejsmate=require("ejs-mate");
const wrapAsync=require("./utils/wrapasync.js");
const ExpressError=require("./utils/ExpressError.js");

const MONGO_URL='mongodb://127.0.0.1:27017/wander';

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsmate);
app.use(express.static(path.join(__dirname,"/public")));

main().then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log("error");
}
);
app.get("/",(req,res)=>{
    res.send("hi i am root");
});

app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("index.ejs",{allListings});
}));

app.get("/listings/new",(req,res)=>{
    res.render("new.ejs");
});

app.post("/listings", wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect(`/listings/${newListing._id}`);
}));

app.get("/listings/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        return res.redirect("/listings");
    }
    res.render("show.ejs",{listing});
}));

app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("edit.ejs",{listing});
}));

app.put("/listings/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

app.delete("/listings/:id",wrapAsync(async (req,res)=>{
  let {id}=req.params;
  let deletedlisting=await Listing.findByIdAndDelete(id);
  console.log(deletedlisting);
  res.redirect("/listings");
}));

app.all("/{*splat}",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong"}=err;
    res.status(statusCode).send(message);
});



//app.get("/testlisting",async (req,res)=>{
//    let sample1=new Listing(
//        {
//            title:"Mynew villa",
//            description:"By the beach",
//            price:1200,
//            location:"Calagute,Goa",
//            country:"India"
//        }
//    );
//    await sample1.save();
//    console.log("sample was saved");
//    res.send("sucessfull testing");
//});

app.listen(3000,()=>{
    console.log("app is listening to the port 3000")
}); 
