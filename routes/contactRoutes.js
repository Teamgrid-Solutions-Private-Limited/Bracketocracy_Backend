const express = require("express");
const router = express.Router();
const Contact = require("../model/contactSchema");

// 🟢 POST: Submit Contact Form
router.post("/", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const newContact = new Contact({ name, email, message });
        await newContact.save();

        res.status(201).json({ success: true, message: "Message saved", data: newContact });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error saving message", error: error.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 }); // Sort by latest
        res.json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching messages", error: error.message });
    }
});
module.exports = router;
