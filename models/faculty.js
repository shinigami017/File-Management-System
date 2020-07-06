var mongoose = require("mongoose");

var facultySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
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
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task"
    }]
});

module.exports = mongoose.model("Faculty", facultySchema);