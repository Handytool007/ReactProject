// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    mobileNumber: {
        type: String,
        unique: true,
        sparse: true, // Allows null values to not violate unique constraint
    },
    otp: String,
    otpExpires: Date,
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
