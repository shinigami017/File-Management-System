const express = require("express"),
    router = express.Router(),
    bcrypt = require("bcryptjs"),
    passport = require("passport");
// Load User Model
const User = require("../models/user");
const { isLoggedIn, forwardAuthenticated } = require('../config/auth');

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

    // get user details from request
    const { username, firstname, lastname, email, phone, role, password, password2 } = request.body;
    let errors = [];

    // form validations
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

    if (password.length < 6) {
        errors.push({ msg: "Password must be at least 6 character long" });
    }

    if (!password2) {
        errors.push({ msg: "Please confirm password" });
    }

    if (password != password2) {
        errors.push({ msg: "Passwords do not match" });
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
                let newUser = new User({ username, firstname, lastname, email, phone, role, password });
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
    response.render("files/change-password", { currentUser: request.user });
});

// Post method to process the password change
router.post("/changepassword", isLoggedIn, function(request, response) {

    // get user details from request
    const { username, cpassword, password, password2 } = request.body;
    let errors = [];

    // form validations
    if (!cpassword) {
        errors.push({ msg: "Please enter your current password" });
    }

    if (!password) {
        errors.push({ msg: "Please enter new password" });
    }

    if (password.length < 6) {
        errors.push({ msg: "Password must be at least 6 character long" });
    }

    if (!password2) {
        errors.push({ msg: "Please confirm new password" });
    }

    if (password != password2) {
        errors.push({ msg: "Passwords do not match" });
    }
    // match current password with the one entered by user
    bcrypt.compare(cpassword, request.user.password, function(error, isMatch) {
        if (error) {
            console.log(error);
            request.flash("error_msg", "Something went wrong. Please try again");
            return response.redirect("/fms.edu.in/users/changepassword");
        } else if (!isMatch) {
            errors.push({ msg: "Please enter your valid current password" });
            return response.render("files/change-password", { currentUser: request.user, errors });
        } else {
            // if error generated then redirect to changepassword with the error message
            if (errors.length > 0) {
                return response.render("files/change-password", { currentUser: request.user, errors });
            }
            // else update the new password in database
            User.findOne({ username: username }, function(error, foundUser) {
                if (error) {
                    console.log(error);
                    request.flash("error_msg", "Something went wrong. Please try again");
                    return response.redirect("/fms.edu.in/users/changepassword");
                }
                bcrypt.genSalt(10, function(error, salt) {
                    bcrypt.hash(password, salt, function(error, hash) {
                        if (error) {
                            console.log(error);
                            request.flash("error_msg", "Something went wrong. Please try again");
                            return response.redirect("/fms.edu.in/users/changepassword");
                        }
                        foundUser.password = hash;
                        foundUser.save(function(error, user) {
                            if (error) {
                                console.log(error);
                                request.flash("error_msg", "Something went wrong. Please try again");
                                return response.redirect("/fms.edu.in/users/changepassword");
                            }
                            console.log("User password changed.")
                            request.logout();
                            request.flash("success_msg", "Password changed. Log in to continue");
                            return response.redirect("/fms.edu.in/users/login");
                        });
                    });
                });
            });
        }
    });
});

// Logout User
router.get("/logout", function(request, response) {
    request.logout();
    request.flash("success_msg", "You're successfully logged out");
    response.redirect("/fms.edu.in/users/login");
});

module.exports = router;