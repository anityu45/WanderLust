const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
        },
        author :{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    },
    { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
