const Round = require("../model/roundSchema");
const Season = require("../model/seasonSchema");
const slugify = require("slugify");

class roundController {
  static generateSlug = (roundName) => {
    switch (roundName.toLowerCase()) {
      case "play in match":
        return "playin";
      case "round 1":
        return "round 1";
      case "round 2":
        return "round 2";
      case "sweet 16":
        return "round 3";
      case "elite 8":
        return "round 4";
      case "final 4":
        return "round 5";
      case "final (championship game)":
        return "round 6";
      default:
        return `round-${
          roundName.match(/\d+/) ? roundName.match(/\d+/)[0] : "unknown"
        }`;
    }
  };
  static generateNumber = (roundName) => {
    switch (roundName.toLowerCase()) {
      case "play in match":
        return 0;
      case "round 1":
        return 1;
      case "round 2":
        return 2;
      case "sweet 16":
        return 3;
      case "elite 8":
        return 4;
      case "final 4":
        return 5;
      case "final (championship game)":
        return 6;
      default:
        return `round-${
          roundName.match(/\d+/) ? roundName.match(/\d+/)[0] : "unknown"
        }`;
    }
  };

  // Static method to add a new round
  static addRound = async (req, res) => {
    try {
      const { name, playDate, biddingEndDate, seasonId } = req.body;

      // Validate required fields
      if (!name || !playDate || !biddingEndDate || !seasonId) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Validate and parse date fields
      const now = new Date();
      const playDateObj = new Date(playDate);
      const biddingEndDateObj = new Date(biddingEndDate);

      // Check if dates are valid
      if (isNaN(playDateObj.getTime()) || isNaN(biddingEndDateObj.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      if (playDateObj < now || biddingEndDateObj < now) {
        return res.status(400).json({
          error: "Play date and bidding end date must be in the future",
        });
      }

      // Check if season exists
      const season = await Season.findById(seasonId);
      if (!season) {
        return res.status(404).json({ message: "Season not found" });
      }

      // Create and save the round
      const slug = slugify(this.generateSlug(name), { lower: true });
      const roundNumber = this.generateNumber(name);
      const round = new Round({
        name,
        slug,
        playDate: playDateObj,
        biddingEndDate: biddingEndDateObj,
        seasonId,
        roundNumber,
      });

      const result = await round.save();
      return res
        .status(201)
        .json({ message: "Round created successfully", data: result });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
  static viewRound = async (req, res) => {
    try {
      const roundList = await Round.find().exec();
      res.json(roundList);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error fetching roles", error: error.message });
    }
  };

  static deleteRound = async (req, res) => {
    try {
      const roundId = req.params.id;
      if (!roundId) {
        return res.status(400).json({ message: "round ID is required" });
      }

      const user = await Round.deleteOne({ _id: roundId });
      if (user.deletedCount === 0) {
        return res.status(404).json({ message: "round not found" });
      }

      res.json({ message: "round deleted successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error deleting round", error: error.message });
    }
  };

  static updateRound = async (req, res) => {
    try {
      const roundId = req.params.id;
      const data = req.body;
      const roundData = await Round.findById(roundId);
      roundData.name = data.name;
      // roundData.totalMatch = data.totalMatch;
      roundData.playDate = data.playDate;
      roundData.biddingEndDate = data.biddingEndDate;

      const update = await roundData.save();
      res
        .status(200)
        .json({ message: "update done successfully", info: update });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  };

  

  static searchRoundBySlug = async (req, res) => {
    try {
      const slug = req.params.slug;
      const round = await Round.findOne({ slug });
      if (!round) {
        res.status(404).send({ message: "round not found" });
      } else {
        res.send(round);
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Error fetching round" });
    }
  };
  static searchRoundById = async (req, res) => {
    try {
      let roundId = req.params.id;
      const result = await Round.findById(roundId);
      res.status(200).json({ data: result });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  };
}

module.exports = roundController;
