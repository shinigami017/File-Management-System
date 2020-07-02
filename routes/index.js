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

// router.post("/addsection", function(request, response) {
//     const course = request.body.course;
//     let i = 'A';
//     let newSection = new Section({ name: i, course: course });
//     newSection.save(function(error, section) {
//         if (error) {
//             return console.log("Section not added");
//         }
//         console.log("Section added");
//         console.log(section);
//     });
//     i = 'B'
//     newSection = new Section({ name: i, course: course });
//     newSection.save(function(error, section) {
//         if (error) {
//             return console.log("Section not added");
//         }
//         console.log("Section added");
//         console.log(section);
//     });
//     i = 'C'
//     newSection = new Section({ name: i, course: course });
//     newSection.save(function(error, section) {
//         if (error) {
//             return console.log("Section not added");
//         }
//         console.log("Section added");
//         console.log(section);
//     });
//     i = 'D'
//     newSection = new Section({ name: i, course: course });
//     newSection.save(function(error, section) {
//         if (error) {
//             return console.log("Section not added");
//         }
//         console.log("Section added");
//         console.log(section);
//     });
//     i = 'E'
//     newSection = new Section({ name: i, course: course });
//     newSection.save(function(error, section) {
//         if (error) {
//             return console.log("Section not added");
//         }
//         console.log("Section added");
//         console.log(section);
//     });
//     i = 'F'
//     newSection = new Section({ name: i, course: course });
//     newSection.save(function(error, section) {
//         if (error) {
//             return console.log("Section not added");
//         }
//         console.log("Section added");
//         console.log(section);
//     });


//     response.end();
// });
// router.post("/addcourse", function(request, response) {
//     const { name, code } = request.body;
//     let c = "(" + code + ")" + " " + name;
//     let sections = [];
//     Section.find({ course: c }, function(error, foundSections) {
//         if (error) {
//             return console.log("Sections not found");
//         }
//         foundSections.forEach((sec) => {
//             sections.push(sec._id);
//         });
//         let newCourse = new Course({ name: name, code: code, sections: sections });
//         newCourse.save(function(error, course) {
//             if (error) {
//                 return console.log("Course not added");
//             }
//             console.log("Course added");
//             response.json(course);
//         });
//     });
// });

module.exports = router;