const League = require("../model/leagueSchema");
const User = require("../model/userSchema");
const LeagueInvitation = require('../model/leagueInvitationSchema');
const emailController = require('../controllers/emailController');
const mongoose = require('mongoose');


class leagueController {


  static addLeague = async (req, res) => {
    const { title, emails, userId, allowInvitation } = req.body;

    if (!title || !userId) {
        return res.status(400).json({ error: "Title and userId are required." });
    }

    try {
        // Fetch creator's email and check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const userEmail = user.email;

        // Convert emails to an array, remove duplicates, and exclude creator's email
        let emailArray = Array.isArray(emails) ? [...new Set(emails)] : emails ? [emails] : [];
        emailArray = emailArray.filter(email => email !== userEmail);

        // Fetch users from DB based on provided emails
        const users = await User.find({ email: { $in: emailArray } });
        const foundEmails = users.map(u => u.email);
        const notFoundEmails = emailArray.filter(email => !foundEmails.includes(email));
        const userIds = [userId, ...users.map(u => u._id)];

        // Create a new league without checking for duplicate title
        const newLeague = await new League({
            title,
            userId: [...new Set(userIds)], // Remove duplicates
            emails: foundEmails,
            pendingInvites: notFoundEmails,
            allowInvitation,
        }).save();

        // Prepare invitations
        const invitations = users.map(u => ({
            email: u.email,
            userId: u._id,
            invitedBy: userId,
            leagueId: newLeague._id,
        }));

        if (invitations.length) {
            await LeagueInvitation.insertMany(invitations);
        }

        // Send invitations asynchronously
        emailArray.forEach(email => emailController.sendInviteEmail(email, title, newLeague._id));

        return res.status(201).json({
            message: "League created successfully.",
            info: { league: newLeague, invitations },
        });

    } catch (err) {
        res.status(500).json({ error: "An unexpected error occurred.", details: err.message });
    }
};








  static viewAll = async (req, res) => {
    try {
      const data = await League.find();
      res.status(201).json({ message: "View successful.", info: data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  static searchLeagueByLeagueId = async (req, res) => {
    try {
      let leagueId = req.params.id || req.query.leagueId;
      const result = await League.findById(leagueId);
      res.status(201).json({ data: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  static searchLeague = async (req, res) => {
    try {

      const userId = req.params.id || req.query.userId;


      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid user ID format." });
      }


      const leagues = await League.find({ userId: userId });

      // Check if any leagues were found
      if (leagues.length === 0) {
        return res.status(404).json({ message: "No leagues found for this user." });
      }


      res.status(200).json({ data: leagues });
    } catch (err) {

      res.status(500).json({ error: err.message });
    }
  };

  static leagueDelete = async (req, res) => {
    try {
      const data = req.params.id;
      const result = await League.findByIdAndDelete(data);
      const deleteInvitation = await LeagueInvitation.deleteMany({ leagueId: data});
      console.log(deleteInvitation);
      
      res
        .status(201)
        .json({ message: "league deleted successfully.", info: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
 
  
 

static updateLeague = async (req, res) => {
  const { emails, title, allowInvitation } = req.body;
  const { id } = req.params;

  // Validate required fields
  if (!id || !emails) {
    return res.status(400).json({ error: "leagueId and emails are required" });
  }

  const emailArray = Array.isArray(emails) ? emails : [emails];

  try {
    // Find the original league and populate user details
    const originalLeague = await League.findById(id).populate('userId');
    if (!originalLeague) {
      return res.status(404).json({ error: "League not found." });
    }

    // Ensure pendingInvites array exists
    if (!Array.isArray(originalLeague.pendingInvites)) {
      originalLeague.pendingInvites = [];
    }

    // Retrieve the creator's email to exclude from the update
    const creatorUserId = originalLeague.userId[0]; // Assuming the first user is the creator
    const creatorUser = await User.findById(creatorUserId);
    const creatorEmail = creatorUser.email;

    // Filter out the creator's email
    const filteredEmails = emailArray.filter(email => email !== creatorEmail);

    // Find users for the provided emails (only registered users)
    const existingUsers = await User.find({ email: { $in: filteredEmails } });
    const existingUserIds = existingUsers.map(user => user._id);
    const foundEmails = existingUsers.map(user => user.email);

    // Identify emails that are not associated with any registered user
    const notFoundEmails = filteredEmails.filter(email => !foundEmails.includes(email));

    // Send invitation emails to unregistered emails & add to pendingInvites
    if (notFoundEmails.length > 0) {
      for (const email of notFoundEmails) {
        if (!originalLeague.pendingInvites.includes(email)) {
          await emailController.sendInviteEmail(email, title, id);
          originalLeague.pendingInvites.push(email);
        }
      }
      console.log("Invitation emails sent to:", notFoundEmails);
    }

    // Determine users to be removed (existing in the league but no longer in the updated email list)
    const originalEmails = originalLeague.emails;
    const removedEmails = originalEmails.filter(email => !filteredEmails.includes(email));
    const removedUsers = await User.find({ email: { $in: removedEmails } });
    const removedUserIds = removedUsers.map(user => user._id);

    // Update the league:
    // 1. Remove user IDs no longer in the league
    await League.updateOne({ _id: id }, { $pull: { userId: { $in: removedUserIds } } });

    // 2. Add only registered user IDs and emails (avoiding duplicates with `$addToSet`)
    const updatedLeague = await League.findByIdAndUpdate(
      id,
      {
        $addToSet: { userId: { $each: existingUserIds } },
        emails: foundEmails, // Only save registered emails here
        pendingInvites: originalLeague.pendingInvites, // Preserve pending invites
        title,
        allowInvitation,
      },
      { new: true }
    );

    res.status(200).json({
      message: "League updated successfully.",
      info: updatedLeague,
    });
  } catch (err) {
    res.status(500).json({
      error: "An unexpected error occurred.",
      details: err.message,
    });
  }
};

  
  
  
  


  static deleteUser = async (req, res) => {
    const { leagueId, userId,email } = req.body;

    if (!leagueId) {
      return res.status(400).json({
        error: "League ID and User ID are required.",
      });
    }

    try {
      // Find the league by its ID
      const league = await League.findById(leagueId);

      if (!league) {
        return res.status(404).json({
          error: "League not found.",
        });
      }

      if(userId){
         // Remove the userId from the userId array
      const userIndex = league.userId.indexOf(userId);
      if (userIndex > -1) {
        league.userId.splice(userIndex, 1);
      }

      // Find the user's email
      const user = await User.findById(userId);
      if (user) {
        // Remove the user's email from the emails array
        const emailIndex = league.emails.indexOf(user.email);
        if (emailIndex > -1) {
          league.emails.splice(emailIndex, 1);
        }
      }
      }else if(email){
        const emailIndex = league.pendingInvites.indexOf(email);
        if (emailIndex > -1) 
          {
            league.pendingInvites.splice(emailIndex, 1);
          }

      }

     
     
        
      

      // Save the updated league document
      await league.save();

      res.status(200).json({
        message: "User successfully removed from league.",
        league: league,
      });
    } catch (error) {
      res.status(500).json({
        error: "An unexpected error occurred.",
        details: error.message,
      });
    }
  };


static deletePendingInvites = async (req, res) => {
  const { leagueId, email } = req.body;

  if (!leagueId || !email) {
    return res.status(400).json({
      error: "League ID and email are required.",
    });
  }

  try {
    // Find the league by its ID
    const league = await League.findById(leagueId);

    if (!league) {
      return res.status(404).json({
        error: "League not found.",
      });
    }

    // Remove the email from the pendingInvites array
    const emailIndex = league.pendingInvites.indexOf(email);
    if (emailIndex > -1) 
      {
        league.pendingInvites.splice(emailIndex, 1);
      }
      await league.save();

      res.status(200).json({
        message: "User successfully removed from league.",
        league: league,
      });

}catch (error) {
  res.status(500).json({
    error: "An unexpected error occurred.",
    details: error.message,
  });
}
};
}

module.exports = leagueController;