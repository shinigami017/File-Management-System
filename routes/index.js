const express = require("express"),
    fs = require("file-system"),
    router = express.Router();

const { isLoggedIn, forwardAuthenticated } = require("../config/auth");

const Section = require("../models/section");
const Course = require("../models/course");

// Get Homepage
router.get("/", forwardAuthenticated, function(request, response) {
    response.redirect("/fms.edu.in");
});

router.post("/addsections", function(request, response) {
    const course = request.body.course;
    const sec = ['A', 'B', 'C', 'D', 'E', 'F'];
    sec.forEach((i) => {
        let newSection = new Section({ name: i, course: course });
        newSection.save(function(error, section) {
            if (error) {
                console.log(error);
                return response.send("Sections not added");
            }
            // console.log("Section added successfully");
        });
    });
    response.end("Sections added");
});

router.post("/addcourse", function(request, response) {
    const { name, code } = request.body;
    let c = "(" + code + ")" + " " + name;
    let sections = [];
    Section.find({ course: c }, function(error, foundSections) {
        if (error) {
            return response.send("Sections not found");
        }
        foundSections.forEach((sec) => {
            sections.push(sec._id);
        });
        let newCourse = new Course({ name: name, code: code, sections: sections });
        newCourse.save(function(error, course) {
            if (error) {
                return response.send("Course not added");
            }
            return response.json(course);
        });
    });
});

module.exports = router;