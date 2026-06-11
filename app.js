const express=require("express");
const mongoose=require("mongoose");
const path=require("path");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride=require("method-override");
const app=express();
const ejsmate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const serverRouter=require("./routes/server.js");

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

const sessionOptions = {
    secret: "mysupersecretstring",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

main().then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log("error");
}
);
app.get("/",(req,res)=>{
    res.redirect("/listings");
});

app.get("/getcookies",(req,res)=>{
    res.cookie("greet","hello");
    res.send("sent u cookies");
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", serverRouter);

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
