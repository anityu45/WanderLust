const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ override: true });
}

const cloudName = process.env.CLOUD_NAME?.trim();
const apiKey = process.env.CLOUD_API_KEY?.trim();
const apiSecret = process.env.CLOUD_API_SECRET?.trim();

const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

let storage = null;

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
    });

    storage = new CloudinaryStorage({
        cloudinary,
        params: async () => ({
            folder: 'wanderlust_DEV',
            allowed_formats: ["png", "jpg", "jpeg", "webp"],
        }),
    });
} else {
    console.warn("Cloudinary credentials are missing. Image uploads will be disabled.");
}

module.exports = {
    cloudinary,
    isCloudinaryConfigured,
    storage,
};
