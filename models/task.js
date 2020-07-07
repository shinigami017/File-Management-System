const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    faculty: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Faculty"
        },
        username: String
    },
    filename: {
        type: String,
        required: true
    },
    filepath: {
        type: String,
        required: true
    },
    sections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section"
    }],
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    },
    submissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Submission"
    }],
    duedate: {
        type: Date,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Task", taskSchema);