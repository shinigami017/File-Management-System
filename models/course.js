const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
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

module.exports = mongoose.model("Course", courseSchema);