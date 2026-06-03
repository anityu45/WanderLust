const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wander";

main()
    .then(() => {
        console.log("connected to db");
        initDB();
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});

    const listings = initData.data.map((listing) => ({
        ...listing,
        image: listing.image.url,
    }));

    await Listing.insertMany(listings);
    console.log("data was initialised");
    mongoose.connection.close();
};
