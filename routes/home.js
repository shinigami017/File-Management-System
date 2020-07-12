const express = require("express"),
    router = express.Router(),
    path = require("path"),
    mongoose = require("mongoose"),
    multer = require("multer");


const { isLoggedIn, forwardAuthenticated } = require("../config/auth");

// Load models
const Task = require("../models/task");
const User = require("../models/user");
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
            // for faculty
            // find his tasks in this course
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
            Student.findOne({ userId: request.user._id }, function(error, foundStudent) {
                if (error) {
                    console.log(error);
                    request.flash("error_msg", "Something went wrong. Please try again");
                    return response.redirect("/fms.edu.in/dashboard");
                }
                const batch = foundStudent.batches.find((b) => (JSON.stringify(b.course.id) === JSON.stringify(foundCourse._id)));
                Task.find({ course: batch.course.id }, function(error, foundTasks) {
                    if (error) {
                        console.log(error);
                        request.flash("error_msg", "Something went wrong. Please try again");
                        return response.redirect("/fms.edu.in/dashboard");
                    }
                    if (foundTasks.length != 0) {
                        const tasks = foundTasks.filter((t) => {
                            return t.sections.find((s) => (JSON.stringify(s) === JSON.stringify(batch.section.id)));
                        }).sort((a, b) => {
                            return (a.date < b.date) ? 1 : -1;
                        });
                        return response.render("files/student-portal/course", { currentUser: currentUser, course: foundCourse, tasks: tasks });
                    } else {
                        return response.render("files/student-portal/course", { currentUser: currentUser, course: foundCourse, tasks: "undefined" });
                    }
                });
            });
        }
    });
});

// Student Routes

// Get particular task page for course cid
router.get("/course/:cid/activity/:tid", isLoggedIn, function(request, response) {
    Task.findById(request.params.tid).populate("submissions").exec(function(error, foundTask) {
        if (error) {
            console.log(error);
            request.flash("error_msg", "Something went wrong. Please try again");
            return response.redirect("/fms.edu.in/course/" + request.params.cid);
        }
        Course.findById(request.params.cid, function(error, foundCourse) {
            if (error) {
                console.log(error);
                request.flash("error_msg", "Something went wrong. Please try again");
                return response.redirect("/fms.edu.in/course/" + request.params.cid);
            }
            if (foundTask.submissions.length != 0) {
                const submission = foundTask.submissions.find((s) => (s.student.username === request.user.username));
                return response.render("files/student-portal/course-task", { currentUser: currentUser, course: foundCourse, task: foundTask, submission: submission });
            }
            return response.render("files/student-portal/course-task", { currentUser: currentUser, course: foundCourse, task: foundTask, submission: "undefined" });
        });
    });
});

// Get submission page for task (tid) of course (cid) for new submission
router.get("/course/:cid/activity/:tid/submission", isLoggedIn, function(request, response) {
    console.log("no submission");
    // Find task and course in database and send it to submission page
    Course.findById(request.params.cid, function(error, foundCourse) {
        if (error) {
            console.log(error);
            request.flash("error_msg", "Something went wrong. Please try again");
            return response.redirect("/fms.edu.in/course/" + request.params.cid + "/activity/" + request.params.tid);
        }
        Task.findById(request.params.tid, function(error, foundTask) {
            if (error) {
                console.log(error);
                request.flash("error_msg", "Something went wrong. Please try again");
                return response.redirect("/fms.edu.in/course/" + request.params.cid + "/activity/" + request.params.tid);
            }
            response.render("files/student-portal/submission", { currentUser: currentUser, course: foundCourse, task: foundTask });
        });
    });
});

// Get submission page for task (tid) of course (cid) for updating a submission
router.get("/course/:cid/activity/:tid/submission/:sid", isLoggedIn, function(request, response) {
    // Find task and course in database and send it to submission page
    Course.findById(request.params.cid, function(error, foundCourse) {
        if (error) {
            console.log(error);
            request.flash("error_msg", "Something went wrong. Please try again");
            return response.redirect("/fms.edu.in/course/" + request.params.cid + "/activity/" + request.params.tid);
        }
        Task.findById(request.params.tid, function(error, foundTask) {
            if (error) {
                console.log(error);
                request.flash("error_msg", "Something went wrong. Please try again");
                return response.redirect("/fms.edu.in/course/" + request.params.cid + "/activity/" + request.params.tid);
            }
            response.render("files/student-portal/submission", { currentUser: currentUser, course: foundCourse, task: foundTask, submissionId: request.params.sid });
        });
    });
});

// post route for adding submission to database 
router.post("/course/:cid/activity/:tid/submission", isLoggedIn, upload.single("fileUploaded"), function(request, response, next) {
    const file = request.file;
    if (!file) {
        request.flash("error_msg", (request.fileValidationError) ? (request.fileValidationError) : "Please upload a solution file");
        return response.redirect("/fms.edu.in/course/" + request.params.cid + "/activity/" + request.params.tid + "/submission/" + request.body.submissionId);
    }
    const filename = file.filename,
        filepath = file.destination;
    Task.findById(request.params.tid).populate("submissions").exec(function(error, foundTask) {
        if (error) {
            console.log(error);
            request.flash("error_msg", "Something went wrong. Please try again");
            return response.redirect("/fms.edu.in/course/" + request.params.cid + "/activity/" + request.params.tid + "/submission/" + request.body.submissionId);
        }
        // finding student by user's id
        Student.findOne({ userId: request.user._id }).populate("submissions").exec(function(error, foundStudent) {
            if (error) {
                console.log(error);
                request.flash("error_msg", "Something went wrong. Please try again");
                return response.redirect("/fms.edu.in/course/" + request.params.cid + "/activity/" + request.params.tid + "/submission/" + request.body.submissionId);
            }
            let student = {
                id: foundStudent._id,
                username: request.user.username,
                name: request.user.firstname + " " + request.user.lastname
            };
            if (request.body.submissionId === "") {
                // creating new Submission object
                const newSubmission = new Submission({ filename: filename, filepath: filepath, student: student, task: request.params.tid, course: request.params.cid });
                // saving newSubmission to database
                newSubmission.save(function(error, savedSubmission) {
                    if (error) {
                        console.log(error);
                        request.flash("error_msg", "Something went wrong. Please try again");
                        return response.redirect("/fms.edu.in/course/" + request.params.cid + "/activity/" + request.params.tid + "/submission");
                    }
                    // adding current submission to student
                    foundStudent.submissions.push(savedSubmission);
                    // saving updated student to database
                    foundStudent.save(function(error, savedStudent) {
                        if (error) {
                            console.log(error);
                            request.flash("error_msg", "Something went wrong. Please try again");
                            return response.redirect("/fms.edu.in/course/" + request.params.cid + "/activity/" + request.params.tid + "/submission");
                        }
                        // adding current submission to current Task
                        foundTask.submissions.push(savedSubmission);
                        // saving updated Task to database
                        foundTask.save(function(error, savedTask) {
                            if (error) {
                                console.log(error);
                                request.flash("error_msg", "Something went wrong. Please try again");
                                return response.redirect("/fms.edu.in/course/" + request.params.cid + "/activity/" + request.params.tid + "/submission");
                            }
                            request.flash("success_msg", "Submission added successfully");
                            return response.redirect("/fms.edu.in/course/" + request.params.cid + "/activity/" + request.params.tid + "/submission/" + savedSubmission._id);
                        });
                    });
                });
            } else {
                // find and update the submission from database
                Submission.findByIdAndUpdate(request.body.submissionId, { filename: filename, filepath: filepath, student: student, task: request.params.tid, course: request.params.cid }, { new: true }, function(error, updatedSubmission) {
                    if (error) {
                        console.log(error);
                        request.flash("error_msg", "Something went wrong. Please try again");
                        return response.redirect("/fms.edu.in/course/" + request.params.cid + "/activity/" + request.params.tid + "/submission/" + request.body.submissionId);
                    }
                    request.flash("success_msg", "Submission updated successfully");
                    return response.redirect("/fms.edu.in/course/" + request.params.cid + "/activity/" + request.params.tid + "/submission/" + updatedSubmission._id);
                });
            }
        });
    });
});

// Get updates page with all recent tasks
router.get("/updates", isLoggedIn, function(request, response) {

    response.render("files/student-portal/updates", { currentUser: currentUser });
});

// Faculty Routes

// Add/update task by faculty for any course
router.post("/course/:cid/add-task", isLoggedIn, upload.single("fileUploaded"), function(request, response, next) {
    // storing all element of Task locally
    const title = request.body.title,
        duedate = request.body.duedate,
        course = request.params.cid,
        sections = request.body.sections;

    // input validations
    const file = request.file;
    errors = [];

    if (!title) {
        request.flash("error_msg", "Please give a title for the task");
        return response.redirect("/fms.edu.in/course/" + request.params.cid);
    }

    if (!file) {
        request.flash("error_msg", (request.fileValidationError) ? (request.fileValidationError) : "Please upload a problem statement file for the task");
        return response.redirect("/fms.edu.in/course/" + request.params.cid);
    }

    const filename = file.filename,
        filepath = file.destination;

    if (!duedate) {
        request.flash("error_msg", "Please give a due date for the task");
        return response.redirect("/fms.edu.in/course/" + request.params.cid);
    }

    if (!sections || sections.length === 0) {
        request.flash("error_msg", "Please select sections for the assigned task");
        return response.redirect("/fms.edu.in/course/" + request.params.cid);
    }

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
        };
        if (request.body.taskid === undefined) {
            // creating new Task object
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
            return response.redirect("/fms.edu.in/course/" + request.params.cid);
        }
        Task.findById(request.params.tid).populate("sections").populate("submissions").exec(function(error, foundTask) {
            if (error) {
                console.log(error);
                request.flash("error_msg", "Something went wrong. Please try again");
                return response.redirect("/fms.edu.in/course/" + request.params.cid);
            }
            return response.render("files/faculty-portal/submissions", { currentUser: currentUser, course: foundCourse, task: foundTask });
        });
    });
});

// Get a particular submission on a particular task of a course
router.get("/course/:cid/task/:tid/submission/:sid", isLoggedIn, function(request, response) {
    Course.findById(request.params.cid, function(error, foundCourse) {
        if (error) {
            console.log(error);
            request.flash("error_msg", "Something went wrong. Please try again");
            return response.redirect("/fms.edu.in/course/" + request.params.cid + "/task/" + request.params.tid + "/all-submissions");
        }
        Task.findById(request.params.tid, function(error, foundTask) {
            if (error) {
                console.log(error);
                request.flash("error_msg", "Something went wrong. Please try again");
                return response.redirect("/fms.edu.in/course/" + request.params.cid + "/task/" + request.params.tid + "/all-submissions");
            }
            Submission.findById(request.params.sid, function(error, foundSubmission) {
                if (error) {
                    console.log(error);
                    request.flash("error_msg", "Something went wrong. Please try again");
                    return response.redirect("/fms.edu.in/course/" + request.params.cid + "/task/" + request.params.tid + "/all-submissions");
                }
                return response.render("files/faculty-portal/submission", { currentUser: currentUser, course: foundCourse, task: foundTask, submission: foundSubmission });
            });
        });
    });
});

router.post("/course/:cid/task/:tid/submission/:sid", isLoggedIn, function(request, response) {
    Submission.findById(request.params.sid, function(error, foundSubmission) {
        if (error) {
            console.log(error);
            request.flash("error_msg", "Something went wrong. Please try again");
            return response.redirect("/fms.edu.in/course/" + request.params.cid + "/task/" + request.params.tid + "/all-submissions");
        }
        foundSubmission.remarks = request.body.remarks;
        foundSubmission.grades = request.body.grades;
        foundSubmission.save(function(error, savedSubmission) {
            if (error) {
                console.log(error);
                request.flash("error_msg", "Something went wrong. Please try again");
                return response.redirect("/fms.edu.in/course/" + request.params.cid + "/task/" + request.params.tid + "/submission/" + request.params.sid);
            }
            request.flash("success_msg", "Submission evaluation saved successfully");
            return response.redirect("/fms.edu.in/course/" + request.params.cid + "/task/" + request.params.tid + "/submission/" + request.params.sid);
        });
    });
});

module.exports = router;