const mongoose = require("mongoose");
const Review = require("./review.js");

const DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1506744038136-46273834b3fb";

const normalizeImageUrl = (image) => {
    if (!image) {
        return DEFAULT_IMAGE_URL;
    }

    if (typeof image === "string") {
        return image.trim() || DEFAULT_IMAGE_URL;
    }

    if (typeof image === "object" && image.url) {
        return image.url;
    }

    return DEFAULT_IMAGE_URL;
};

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: String,
    image: {
        type: mongoose.Schema.Types.Mixed,
        default: DEFAULT_IMAGE_URL,
        set: normalizeImageUrl,
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
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    
    geometry: {
        type: {
            type: String, 
            enum: ['Point'], 
            default: "Point",
        },
        coordinates: {
            type: [Number],
        }
    }
});

listingSchema.virtual("imageUrl").get(function () {
    return normalizeImageUrl(this.image);
});

// Cleanup
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
