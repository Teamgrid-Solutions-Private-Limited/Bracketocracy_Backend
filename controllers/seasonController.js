const Season = require("../model/seasonSchema");
const Round = require("../model/roundSchema");
const Match = require("../model/matchSchema");
const Betting = require("../model/bettingSchema");
const Rank = require("../model/rankSchema");
const User = require("../model/userSchema");
const RankController = require("./rankController");

class SeasonController {
  static handleError = (
    res,
    error,
    message = "Internal Server Error",
    status = 500
  ) => {
    console.error(message, error);
    res.status(status).json({ error: message });
  };

  static addSeason = async (req, res) => {
    try {
      const { year } = req.body;

      if (!year) {
        return res.status(400).json({ error: "Year is required" });
      }

      // Check if the season for the given year already exists
      const existingSeason = await Season.findOne({ year });
      if (existingSeason) {
        return res
          .status(400)
          .json({ error: "Season for this year already exists" });
      }

      const seasonData = new Season({ year });
      const result = await seasonData.save();

      res
        .status(201)
        .json({ message: "Season created successfully", data: result });
    } catch (error) {
      SeasonController.handleError(res, error, "Error creating season");
    }
  };

  static viewAll = async (req, res) => {
    try {
      const data = await Season.find();
      res.status(200).json({ message: "Seasons retrieved successfully", data });
    } catch (error) {
      SeasonController.handleError(res, error, "Error retrieving seasons");
    }
  };

  static searchSeason = async (req, res) => {
    try {
      const seasonId = req.params.id;
      const result = await Season.findById(seasonId);

      if (!result) {
        return res.status(404).json({ error: "Season not found" });
      }

      res.status(200).json({ data: result });
    } catch (error) {
      SeasonController.handleError(res, error, "Error retrieving season by ID");
    }
  };

  static seasonDelete = async (req, res) => {
    try {
      const seasonId = req.params.id;
      const result = await Season.findByIdAndDelete(seasonId);

      if (!result) {
        return res.status(404).json({ error: "Season not found" });
      }

      res
        .status(200)
        .json({ message: "Season deleted successfully", data: result });
    } catch (error) {
      SeasonController.handleError(res, error, "Error deleting season");
    }
  };

  static updateSeason = async (req, res) => {
    try {
      const seasonId = req.params.id;
      const { year } = req.body;

      if (!year) {
        return res.status(400).json({ error: "Year is required" });
      }

      const seasonData = await Season.findById(seasonId);

      if (!seasonData) {
        return res.status(404).json({ error: "Season not found" });
      }

      // Check if the new year is already taken by another season
      const existingSeason = await Season.findOne({ year });
      if (existingSeason && existingSeason._id.toString() !== seasonId) {
        return res
          .status(400)
          .json({ error: "Season for this year already exists" });
      }

      seasonData.year = year;
      const updatedSeason = await seasonData.save();

      res
        .status(200)
        .json({ message: "Season updated successfully", data: updatedSeason });
    } catch (error) {
      SeasonController.handleError(res, error, "Error updating season");
    }
  };

  static createNewTournament = async (req, res) => {
    try {
      const { year } = req.body;

      if (!year) {
        return res.status(400).json({ error: "Year is required" });
      }

      // Check if a season with the given year already exists
      const existingSeason = await Season.findOne({ year });
      if (existingSeason) {
        return res
          .status(400)
          .json({ error: "Season for this year already exists" });
      }

      // Step 1: Set the previous season to "archived"
      await Season.updateMany({}, { status: "archived" });

      // Step 2: Create the new season
      const newSeason = new Season({ year, status: "new" });
      const seasonResult = await newSeason.save();

      // Step 3: Update rounds with the new season ID
      await Round.updateMany(
        { seasonId: { $ne: seasonResult._id } },
        { seasonId: seasonResult._id }
      );

      // Step 4: Archive matches from previous tournaments
      await Match.updateMany(
        { seasonId: { $ne: seasonResult._id } },
        { status: "archived" }
      );

      // Step 5: Delete all betting records of previous season IDs
      await Betting.deleteMany({ seasonId: { $ne: seasonResult._id } });

      // Step 6: Archive ranks and reset scores for all users
      await Rank.updateMany(
        { seasonId: { $ne: seasonResult._id } },
        { status: "archived" }
      );
      await User.updateMany({}, { score: 0 }); // Reset all users' scores

       
   
    let  session = null; //

      // Step 7: Calculate and save ranks for the new season
      await RankController.calculateAndSaveRanks(seasonResult._id,session);

      res.status(201).json({
        message:
          "New tournament created, previous data archived, and ranks reset.",
        data: seasonResult,
      });
    } catch (error) {
      SeasonController.handleError(res, error, "Error creating new tournament");
    }
  };

  static handleError(res, error, message) {
    console.error(message, error);
    res.status(500).json({ message });
  }
}
module.exports = SeasonController;
