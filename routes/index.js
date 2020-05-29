var express = require("express"),
    fs = require("file-system"),
    router = express.Router();
var { isLoggedIn, forwardAuthenticated } = require("../config/auth");

// Get Homepage
router.get("/", forwardAuthenticated, function(request, response) {
    response.redirect("/fms.edu.in");
});

module.exports = router;