const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapasync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const ExpressError = require("../utils/ExpressError.js");
const multer = require("multer");
const { isCloudinaryConfigured, storage } = require("../cloudconfig.js");

const allowedImageTypes = ["image/png", "image/jpeg", "image/webp"];
const upload = multer({
    storage: storage || multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (allowedImageTypes.includes(file.mimetype)) {
            return cb(null, true);
        }
        cb(new ExpressError("Please upload a PNG, JPG, JPEG, or WEBP image.", 400));
    },
});

const uploadListingImage = (req, res, next) => {
    upload.single("listing[image]")(req, res, (err) => {
        if (err) {
            return next(err);
        }

        if (req.file && !isCloudinaryConfigured) {
            return next(new ExpressError("Image upload is temporarily unavailable. Please try again later.", 503));
        }

        next();
    });
};

// Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("index.ejs", { allListings });
}));

// Cookies Test Route (Can be removed later)
router.get("/getcookies", (req, res) => {
    res.cookie("greet", "hello");
    res.send("sent u cookies");
});

// New Route
router.get("/new", isLoggedIn, (req, res) => {
    res.render("new.ejs");
});

// Create Route
router.post("/", 
    isLoggedIn, 
    uploadListingImage,
    validateListing, 
    wrapAsync(async (req, res) => {
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        
        if (req.file) {
            newListing.image = req.file.path;
        }

        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect(`/listings/${newListing._id}`);
    })
);

// Show Route
router.get("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("show.ejs", { listing });
}));

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("edit.ejs", { listing });
}));

// Update Route
router.put("/:id", isLoggedIn, isOwner, uploadListingImage, validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listingData = { ...req.body.listing };

    if (req.file) {
        listingData.image = req.file.path;
    }

    await Listing.findByIdAndUpdate(id, listingData, { runValidators: true });
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

// Delete Route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;
