const Team = require("../model/teamSchema");
const mongoose = require("mongoose");
const {upload} = require("../middleware/fileUpload");
const fs = require("fs-extra");
const path = require("path");
const sharp = require("sharp");

const BASE_UPLOAD_DIR = path.join(__dirname, "../my-upload/uploads/teams"); // Main folder for original images
const SMALL_UPLOAD_DIR = path.join(BASE_UPLOAD_DIR, "small"); // Folder for resized images

class TeamController {
  // Middleware to handle file upload
  static handleFileUpload = (req, res, next) => {
    upload.single("logo")(req, res, (err) => {
      if (err) {
        console.error("Error uploading file:", err);
        return res.status(400).json({ message: "Error uploading file" });
      }
      next();
    });
  };

  static addTeam = async (req, res) => {
    try {
      // Handle file upload
      await TeamController.handleFileUpload(req, res, async () => {
        const { name, status, seasonId, seed, zoneName } = req.body;

        // Validate required fields
        if (!name || !status || !seed) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        // Validate seasonId (ensure it is a valid ObjectId)
        if (seasonId && !mongoose.Types.ObjectId.isValid(seasonId)) {
          return res.status(400).json({ message: "Invalid seasonId" });
        }

        // Validate zoneName based on the expected type (assuming it's a string here)
        if (zoneName && !mongoose.Types.ObjectId.isValid(zoneName)) {
          return res.status(400).json({ message: "Invalid zoneName ID" });
        }

        // Ensure the necessary directories exist
        await fs.ensureDir(BASE_UPLOAD_DIR);
        await fs.ensureDir(SMALL_UPLOAD_DIR);

        let logoFilename;
        if (req.file) {
          const originalImagePath = path.join(BASE_UPLOAD_DIR, req.file.filename);
          const smallImagePath = path.join(SMALL_UPLOAD_DIR, req.file.filename);

          // Move the uploaded logo to the original images folder
          await fs.move(req.file.path, originalImagePath);

          // Resize the image to create a smaller version
          await sharp(originalImagePath)
            .resize(80) // Resize the image to 80px width (adjust as needed)
            .toFile(smallImagePath);

          // Store the filename of the original image
          logoFilename = req.file.filename;
        }

        // Create the team object and save it to the database
        const team = new Team({
          name,
          seed,
          logo: logoFilename, // Store only the filename for the logo
          seasonId,
          zoneName,
          status: status || 1, // Default value for status
        });

        // Save the team object to the database
        const result = await team.save();

        return res
          .status(201)
          .json({ message: "Team created successfully", data: result });
      });
    } catch (err) {
      console.error("Error in addTeam controller:", err);
      return res.status(500).json({ message: "Error creating team" });
    }
  };




  static deleteTeam = async (req, res) => {
    try {
      const teamId = req.params.id;
      const result = await Team.findByIdAndDelete(teamId);

      if (!result) {
        return res.status(404).json({ message: "Team not found" });
      }

      res
        .status(200)
        .json({ message: "Team deleted successfully", info: result });
    } catch (err) {
      res.status(500).json({ message: "Error deleting team" });
    }
  };

  static displayAll = async (req, res) => {
    try {
      const data = await Team.find();
      res
        .status(200)
        .json({ message: "Teams retrieved successfully", info: data });
    } catch (err) {
      res.status(500).json({ message: "Error retrieving teams" });
    }
  };

  static displayById = async (req, res) => {
    try {
      const teamId = req.params.id;
      const data = await Team.findById(teamId);

      if (!data) {
        return res.status(404).json({ message: "Team not found" });
      }

      res.status(200).json({ message: "Team retrieved successfully", data });
    } catch (err) {
      res.status(500).json({ message: "Error retrieving team" });
    }
  };

 
// Middleware to handle file upload
static handleFileUpload = (req, res, next) => {
  upload.single("logo")(req, res, (err) => {
    if (err) {
      console.error("Error uploading file:", err);
      return res.status(400).json({ message: "Error uploading file" });
    }
    next();
  });
};

static updateTeam = async (req, res) => {
  try {
    await TeamController.handleFileUpload(req, res, async () => {
      const { name, status, seasonId, seed } = req.body;
      const teamId = req.params.id;

      // Validate teamId
      if (!teamId) {
        return res.status(400).json({ message: "Team ID is required" });
      }

      const team = await Team.findById(teamId);

      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Update fields if present
      if (name) team.name = name;
      if (status) team.status = status;
      if (seasonId) {
        if (!mongoose.Types.ObjectId.isValid(seasonId)) {
          return res.status(400).json({ message: "Invalid seasonId" });
        }
        team.seasonId = seasonId;
      }
      if (seed) team.seed = seed;

      // Check if a new logo is uploaded
      if (req.file) {
        // Remove old images if a new logo is uploaded
        if (team.logo) {
          const oldLogoPath = path.join(BASE_UPLOAD_DIR, team.logo);
          const oldSmallLogoPath = path.join(SMALL_UPLOAD_DIR, team.logo);

          // Ensure the old images exist before removing
          await fs.remove(oldLogoPath);
          await fs.remove(oldSmallLogoPath);
        }

        // Save the new logo to the original images folder
        const originalImagePath = path.join(BASE_UPLOAD_DIR, req.file.filename);
        const smallImagePath = path.join(SMALL_UPLOAD_DIR, req.file.filename);

        // Move the uploaded logo to the original images folder
        await fs.move(req.file.path, originalImagePath);

        // Resize the image to create a smaller version
        await sharp(originalImagePath)
          .resize(80) // Resize the image to 80px width (adjust as needed)
          .toFile(smallImagePath);

        // Update the logo filename in the team document
        team.logo = req.file.filename;
      }

      try {
        const updatedTeam = await team.save();
        return res
          .status(200)
          .json({ message: "Team updated successfully", data: updatedTeam });
      } catch (err) {
        return res.status(500).json({ message: "Error updating team" });
      }
    });
  } catch (err) {
    return res.status(500).json({ message: "Error updating team" });
  }
};

}

module.exports = TeamController;
