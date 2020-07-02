var mongoose = require("mongoose");

var submissionSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    filepath: {
        type: String,
        required: true
    },
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true
        }
    },
    course: {
        type: mongoose.Schema.ObjectId,
        ref: "Course"
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Submission", submissionSchema);