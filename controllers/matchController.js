const Match = require("../model/matchSchema");
const Team = require("../model/teamSchema");
const Round = require("../model/roundSchema");
const Season = require("../model/seasonSchema");
const Zone = require("../model/zoneSchema");
const bettingController = require("./bettingController");
const {
  roundOrder,
  generateRoundSlug,
  getWinnersFromCompletedMatches,
} = require("../services/matchService");
const logger = require("../services/logger");

class MatchController {


  static async createMatch(req, res) {
    try {
      const {
        teamOneId,
        teamTwoId,
        teamOneScore = null,
        teamTwoScore = null,
        roundSlug,
        zoneSlug,
        seasonId, // Optional: can be null if not provided
        matchNo,
      } = req.body;

      // Validate that team IDs are present
      if (!teamOneId || !teamTwoId) {
        return res.status(400).json({ message: "Team IDs are required" });
      }

      // Fetch the active season if seasonId is not provided
      let activeSeason = seasonId;
      if (!seasonId) {
        const activeSeasonDoc = await Season.findOne({ status: "new" }).exec();
        if (!activeSeasonDoc) {
          return res.status(404).json({ message: "No active season found" });
        }
        activeSeason = activeSeasonDoc._id;
      }

      // Fetch documents from the database
      const teamOne = await Team.findById(teamOneId).exec();
      const teamTwo = await Team.findById(teamTwoId).exec();
      const round = roundSlug
        ? await Round.findOne({ slug: roundSlug }).exec()
        : null;
      const zone = zoneSlug
        ? await Zone.findOne({ slug: zoneSlug }).exec()
        : null;

      // Check if teams exist
      if (!teamOne || !teamTwo) {
        return res.status(404).json({ message: "One or both teams not found" });
      }

      // Create and save the match document
      const match = new Match({
        teamOneId,
        teamTwoId,
        teamOneScore,
        teamTwoScore,

        roundSlug,
        zoneSlug,
        seasonId: activeSeason,
        matchNo,
        created: new Date(),
        updated: new Date(),
      });

      await match.save();
      res.status(201).json({ message: "Match created successfully", match });
    } catch (error) {
      console.error("Error creating match:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async finalScores(req, res) {
    try {
      const { teamOneScore, teamTwoScore } = req.body;
      const { id } = req.params;

      if (!id || teamOneScore === undefined || teamTwoScore === undefined) {
        return res
          .status(400)
          .json({ message: "Match ID and scores are required" });
      }

      const match = await Match.findById(id).exec();
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      match.teamOneScore = teamOneScore;
      match.teamTwoScore = teamTwoScore;



      // Determine the winner or apply a tiebreaker if needed
      if (teamOneScore > teamTwoScore) {
        match.decidedWinner = match.teamOneId;
      } else if (teamTwoScore > teamOneScore) {
        match.decidedWinner = match.teamTwoId;
      } else {
        // Handle tiebreakers (custom logic)
        match.decidedWinner = await MatchController.handleTiebreaker(match);
      }

      match.status = "completed"; // Update match status to "completed"

      const updatedMatch = await match.save();
      await bettingController.handleMatchEnd({ params: { matchId: id } }, res);

      res
        .status(200)
        .json({ message: "Match updated successfully", updatedMatch });
    } catch (error) {
      console.error("Error updating final scores:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async getMatchById(req, res) {
    try {
      const match = await Match.findById(req.params.id).exec();
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      res.status(200).json(match);
    } catch (error) {
      console.error("Error fetching match:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }



  static async updateMatch(req, res) {
    try {
      const { id } = req.params;
      const updatedData = req.body;

      // Fetch the match to check if it's archived
      const match = await Match.findById(id);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      // Check if the match is archived
      if (match.archived) {
        return res
          .status(403)
          .json({ error: "This match is archived and cannot be modified" });
      }

      // Proceed with the update if not archived
      const updatedMatch = await Match.findByIdAndUpdate(id, updatedData, {
        new: true,
        runValidators: true,
      });

      res
        .status(200)
        .json({ message: "Match updated successfully", updatedMatch });
    } catch (error) {
      console.error("Error updating match:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async deleteMatch(req, res) {
    try {
      const { id } = req.params;

      // Fetch the match to check if it's archived
      const match = await Match.findById(id);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      // Check if the match is archived
      if (match.archived) {
        return res
          .status(403)
          .json({ error: "This match is archived and cannot be deleted" });
      }

      // Proceed with deletion if not archived
      await Match.findByIdAndDelete(id);
      res.status(200).json({ message: "Match deleted successfully" });
    } catch (error) {
      console.error("Error deleting match:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async getMatch(req, res) {
    try {
      const matches = await Match.aggregate([
        {
          $lookup: {
            from: "teams",
            localField: "teamOneId",
            foreignField: "_id",
            as: "teamOne",
          },
        },
        {
          $lookup: {
            from: "teams",
            localField: "teamTwoId",
            foreignField: "_id",
            as: "teamTwo",
          },
        },
        {
          $lookup: {
            from: "zones",
            localField: "zoneSlug",
            foreignField: "slug",
            as: "zone",
          },
        },
        {
          $lookup: {
            from: "rounds",
            localField: "roundSlug",
            foreignField: "slug",
            as: "round",
          },
        },
        {
          $unwind: { path: "$teamOne", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$teamTwo", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$zone", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$round", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            _id: 1,
            teamOneId: 1,
            teamOneScore: 1,
            teamTwoId: 1,
            teamTwoScore: 1,
            decidedWinner: 1,
            status: 1,
            matchNo: 1,
            seasonId: 1,
            created: 1,
            updated: 1,
            teamOne: {
              _id: 1,
              name: 1,
              logo: 1,
              seed: 1
            },
            teamTwo: {
              _id: 1,
              name: 1,
              logo: 1,
              seed: 1
            },
            zone: {
              name: 1,
              slug: 1,
            },
            round: {
              number: 1,
              slug: 1,
            },
          },
        },
      ]);

      res
        .status(200)
        .json({ message: "Match retrieved successfully", info: matches });
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ error: error.message });
    }
  }
  static async handleTiebreaker(match) {
    try {
      // Check previous head-to-head match result
      const previousMatch = await Match.findOne({
        $or: [
          { teamOneId: match.teamOneId, teamTwoId: match.teamTwoId },
          { teamOneId: match.teamTwoId, teamTwoId: match.teamOneId },
        ],
        roundNumber: { $lt: match.roundNumber },
        decidedWinner: { $ne: null },
      }).sort({ roundNumber: -1 });

      if (previousMatch) {
        return previousMatch.decidedWinner;
      }

      // If no previous match, use random selection
      const randomWinner =
        Math.random() < 0.5 ? match.teamOneId : match.teamTwoId;
      return randomWinner;
    } catch (error) {
      console.error("Error handling tiebreaker:", error);
      return match.teamOneId; // Default to teamOne in case of error
    }
  }

  //-----------------------dynamically match creation------------------------
  static getNextRoundNumber(currentRoundIndex) {
    if (
      currentRoundIndex === -1 ||
      currentRoundIndex >= roundOrder.length - 1
    ) {
      logger.info(
        "No next round available: current round is invalid or last round."
      );
      return null; // No next round if the current round is invalid or last round (Championship)
    }
    return currentRoundIndex + 1;
  }



  // Main function to create next round matches
  static async createNextRound(req, res) {
    try {
      // Validate input
      const { seasonId, currentRoundSlug } = req.body;
      if (!seasonId || !currentRoundSlug) {
        logger.warn("Season ID or current round slug is missing.");
        return res
          .status(400)
          .json({ message: "Season ID and current round slug are required." });
      }

      // Validate season existence
      logger.info(`Fetching season with ID: ${seasonId}`);
      const season = await Season.findById(seasonId);
      if (!season) {
        logger.error(`Season with ID: ${seasonId} not found.`);
        return res.status(404).json({ message: "Season not found." });
      }

      // Determine the current round index and next round slug
      const currentRoundIndex = roundOrder.findIndex(
        (round) => round.slug === currentRoundSlug
      );
      const nextRoundSlug = generateRoundSlug(currentRoundIndex + 1);

      // Check if the current round is the Championship round
      if (currentRoundSlug === "round-6") {
        logger.info("Tournament is complete. No further rounds to be created.");
        return res.status(200).json({
          message: "Tournament is complete. No further rounds will be created.",
        });
      }

      if (!nextRoundSlug) {
        logger.error("Invalid current round or no next round available.");
        return res
          .status(400)
          .json({ message: "Invalid current round or no next round." });
      }

      // Fetch completed matches for the current round
      logger.info(
        `Fetching completed matches for round ${currentRoundSlug} in season ${seasonId}.`
      );
      const completedMatches = await Match.find({
        roundSlug: currentRoundSlug,
        seasonId,
        decidedWinner: { $ne: null }, // Only fetch matches with a winner
      });

      if (!completedMatches.length) {
        logger.warn(
          `No completed matches found for round ${currentRoundSlug}.`
        );
        return res.status(404).json({
          message: "No completed matches found for the current round.",
        });
      }

      // Group winners by zone
      logger.info("Grouping winners by zone.");
      const winnersByZone = getWinnersFromCompletedMatches(completedMatches);

      // Create next round matches
      logger.info("Creating next round matches.");
      const nextRoundMatches = await MatchController.createNextRoundMatches(
        winnersByZone,
        nextRoundSlug, // Pass roundSlug here
        seasonId
      );

      if (!nextRoundMatches.length) {
        logger.warn(
          "No next round matches could be created due to insufficient winners."
        );
        return res
          .status(400)
          .json({ message: "No next round matches could be created." });
      }

      // Insert new matches into the database
      logger.info("Inserting new matches into the database.");
      const savedNextRoundMatches = await Match.insertMany(nextRoundMatches);

      logger.info("Next round matches created successfully.");
      res.status(201).json({
        message: "Next round matches created successfully.",
        savedNextRoundMatches,
      });
    } catch (error) {
      logger.error("Error creating next round matches:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // Helper function to create next round matches
  static createNextRoundMatches(winnersByZone, roundSlug, seasonId) {
    const nextRoundMatches = [];

    // Special logic for round-5 (Final 4): East vs. West and South vs. Midwest
    if (roundSlug === "round-5") {
      const zonePairs = [
        { zone1: "West", zone2: "East" },
        { zone1: "South", zone2: "Midwest" },
      ];

      zonePairs.forEach(({ zone1, zone2 }, index) => {
        const teamOne = winnersByZone[zone1]?.[0]; // First winner from zone1
        const teamTwo = winnersByZone[zone2]?.[0]; // First winner from zone2

        if (teamOne && teamTwo) {
          nextRoundMatches.push({
            teamOneId: teamOne,
            teamTwoId: teamTwo,
            teamOneScore: null,
            teamTwoScore: null,
            status: "upcoming",
            roundSlug: roundSlug, // Use roundSlug directly
            zoneSlug: null, // No zone for this round
            seasonId,
            matchNo: index + 1, // Match number
          });
        } else {
          logger.warn(
            `Insufficient winners to create match between ${zone1} and ${zone2} in round-5.`
          );
        }
      });
    } else {
      // Default logic for other rounds
      for (const [zoneSlug, winners] of Object.entries(winnersByZone)) {
        if (winners.length < 2) {
          logger.warn(
            `Not enough winners in zone ${zoneSlug} to create next round matches.`
          );
          continue;
        }

        for (let i = 0; i < winners.length; i += 2) {
          if (winners[i + 1]) {
            logger.info(
              `Creating match between team ${winners[i]} and team ${winners[i + 1]
              } in zone ${zoneSlug}.`
            );
            nextRoundMatches.push({
              teamOneId: winners[i],
              teamTwoId: winners[i + 1],
              teamOneScore: null,
              teamTwoScore: null,
              status: "upcoming",
              roundSlug: roundSlug, // Use roundSlug directly
              zoneSlug,
              seasonId,
              matchNo: Math.floor(i / 2) + 1,
            });
          }
        }
      }
    }

    logger.info(
      `Total of ${nextRoundMatches.length} matches created for round: ${roundSlug}.`
    );
    return nextRoundMatches;
  }
}

module.exports = MatchController;