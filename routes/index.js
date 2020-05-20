var express = require("express"),
    router = express.Router();
var { isLoggedIn, forwardAuthenticated } = require("../config/auth");

// Get Homepage
router.get("/", forwardAuthenticated, function(request, response) {
    response.render("index");
});

// User Dashboard
router.get("/dashboard", isLoggedIn, function(request, response) {
    response.render("dashboard", { user: request.user });
});

module.exports = router;