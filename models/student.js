var mongoose = require("mongoose");

var studentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    branch: String,
    batches: [{
        course: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course"
            },
            name: String
        },
        section: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Section"
            },
            name: String,
        }
    }],
    submissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Submission"
    }]
});

module.exports = mongoose.model("Student", studentSchema);