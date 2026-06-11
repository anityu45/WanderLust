const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");

const router = express.Router();

const sessionOptions = {
    secret: "mysupersecretstring",
    resave: false,
    saveUninitialized: true,
};

router.use(session(sessionOptions));
router.use(flash());

router.get("/register", (req, res) => {
    const { name = "anonymous" } = req.query;
    req.session.name = name;
    req.flash("success", "Registered successfully");
    res.redirect("/hello");
});

router.get("/hello", (req, res) => {
    const name = req.session.name || "anonymous";
    const messages = req.flash("success");
    const message = messages.length ? `${messages[0]} ` : "";
    res.send(`${message}Hello, ${name}`);
});

module.exports = router;
