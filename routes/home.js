var express = require("express"),
    router = express.Router(),
    path = require("path"),
    multer = require("multer");


var { isLoggedIn, forwardAuthenticated } = require("../config/auth");

var User = require("../models/user");
var Submission = require("../models/submission");


// Set Storage engine
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'data/files');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

//Init upload
var upload = multer({
    storage: storage,
    limits: { files: 1 },
    fileFilter: function(req, file, cb) {
        if (file.mimetype !== "application/pdf") {
            req.fileValidationError = "Only pdf files allowed.";
            return cb(null, false, new Error("Only pdf files allowed."));
        }
        cb(null, true);
    }
});


// Get landing page
router.get("/", forwardAuthenticated, function(request, response) {
    response.render("files/landing");
});

// Get dashboard
router.get("/dashboard", isLoggedIn, function(request, response) {
    //get all courses and faculties from database and send it to dashboard
    response.render((request.user.role == "student") ? "files/student-portal/dashboard" : "files/faculty-portal/dashboard");

});

// Get particular course page
router.get("/course", isLoggedIn, function(request, response) {
    // find course and send it to the course page which will show all tasks that the course contains 
    response.render((request.user.role == "student") ? "files/student-portal/course" : "files/faculty-portal/course");
});

// Student Routes

// Get particular task page for course cid
router.get("/course/activity", isLoggedIn, function(request, response) {
    response.render("files/student-portal/course-task", { submitted: false });
});

// Get submission page for task (tid) of course (cid)
router.get("/course/activity/submission", isLoggedIn, function(request, response) {
    // Find task and course in database and send it to  submission page
    response.render("files/student-portal/submission");
});

router.post("/course/activity/submission", isLoggedIn, upload.single("fileUploaded"), function(request, response, next) {
    // uploading submission file to local data base
    const file = request.file;
    if (!file) {
        // this will print error message on web page
        const error = (request.fileValidationError) ? (request.fileValidationError) : (new Error("Please upload a file"));
        error.httpStatusCode = 400;
        return next(error);
    }
    let filename = file.filename,
        filepath = file.destination,
        user = {
            id: request.user._id,
            username: request.user.username,
            role: request.user.role
        };
    var newSubmission = new Submission({ filename: filename, filepath: filepath, user: user });
    newSubmission.save(function(error, submission) {
        if (error) {
            response.redirect("/fms.edu.in/course/activity");
            return console.log(error);
        }
        User.findById(request.user._id).populate("submissions").exec(function(error, foundUser) {
            if (error) {
                response.redirect("/fms.edu.in/course/activity");
                return console.log(error);
            }
            foundUser.submissions.push(submission);
            foundUser.save(function(error, updatedUser) {
                if (error) {
                    response.redirect("/fms.edu.in/course/activity");
                    return console.log(error);
                }
                response.render("test", { submission: submission });
            });
        });
    });
    // response.redirect("/fms.edu.in/course/activity");
});

// Get updates page with all recent tasks
router.get("/updates", isLoggedIn, function(request, response) {
    // Search in tasks db for the newly created tasks 
    // and tasks with pending due date
    response.render("files/student-portal/updates");
});

// Faculty Routes

// Add/update task by faculty for any course
router.post("/course/add-task", isLoggedIn, upload.single("fileUploaded"), function(request, response, next) {
    // uploading task file to local database
    const file = request.file;
    if (!file) {
        // this will print error message on web page
        const error = (request.fileValidationError) ? (request.fileValidationError) : (new Error("Please upload a file"));
        error.httpStatusCode = 400;
        return next(error);
    }
    let filename = file.filename,
        filepath = file.destination,
        user = {
            id: request.user._id,
            username: request.user.username,
            role: request.user.role
        };
    var newSubmission = new Submission({ filename: filename, filepath: filepath, user: user });
    newSubmission.save(function(error, submission) {
        if (error) {
            response.redirect("/fms.edu.in/course");
            return console.log(error);
        }
        User.findById(request.user._id).populate("submissions").exec(function(error, foundUser) {
            if (error) {
                response.redirect("/fms.edu.in/course");
                return console.log(error);
            }
            foundUser.submissions.push(submission);
            foundUser.save(function(error, updatedUser) {
                if (error) {
                    response.redirect("/fms.edu.in/course");
                    return console.log(error);
                }
                response.render("test", { submission: submission });
            });
        });
    });
    // response.redirect("/fms.edu.in/course");
});

// Get all submissions on a particular task of a course
router.get("/course/task/all-submissions", isLoggedIn, function(request, response) {
    response.render("files/faculty-portal/submissions");
});

// Get a particular submission on a particular task of a course
router.get("/course/task/submission", isLoggedIn, function(request, response) {
    response.render("files/faculty-portal/submission");
});

router.post("/course/task/submission", isLoggedIn, function(request, response) {
    response.redirect("/fms.edu.in/course/task/all-submissions");
});

module.exports = router;