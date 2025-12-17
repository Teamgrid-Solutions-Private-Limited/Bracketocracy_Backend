const Message = require("../model/messageSchema");
const League = require("../model/leagueSchema");

class messageController {
  // Add a new message
  static addMessage = async (req, res) => {
    try {
      const { id } = req.params;
      console.log(id);
      const { message,userId } = req.body;
      console.log(message,userId);
      // const userId = req.user.userId; // Get userId from the token

      // Validate required fields
      if (! id || !message) {
        return res.status(400).json({ error: "League ID and message are required" });
      }

      // Find the league
      const league = await League.findById(id);
      if (!league) {
        return res.status(404).json({ message: 'League not found.' });
      }

      // Check if the user is part of the league
      if (!Array.isArray(league.userId) || !league.userId.includes(userId)) {
        return res.status(403).json({ message: 'User is not a member of this league.' });
      }

      // Create a new message
      const newMessage = new Message({
        leagueId:league._id,
        userId,
        message,
        status: 1 // Assuming status 1 means 'sent'
      });

      // Save the message
      const savedMessage = await newMessage.save();

      res.status(201).json({
        message: 'Message sent successfully.',
        data: savedMessage
      });
    } catch (err) {
      console.error('Message sending error:', err.message);
      res.status(500).json({ message: 'An error occurred while sending the message.' });
    }
  }






  // Show all messages for a league
  static showAllMessages = async (req, res) => {
    try {
      const { id } = req.params;
      console.log(id);

      // Find the league
      const league = await League.findById(id);
      if (!league) {
        return res.status(404).json({ message: "League not found." });
      }

      // Find all messages for the league
      const messages = await Message.find({ leagueId:id });

      res.status(200).json({
        message: "Messages retrieved successfully.",
        data: messages,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: err.message });
    }
  };

  
}

module.exports = messageController;
