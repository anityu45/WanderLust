const mongoose = require("mongoose");
const Review = require("./review.js");

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: String,
    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        set: (v) =>
            v === ""
                ? "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
                : v,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
