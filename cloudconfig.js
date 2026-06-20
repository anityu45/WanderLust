const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ override: true });
}

const cloudName = process.env.CLOUD_NAME?.trim();
const apiKey = process.env.CLOUD_API_KEY?.trim();
const apiSecret = process.env.CLOUD_API_SECRET?.trim();

if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are missing. Set CLOUD_NAME, CLOUD_API_KEY, and CLOUD_API_SECRET in .env.");
}

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
});

// Setup the storage engine configuration
const storage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
        folder: 'wanderlust_DEV',
        allowed_formats: ["png", "jpg", "jpeg", "webp"],
    }),
});

module.exports = {
    cloudinary,
    storage,
};
