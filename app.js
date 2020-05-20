var express = require("express"),
    path = require("path"),
    // cookieParser = require("cookie-parser"),
    bodyParser = require("body-parser"),
    flash = require("connect-flash"),
    session = require("express-session"),
    // expressValidator = require("express-validator"),
    passport = require("passport"),
    mongoose = require("mongoose");

// Init App
var app = express();

// Connect to MongoDB
mongoose.connect("mongodb://localhost/FileManagementSystem", { useNewUrlParser: true, useUnifiedTopology: true });

// EJS and View Engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// body parser setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser);

// Set Static Folder
app.use(express.static(path.join(__dirname, "public")));

// Express Session Middleware
app.use(session({
    secret: "session secret",
    saveUninitialized: true,
    resave: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport Config
require("./config/passport")(passport);

// Connect Flash Middleware
app.use(flash());

// Express messages Setup and global variables setup for flash messages
app.use(function(req, res, next) {
    res.locals.messages = require("express-messages")(req, res);
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user || null;
    next();
});

// routes setup
var indexRoute = require("./routes/index"),
    userRoute = require("./routes/users");
app.use("/", indexRoute);
app.use("/users", userRoute);

// Port Setup
app.set("port", (process.env.PORT || 3000));
app.listen(app.get("port"), function() {
    console.log("Server started on port " + app.get("port") + "!");
    console.log("Press Ctrl + C to stop the server.");
});