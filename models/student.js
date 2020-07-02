var mongoose = require("mongoose");

var studentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    branch: String,
    section: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section"
        },
        name: String
    }
});

module.exports = mongoose.model("Student", studentSchema);