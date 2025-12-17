const Betting = require("../model/bettingSchema");
const Match = require("../model/matchSchema");
const User = require("../model/userSchema");
const Season = require("../model/seasonSchema");
const Round = require("../model/roundSchema");
const Team = require("../model/teamSchema");

class bettingController {

  static placeBet = async (req, res) => {
    try {
      const { matchId, selectedWinner, seasonId, userId, betScore } = req.body;

      if (!matchId || !selectedWinner || !seasonId || !userId) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({ message: "user not found" });
      }
      if (betScore > user.score || betScore < 0) {
        return res.status(400).json({ message: "bet should be greater than 0 and lesser than actual score" });
      }


      const existingBet = await Betting.findOne({ matchId, userId }).exec();
      if (existingBet) {
        return res
          .status(400)
          .json({ message: "Bet already placed for this match" });
      }

      // Verify references
      const [match, season] = await Promise.all([
        Match.findById(matchId).exec(),

        Season.findById(seasonId).exec(),
      ]);

      if (!match) return res.status(404).json({ message: "Match not found" });

      if (!season) return res.status(404).json({ message: "Season not found" });


      const bet = new Betting({ matchId, userId, selectedWinner, seasonId, betScore });
      const savedBet = await bet.save();

      res.status(201).json({ message: "Bet placed successfully", savedBet });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // Calculate points based on the round and match outcome
  static calculatePoints = async (roundSlug, selectedWinner) => {
    try {
      if (!selectedWinner) return 0;

      const team = await Team.findById(selectedWinner).exec();
      if (!team) return 0;

      const seedValue = team.seed || 0;
      const round = await Round.findOne({ slug: roundSlug }).exec();
      if (!round) return 0;



      let points = 0;
      switch (round.roundNumber) {
        case 0:
          points = 5;
          break;
        case 1:
          points = seedValue;
          break;
        case 2:
          points = seedValue * 2;
          break;
        case 3:
          points = seedValue * 3;
          break;
        case 4:
          points = 25;
          break;
        case 5:
          points = 50;
          break;
        case 6:
          points = 0;
          break;
        default:
          points = 0;
          break;
      }


      return points;


    } catch (error) {
      console.error("Error calculating points:", error.message);
      return 0;
    }
  };

 
 
  static updateBettingResults = async (matchId) => {
    try {
      const match = await Match.findById(matchId)
        .populate("decidedWinner")
        .exec();
  
      if (!match) {
        console.error("Match not found");
        return;
      }
  
      const { decidedWinner, roundSlug } = match;
      const bets = await Betting.find({ matchId })
        .populate("userId selectedWinner")
        .exec();
  
      await Promise.all(bets.map(async (bet) => {
        const { selectedWinner, userId, betScore } = bet;
        const user = await User.findById(userId).exec();
  
        if (!user) {
          console.error("User not found for ID:", userId);
          return;
        }
  
        if (!selectedWinner) {
          console.error("Selected winner not found for bet ID:", bet._id);
          return;
        }
  
        let updatedScore = user.score; // Start with the user's current score
        let points = 0;
  
        // Logic for round-6 (deduct betScore and calculate winning points)
        if (roundSlug === "round-6") {
          updatedScore -= betScore; // Deduct betScore initially
  
          if (selectedWinner.toString() === decidedWinner.toString()) {
            points = betScore * 2; // Winning points calculation
            updatedScore += points; // Update the score with points when the user wins
          } else {
            points = 0; // No points for losing, but still have the deduction
          }
        } else {
          // For all other rounds, no betScore deduction happens, and no points are awarded for losing
          if (selectedWinner.toString() === decidedWinner.toString()) {
            points = await bettingController.calculatePoints(roundSlug, selectedWinner);
            updatedScore += points; // Add the points if the user wins
          } else {
            points = 0; // No points for losing
          }
        }
  
        // Update the user's score in the database
        await User.findByIdAndUpdate(userId, { score: updatedScore }, { new: true }).exec();
  
        // Update the bet with the calculated points
        await Betting.findByIdAndUpdate(bet._id, { points, updated: Date.now() }, { new: true }).exec();
      }));
    } catch (error) {
      console.error("Error updating betting results:", error.message);
    }
  };
  
  
 
 
 
  static handleMatchEnd = async (req) => {
    try {
      const { matchId } = req.params;
      if (!matchId) {
        return res.status(400).json({ message: "Match ID is required" });
      }

      await bettingController.updateBettingResults(matchId);
      console.log(`Handling end of match with ID: ${matchId}`);

    } catch (error) {

      console.error("Error handling match end:", error);
      throw new Error("Error handling match end");
    }
  };

  // Get user bets
  static getUserBets = async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const bets = await Betting.find({ userId })
        .populate("matchId")
        .populate("selectedWinner")
        .populate("seasonId");

      res.status(200).json(bets);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  static updateBet = async (req, res) => {
    try {
      const { id } = req.params;
      const update = req.body;


      const updatedBet = await Betting.findByIdAndUpdate(
        id,
        { $set: update },
        { new: true }
      );

      if (!updatedBet) {
        res.status(404).json({ error: "Bet not found" });
        return;
      }

      res
        .status(201)
        .json({ message: "Update done successfully", info: updatedBet });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  static deleteBet = async (req, res) => {
    try {
      const { id } = req.params.id;
      const deleteData = await Betting.findByIdAndDelete(id);
      res.status(200).json({ message: "deleted succesfully", info: deleteData });


    } catch (error) { res.status(500).json({ message: "delete unsuccessfull", error: error.message }) }
  }
}

module.exports = bettingController;
