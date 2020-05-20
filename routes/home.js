var express = require("express"),
    router = express.Router();
// multer = require("multer"),
// upload = multer({ dest: "../data/uploads/" });


var { isLoggedIn, forwardAuthenticated } = require("../config/auth");

// var Task = require("../models/task"),
//     Submission = require("../models/submission"),
//     Course = require("../models/course"),
//     Student = require("../models/student");


// Set storage engine
// const storage = multer.diskStorage({
//     destination: '../data/uploads',
//     filename: (req, res, cb) => {
//         cb(null, file.originalname);
//     }
// });

// Init upload
// const upload = multer({ storage }).single("fileUpload"); //to upload single file and that file input has name field as fileUpload


// Get landing page
router.get("/", forwardAuthenticated, function(request, response) {
    response.render("landing");
});

// Get dashboard
router.get("/dashboard", isLoggedIn, function(request, response) {
    //get all courses and faculties from database and send it to dashboard
    response.render("files/dashboard");

});

// Get particular course page
router.get("/course", isLoggedIn, function(request, response) {
    // find course and send it to the course page which will show all tasks that the course contains 
    response.render("files/course");
});

// Get particular task page for course cid
router.get("/course/activity", isLoggedIn, function(request, response) {
    response.render("files/course-task", { submitted: false });
});

// Get submission page for task (tid) of course (cid)
router.get("/course/activity/submission", isLoggedIn, function(request, response) {
    // Find task and course in database and send it to  submission page
    response.render("files/submission");
});

router.post("/course/activity/submission", function(request, response) {
    response.render("files/course-task", { submitted: true });
});

// Get updates page with all recent tasks
router.get("/updates", isLoggedIn, function(request, response) {
    // Search in tasks db for the newly created tasks 
    // and tasks with pending due date
    response.render("files/updates");
});



module.exports = router;