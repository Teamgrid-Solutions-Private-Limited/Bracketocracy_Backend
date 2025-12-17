const mongoose = require("mongoose");
const Rank = require("../model/rankSchema");
const User = require("../model/userSchema");
const Season = require("../model/seasonSchema");

class RankController {


 
  static calculateAndSaveRanks = async (seasonId) => {
    try {
      // Fetch users sorted by their scores in descending order
      const users = await User.find().sort({ score: -1 });

      let currentRank = 0;
      let currentScore = null; // To track the last score

      const rankUpdates = users.map((user) => {
        // If the user's score is different from the last score, increase the rank
        if (user.score !== currentScore) {
          currentRank += 1; // Move to the next rank if the score changes
        }

        // Update the current score for comparison in the next iteration
        currentScore = user.score;

        // Prepare the rank update for each user
        return {
          userId: user._id,
          seasonId: seasonId,
          rank: currentRank,
          points: user.score,
          created: new Date(),
          updated: new Date(),
        };
      });

      // Clear existing ranks for the season
      await Rank.deleteMany({ seasonId });

      // Insert the new ranks into the Rank model
      await Rank.insertMany(rankUpdates);

      console.log("Ranks calculated and saved successfully");
    } catch (error) {
      console.error("Error calculating ranks:", error);
      throw new Error("Failed to calculate and save ranks.");
    }
  };




  /**
    * ✅ Get User Rank for a Season
    */

//  static getRanks = async (req, res) => {
//     let { limit, lastRank, lastId } = req.query;
//     limit = parseInt(limit) || 20; // Default limit = 20
  
//     try {
//       const activeSeason = await Season.findOne({ status: "new" }).select("_id").lean();
//       if (!activeSeason) {
//         return res.status(404).json({ message: "No active season found" });
//       }
//       const seasonId = activeSeason._id;
  
//       let matchFilter = { seasonId };
  
//       if (lastRank && lastId) {
//         matchFilter.$or = [
//           { rank: { $gt: lastRank } }, // ✅ Get users with a higher rank
//           { rank: lastRank, _id: { $gt: new mongoose.Types.ObjectId(lastId) } }, // ✅ Get remaining users with same rank
//         ];
//       }
  
//       const superAdminRoleId = new mongoose.Types.ObjectId("670f757d6091074a994db4d8");
  
//       const ranks = await Rank.aggregate([
//         { $match: matchFilter },
//         {
//           $lookup: {
//             from: "users",
//             localField: "userId",
//             foreignField: "_id",
//             as: "user",
//           },
//         },
//         { $unwind: "$user" },
//         {
//           $match: {
//             "user.roleId": { $ne: superAdminRoleId }, // ✅ Exclude Super Admin users properly
//           },
//         },
//         {
//           $project: {
//             _id: 1,
//             rank: 1,
//             seasonId: 1,
//             created: 1,
//             updated: 1,
//             userId: "$user._id",
//             userName: "$user.userName",
//             firstName: "$user.firstName",
//             lastName: "$user.lastName",
//             email: "$user.email",
//             score: "$user.score",
//             profilePhoto: "$user.profilePhoto",
//             roleId: "$user.roleId",
//           },
//         },
//         { $sort: { rank: 1, _id: 1 } },
//         { $limit: limit },
//       ]);
  
//       // ✅ Ensure pagination works even when users share the same rank
//       const nextCursor =
//         ranks.length > 0
//           ? { lastRank: ranks[ranks.length - 1].rank, lastId: ranks[ranks.length - 1]._id }
//           : null;
  
//       res.status(200).json({ ranks, nextCursor });
//     } catch (error) {
//       res.status(500).json({ message: "Error retrieving ranks" });
//     }
//   };

static getRanks = async (req, res) => {
  let { seasonId } = req.params;
  let { page = 1, limit = 10 } = req.query;

  try {
      // Ensure page and limit are numbers
      page = parseInt(page, 10);
      limit = parseInt(limit, 10);

      if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
          return res.status(400).json({ message: "Invalid pagination parameters" });
      }

      // If no seasonId provided, fetch the active season
      if (!seasonId) {
          const activeSeason = await Season.findOne({ status: "new" }).exec();
          if (!activeSeason) {
              return res.status(404).json({ message: "No active season found" });
          }
          seasonId = activeSeason._id;
      }

      // Calculate and save ranks for the season
      await RankController.calculateAndSaveRanks(seasonId);

      // Get total count for pagination
      const totalRanks = await Rank.countDocuments({ seasonId });

      // Fetch the calculated ranks with pagination
      const ranks = await Rank.find({ seasonId })
          .populate(
              "userId",
              "userName firstName lastName email score profilePhoto roleId"
          )
          .sort({ rank: 1 })
          .skip((page - 1) * limit)
          .limit(limit);

      res.status(200).json({
          success: true,
          page,
          limit,
          totalPages: Math.ceil(totalRanks / limit),
          totalRanks,
          data: ranks
      });
  } catch (error) {
      console.error("Error retrieving ranks:", error);
      res.status(500).json({ message: "Error retrieving ranks" });
  }
};








}

module.exports = RankController;
