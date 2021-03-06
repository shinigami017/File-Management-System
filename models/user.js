var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: false
    },
    year: {
        type: Number,
        required: false
    },
    program: {
        type: String,
        required: false
    },
    branch: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("User", userSchema);