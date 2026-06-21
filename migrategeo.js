if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const { geocodeListing, isFallbackCoordinates } = require("./utils/geocode.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wander";

async function main() {
    await mongoose.connect(MONGO_URL);
}

main()
    .then(() => console.log("Connected to database for geo-migration."))
    .catch((err) => {
        console.error("Database connection error:", err);
        process.exit(1);
    });

async function runMigration() {
    try {
        const listings = await Listing.find({
            $or: [
                { geometry: { $exists: false } },
                { "geometry.coordinates": { $exists: false } },
                { "geometry.coordinates": { $size: 0 } },
                { "geometry.coordinates": [77.2090, 28.6139] },
            ],
        });

        console.log(`Found ${listings.length} listings that need geocoding updates.`);

        for (let listing of listings) {
            const queryLocation = [listing.location, listing.country]
                .map((part) => (part || "").trim())
                .filter(Boolean)
                .join(", ");

            if (!queryLocation) {
                console.log(`Clearing map coordinates for listing [${listing._id}] with no location.`);
                listing.geometry = undefined;
                await listing.save();
                continue;
            }

            console.log(`Geocoding listing [${listing.title}]: "${queryLocation}"...`);
            const geometry = await geocodeListing(listing);
            if (geometry) {
                listing.geometry = geometry;
            } else if (!listing.geometry?.coordinates?.length || isFallbackCoordinates(listing.geometry.coordinates)) {
                listing.geometry = undefined;
            }

            await listing.save();
            console.log(`Coordinates are now: ${JSON.stringify(listing.geometry?.coordinates || null)}`);

            await new Promise((resolve) => setTimeout(resolve, 250));
        }

        console.log("Migration routine completed successfully.");
    } catch (migrationError) {
        console.error("Migration execution halted prematurely:", migrationError);
    } finally {
        await mongoose.disconnect();
        console.log("Database disconnected smoothly.");
    }
}

runMigration();
