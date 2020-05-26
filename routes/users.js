var express = require("express"),
    router = express.Router(),
    bcrypt = require("bcryptjs"),
    passport = require("passport");

// Load User Model
var User = require("../models/user");
var { isLoggedIn, forwardAuthenticated } = require('../config/auth');

// Register Form
router.get("/register", forwardAuthenticated, function(request, response) {
    response.render("files/register");
});

// Login Form
router.get("/login", forwardAuthenticated, function(request, response) {
    response.render("files/login");
});

// Register User
router.post("/register", function(request, response) {
    var { username, firstname, lastname, email, phone, role, password, password2 } = request.body;
    let errors = [];

    if (!username) {
        errors.push({ msg: "Please enter username" });
    }

    if (!firstname) {
        errors.push({ msg: "Please enter first name" });
    }

    if (!email) {
        errors.push({ msg: "Please enter email" });
    }

    if (!phone) {
        errors.push({ msg: "Please enter phone" });
    }

    if (!role) {
        errors.push({ msg: "Please select role" });
    }

    if (!password) {
        errors.push({ msg: "Please enter password" });
    }

    if (!password2) {
        errors.push({ msg: "Please confirm password" });
    }

    if (password != password2) {
        errors.push({ msg: "Passwords do not match" });
    }

    if (password.length < 6) {
        errors.push({ msg: "Password must be at least 6 character long" });
    }

    if (errors.length > 0) {
        response.render("files/register", { errors, username, firstname, lastname, email, phone, role, password, password2 });
    } else {
        User.findOne({ username: username }, function(error, user) {
            if (user) {
                errors.push({ msg: "Username already registered" });
                response.render("files/register", { errors, username, firstname, lastname, email, phone, role, password, password2 });
            } else {
                let name = firstname + " " + lastname;
                let newRole;
                // if (role == "faculty") {
                //     newRole = new Faculty({ username: username, name: name, email: email, phone: phone, password: password });
                // }
                // if (role == "student") {
                //     newRole = new Student({ username: username, name: name, email: email, phone: phone, password: password });
                // }
                var newUser = new User({ username, firstname, lastname, email, phone, role, password });
                bcrypt.genSalt(10, function(error, salt) {
                    bcrypt.hash(newUser.password, salt, function(error, hash) {
                        if (error) throw error;
                        newUser.password = hash;
                        // newRole.password = hash;
                        newUser.save(function(error, user) {
                            if (error) {
                                return console.log(error);
                            }
                            // newRole.save(function(error, role) {
                            //     if (error) {
                            //         return console.log(error);
                            //     }
                            request.flash("success_msg", "You're successfully registered. Log in to continue");
                            response.redirect("/fms.edu.in/users/login");
                            // });
                        });
                    });
                });
            }
        });
    }
});

// Login User
router.post("/login", passport.authenticate("local", {
    successRedirect: "/fms.edu.in/dashboard",
    failureRedirect: "/fms.edu.in/users/login",
    failureFlash: true
}), function(request, response) {
    response.redirect("/fms.edu.in");
});

// Get the user's profile page
router.get("/profile", isLoggedIn, function(request, response) {
    // Check for the role of user
    // get student and courses from student's sem from database and send it to profile
    // Student.findOne({ username: request.user.username }, function(error, foundStudent) {
    //     if (error) {
    //         response.json(error);
    //     } else {
    //         response.render("files/profile", { currentUser: foundStudent });
    //     }
    // });
    User.findOne({ username: request.user.username }, function(error, foundUser) {
        if (error) {
            response.json(error);
        } else {
            response.render((request.user.role == "student") ? "files/student-portal/profile" : "files/faculty-portal/profile", { currentUser: foundUser });
        }
    });
});

// Get the user's edit profile page
router.get("/editprofile", isLoggedIn, function(request, response) {
    // Check for the role of user
    // get student and send it to edit profile
    // Student.findOne({ username: request.user.username }, function(error, foundStudent) {
    //     if (error) {
    //         response.json(error);
    //     } else {
    //         response.render("files/edit-profile", { currentUser: foundStudent });
    //     }
    // });
    User.findOne({ username: request.user.username }, function(error, foundUser) {
        if (error) {
            response.json(error);
        } else {
            response.render("files/student-portal/edit-profile", { currentUser: foundUser });
        }
    });
});

// Post method to process the profile update
router.post("/editprofile", isLoggedIn, function(request, response) {
    // Check for the role of user
    // get student details from body and update it to database
    // if error generated then redirect to editpassword with the error message
    // else redirect to profile
    // response.render("files/edit-profile", { user: request.user });
    response.redirect("/fms.edu.in/users/profile");
});

// Get the user's change password page
router.get("/changepassword", isLoggedIn, function(request, response) {
    // get user and send it to change password
    // Student.findOne({ username: request.user.username }, function(error, foundStudent) {
    //     if (error) {
    //         response.json(error);
    //     } else {
    //         response.render("files/change-password", { currentUser: foundStudent });
    //     }
    // });
    User.findOne({ username: request.user.username }, function(error, foundUser) {
        if (error) {
            response.json(error);
        } else {
            response.render("files/student-portal/change-password", { currentUser: foundUser });
        }
    });
});

// Post method to process the password change
router.post("/changepassword", isLoggedIn, function(request, response) {
    // get user details from body and update it to database
    // if error generated then redirect to changepassword with the error message
    // else redirect to login with successful password change message
    response.redirect("/fms.edu.in/users/login");
});


// Logout User
router.get("/logout", function(request, response) {
    request.logout();
    request.flash("success_msg", "You're successfully logged out");
    response.redirect("/fms.edu.in/users/login");
});
// router.get("/logout", function(request, response) {
//     request.logout();
//     response.redirect("/fms.edu.in");
// });

module.exports = router;