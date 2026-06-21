// 1. Load environment variables first
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// 2. Core Modules
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// 3. Models & Routes
const User = require("./models/user.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const serverRouter = require("./routes/server.js");
const ExpressError = require("./utils/ExpressError.js");

const app = express();
const MONGO_URL = "mongodb://127.0.0.1:27017/wander";

async function main() {
    await mongoose.connect(MONGO_URL);
}

main()
    .then(() => {
        console.log("connected to db");
    })
    .catch((err) => {
        console.log("error connecting to db:", err);
    });

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const sessionOptions = {
    secret: "wanderlust-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global local variables middleware template injections
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.currUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    
    // SAFE TRAP: Binds the API Token key smoothly to all view render routines
    res.locals.maptilerApiKey = process.env.MAPTILER_API_KEY || ""; 
    next();
});

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/", userRouter);
app.use("/", serverRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);

app.all(/.*/, (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// Central Error Handling Middleware Engine
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = "Something went wrong";
    }
    res.status(statusCode).send(err.message);
});

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});