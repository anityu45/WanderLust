const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapasync.js");
const { reviewSchema } = require("../schemas.js");
const ExpressError = require("../utils/ExpressError.js");
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");

// Review Form Validation Middleware
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

// Post Review Route
router.post("/", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    
    const review = new Review(req.body.review);
    review.author = req.user._id; 
    
    await review.save();
    listing.reviews.push(review._id);
    await listing.save();
    
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${id}`);
}));

// Delete Review Route (Fixed: Secured with isReviewAuthor authorization)
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;