module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // Store the URL the user was trying to access so we can redirect them back after login
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create a listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};