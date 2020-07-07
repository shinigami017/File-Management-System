const express = require("express"),
    router = express.Router(),
    path = require("path"),
    mongoose = require("mongoose"),
    multer = require("multer");


const { isLoggedIn, forwardAuthenticated } = require("../config/auth");

// Load models
const Task = require("../models/task");
const User = require("../models/user");
// const Task = require("../models/task");
const Faculty = require("../models/faculty");
const Student = require("../models/student");
const Course = require("../models/course");
const Submission = require("../models/submission");

let currentUser = null;

// Set Storage engine
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'data/files');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

//Init upload
const upload = multer({
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
    // get all the courses of current user and send it with the user's data
    User.findById(request.user._id).populate("courses").exec(function(error, foundUser) {
        if (error) {
            console.log(error);
            request.flash("error_msg", "Something went wrong. Please try again");
            return response.redirect("/fms.edu.in/users/login");
        }
        currentUser = foundUser;
        response.render("files/dashboard", { currentUser: currentUser });
    });
});

// Get particular course page
router.get("/course/:cid", isLoggedIn, function(request, response) {
    // find course and send it to the course page which will show all tasks that the course contains 
    Course.findById(request.params.cid).populate("sections").exec(function(error, foundCourse) {
        if (error) {
            console.log(error);
            request.flash("error_msg", "Something went wrong. Please try again");
            return response.redirect("/fms.edu.in/dashboard");
        }
        if (request.user.role == "faculty") {
            Faculty.findOne({ userId: request.user._id }).populate("tasks").exec(function(error, foundFaculty) {
                if (error) {
                    console.log(error);
                    request.flash("error_msg", "Something went wrong. Please try again");
                    return response.redirect("/fms.edu.in/dashboard");
                }
                let tasks = foundFaculty.tasks.filter((task) => {
                    return JSON.stringify(task.course) === JSON.stringify(request.params.cid);
                }).sort((a, b) => {
                    return (a.date < b.date) ? 1 : -1;
                });
                return response.render("files/faculty-portal/course", { currentUser: currentUser, course: foundCourse, tasks: tasks });
            });
        } else {
            // for student
            // find tasks for him in this course
            return response.render("files/student-portal/course", { currentUser: currentUser, course: foundCourse });
        }
    });
});

// Student Routes

// Get particular task page for course cid
router.get("/course/:cid/activity/:tid", isLoggedIn, function(request, response) {
    response.render("files/student-portal/course-task", { submitted: false, currentUser: currentUser });
});

// Get submission page for task (tid) of course (cid)
router.get("/course/:cid/activity/:tid/submission", isLoggedIn, function(request, response) {
    // Find task and course in database and send it to  submission page
    response.render("files/student-portal/submission", { currentUser: currentUser });
});

router.post("/course/:cid/activity/:tid/submission", isLoggedIn, upload.single("fileUploaded"), function(request, response, next) {
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
    const newSubmission = new Submission({ filename: filename, filepath: filepath, user: user });
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
    response.render("files/student-portal/updates", { currentUser: currentUser });
});

// Faculty Routes

// Add/update task by faculty for any course
router.post("/course/:cid/add-task", isLoggedIn, upload.single("fileUploaded"), function(request, response, next) {
    // uploading task file to local database
    const file = request.file;
    if (!file) {
        // this will print error message on web page
        const error = (request.fileValidationError) ? (request.fileValidationError) : (new Error("Please upload a file"));
        error.httpStatusCode = 400;
        return next(error);
    }
    // storing all element of Task locally
    let title = request.body.title,
        duedate = request.body.duedate,
        filename = file.filename,
        filepath = file.destination,
        course = request.params.cid,
        sections = request.body.sections;

    // getting faculty from user's id
    Faculty.findOne({ userId: request.user._id }).populate("tasks").exec(function(error, foundFaculty) {
        if (error) {
            console.log(error);
            request.flash("error_msg", "Something went wrong. Please try again");
            return response.redirect("/fms.edu.in/course/" + request.params.cid);
        }
        let faculty = {
            id: foundFaculty._id,
            username: request.user.username
        }
        if (request.body.taskid === undefined) {
            // creating Task object
            const newTask = new Task({ title: title, faculty: faculty, filename: filename, filepath: filepath, sections: sections, course: course, duedate: duedate });
            // saving newTask to database
            newTask.save(function(error, savedTask) {
                if (error) {
                    console.log(error);
                    request.flash("error_msg", "Something went wrong. Please try again");
                    return response.redirect("/fms.edu.in/course/" + request.params.cid);
                }
                // adding current task to faculty
                foundFaculty.tasks.push(savedTask);
                // saving updated faculty to database
                foundFaculty.save(function(error, savedFaculty) {
                    if (error) {
                        console.log(error);
                        request.flash("error_msg", "Something went wrong. Please try again");
                        return response.redirect("/fms.edu.in/course/" + request.params.cid);
                    }
                    // return response.render("test", { submission: savedTask });
                    request.flash("success_msg", "Task added successfully");
                    return response.redirect("/fms.edu.in/course/" + request.params.cid);
                });
            });
        } else {
            // find and update the task from database
            Task.findByIdAndUpdate(request.body.taskid, { title: title, faculty: faculty, filename: filename, filepath: filepath, sections: sections, course: course, duedate: duedate }, { new: true }, function(error, updatedTask) {
                if (error) {
                    console.log(error);
                    request.flash("error_msg", "Something went wrong. Please try again");
                    return response.redirect("/fms.edu.in/course/" + request.params.cid + "/task/" + request.body.taskid + "/all-submissions");
                }
                request.flash("success_msg", "Task updated successfully");
                return response.redirect("/fms.edu.in/course/" + request.params.cid + "/task/" + request.body.taskid + "/all-submissions");
            });
        }
    });
});

// Get all submissions on a particular task of a course
router.get("/course/:cid/task/:tid/all-submissions", isLoggedIn, function(request, response) {
    Course.findById(request.params.cid).populate("sections").exec(function(error, foundCourse) {
        if (error) {
            console.log(error);
            request.flash("error_msg", "Something went wrong. Please try again");
            return response.redirect("/fms.edu.in/course/:cid");
        }
        Task.findById(request.params.tid).populate("sections").populate("submissions").exec(function(error, foundTask) {
            if (error) {
                console.log(error);
                request.flash("error_msg", "Something went wrong. Please try again");
                return response.redirect("/fms.edu.in/course/:cid");
            }
            return response.render("files/faculty-portal/submissions", { currentUser: currentUser, course: foundCourse, task: foundTask });
        });
    });
});

// Get a particular submission on a particular task of a course
router.get("/course/:cid/task/:tid/submission/:sid", isLoggedIn, function(request, response) {
    response.render("files/faculty-portal/submission", { currentUser: currentUser });
});

router.post("/course/task/submission", isLoggedIn, function(request, response) {
    response.redirect("/fms.edu.in/course/task/all-submissions");
});

module.exports = router;