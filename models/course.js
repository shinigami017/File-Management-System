const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    sections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section"
    }],
    faculties: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty"
    }],
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    }],
    submissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Submission"
    }]
});

module.exports = mongoose.model("Course", courseSchema);