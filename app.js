const express = require("express"),
    mongoose = require("mongoose"),
    path = require("path"),
    bodyParser = require("body-parser"),
    flash = require("connect-flash"),
    session = require("express-session"),
    passport = require("passport");

// Init App
const app = express();

// Connect to MongoDB
mongoose.connect("mongodb+srv://fms_user:fms_password@shinigami017-azees.mongodb.net/FileManagementSystem?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

// EJS and View Engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// body parser setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Set Static Folder
app.use(express.static(path.join(__dirname, "public")));
app.use("/data", express.static(path.join(__dirname, "data")));

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
const indexRoute = require("./routes/index"),
    homeRoute = require("./routes/home"),
    userRoute = require("./routes/users");
app.use("/", indexRoute);
app.use("/fms.edu.in", homeRoute);
app.use("/fms.edu.in/users", userRoute);

// Port Setup
app.set("port", (process.env.PORT || 3000));
app.listen(app.get("port"), function() {
    console.log("Server started on port " + app.get("port") + "!");
    console.log("Browse the url http://localhost:" + app.get("port") + "/");
    console.log("Press Ctrl + C to stop the server.");
});