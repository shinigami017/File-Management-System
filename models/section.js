var mongoose = require("mongoose");

var sectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    students: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student"
        },
        username: String
    }],
    faculties: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Faculty"
        },
        username: String
    }]
});

module.exports = mongoose.model("Section", sectionSchema);