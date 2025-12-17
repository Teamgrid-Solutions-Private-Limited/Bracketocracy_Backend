const Invite = require("../model/leagueInvitationSchema");
const League = require("../model/leagueSchema");
const User = require("../model/userSchema");
const emailController = require("./emailController");
const mongoose = require("mongoose");
 

class invitationController {
  static addInvitation = async (req, res) => {
    try {
      const { email } = req.body;
       
      const { leagueId } = req.params; // Assuming leagueId is in params
      const league = await League.findById(leagueId);
       console.log(league);
       
      if (!league) {
        return res.status(404).json({ message: "League not found." });
      }

      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        try {
          if (league.pendingInvites.includes(email)) {
            return res.status(400).json({ message: "Invitation already pending for this email." });
        }
            await emailController.sendInviteEmail(email,league.title,leagueId);
            league.pendingInvites.push(email);
                await league.save();
            return res.status(200).json({ message: "Invitation sent successfully via email." });
        } catch (error) {
            console.error("Error sending invitation email:", error);
            return res.status(500).json({ message: "Failed to send invitation email." });
        }
    }
    
      
      if (league.userId.includes(user.id) || league.emails.includes(email))
      {
        return res.status(400).json({message:"User is already present in the league."});
      }

      // Create an invitation
      const invitation = new Invite({
        email,
        userId: user.id,
        invitedBy: league.userId[0],
        leagueId,
      });

      // Save the invitation
      const savedInvitation = await invitation.save();
      if (!Array.isArray(league.userId)) {
        league.userId = [];
      }

      if(!Array.isArray(league.emails))
      {
        league.emails=[];
      }

      // // Add the userId to league's userId array

      league.userId.push(user.id);
      league.emails.push(email);

      // Save the league
      await league.save();

      res.status(200).json({
        message: "Invitation sent successfully.",
        invitationData: savedInvitation,
        leagueData: league,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: err.message });
    }
  };


  static showAll = async (req, res) => {
    try {
      // let inviteid = req.params.id;
      const result = await Invite.find();
      res.status(200).json({ message: "Retrive successfully.", data: result });
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  };


  static findInvitation = async (req, res) => {

    const userId = req.params.id;
    console.log("Received userId:", userId, "Type:", typeof userId);

        
        if (!userId) {
            return res.status(400).json({ message: "UserId is required." });
        }

        // Validate if userId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId format." });
        }

    try {
      const result = await Invite.find({ userId}).populate({
        path: "leagueId",
        select: "title",  
      }).populate({
        path: "invitedBy",
        select: "firstName lastName",  
      });
      if (!result || result.length === 0) {
        return res.status(404).json({ message: "No invitations found." });
      }
      res.status(200).json({ message: "Retrive successfully.", data: result });
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  };
 

  static deleteInvite = async (req, res) => {
    try {
      const inviteId = req.params.id;

      // Find the invitation to get associated leagueId and userId
      const invitation = await Invite.findById(inviteId);
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found." });
      }

      // Get leagueId and userId from the invitation
      const { leagueId, userId } = invitation;

      // Delete the invitation
      const result = await Invite.findByIdAndDelete(inviteId);
      if (!result) {
        return res
          .status(500)
          .json({ message: "Failed to delete invitation." });
      }

      // Find the league
      const league = await League.findById(leagueId);
      if (!league) {
        return res.status(404).json({ message: "League not found." });
      }

      // Remove userId from league's userId array
      if (Array.isArray(league.userId)) {
        league.userId = league.userId.filter(
          (id) => id.toString() !== userId.toString()
        );
      }

      // Save the updated league document
      await league.save();

      res.status(200).json({
        message:
          "Invitation deleted successfully and user removed from league.",
        info: result,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
}

module.exports = invitationController;
