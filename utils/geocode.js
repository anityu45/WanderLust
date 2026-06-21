const FALLBACK_COORDINATES = [77.2090, 28.6139];

const hasValidCoordinates = (coordinates) => (
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    coordinates.every((coordinate) => Number.isFinite(coordinate))
);

const isFallbackCoordinates = (coordinates) => (
    hasValidCoordinates(coordinates) &&
    coordinates[0] === FALLBACK_COORDINATES[0] &&
    coordinates[1] === FALLBACK_COORDINATES[1]
);

const buildLocationQuery = (listing = {}) => {
    return [listing.location, listing.country]
        .map((part) => (part || "").trim())
        .filter(Boolean)
        .join(", ");
};

const pointFromCoordinates = (coordinates) => {
    if (!hasValidCoordinates(coordinates)) {
        return null;
    }

    return {
        type: "Point",
        coordinates,
    };
};

const geocodeListing = async (listing = {}) => {
    const apiKey = process.env.MAPTILER_API_KEY?.trim();
    const query = buildLocationQuery(listing);

    if (!apiKey || !query || typeof fetch !== "function") {
        return null;
    }

    const url = new URL(`https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json`);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("limit", "1");

    try {
        const response = await fetch(url);

        if (!response.ok) {
            console.warn(`MapTiler geocoding failed with status ${response.status} for "${query}".`);
            return null;
        }

        const data = await response.json();
        const coordinates = data?.features?.[0]?.geometry?.coordinates;

        if (!hasValidCoordinates(coordinates)) {
            console.warn(`MapTiler returned no coordinates for "${query}".`);
            return null;
        }

        return pointFromCoordinates(coordinates);
    } catch (err) {
        console.warn(`MapTiler geocoding failed for "${query}": ${err.message}`);
        return null;
    }
};

module.exports = {
    FALLBACK_COORDINATES,
    geocodeListing,
    hasValidCoordinates,
    isFallbackCoordinates,
    pointFromCoordinates,
};
