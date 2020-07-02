var mongoose = require("mongoose");

var facultySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    courses: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    },
    sections: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section"
        },
        name: String,
        course: String
    }]
});

module.exports = mongoose.model("Faculty", facultySchema);