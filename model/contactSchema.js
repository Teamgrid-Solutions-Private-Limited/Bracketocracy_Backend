const mongoose = require("mongoose");

// Define Contact Schema
const ContactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, "Invalid email format"]
    },
    message: {
        type: String,
        required: [true, "Message is required"],
        trim: true
    }
}, { timestamps: true });

// Create Contact Model
const Contact = mongoose.model("Contact", ContactSchema);

module.exports = Contact;
