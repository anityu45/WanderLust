const express = require("express");
const router = express.Router();

router.get("/test-listing-created", (req, res) => {
    req.flash("success", "Listing Created Successfully!");
    res.redirect("/listings");
});

router.get("/test-listing-deleted", (req, res) => {
    req.flash("success", "Listing Deleted Successfully!");
    res.redirect("/listings");
});

module.exports = router;
