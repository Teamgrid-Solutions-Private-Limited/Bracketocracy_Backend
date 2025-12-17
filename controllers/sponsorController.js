const { upload } = require("../middleware/fileUpload"); // Importing the file upload middleware
const fs = require("fs-extra");
const path = require("path");
const Sponsor = require("../model/sponsorSchema"); // Assuming you have a Sponsor model

// Define the upload directory for sponsor logos
const BASE_UPLOAD_DIR = path.join(__dirname, "../my-upload/uploads/sponsors"); // Folder for original images

class SponsorController {
  // Middleware to handle file upload
  static handleFileUpload = (req, res, next) => {
    upload.single("logo")(req, res, (err) => {
      if (err) {
        console.error("Error uploading file:", err);
        return res.status(400).json({ message: "Error uploading file" });
      }
      next(); // Continue to the next middleware/logic after file upload
    });
  };

  // Controller method to add a new sponsor
  static addSponsor = async (req, res) => {
    try {
      // Handle file upload
      await SponsorController.handleFileUpload(req, res, async () => {
        const { companyName, website } = req.body;

        // Validate required fields
        if (!companyName || !website) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        // Ensure the upload directory exists
        await fs.ensureDir(BASE_UPLOAD_DIR);

        let logoFilename;
        if (req.file) {
          const originalImagePath = path.join(BASE_UPLOAD_DIR, req.file.filename);

          // Move the uploaded logo to the original images folder
          await fs.move(req.file.path, originalImagePath);

          // Store the filename of the original image
          logoFilename = req.file.filename;
        }

        // Create the sponsor object and save it to the database
        const sponsor = new Sponsor({
          companyName,
          website,
          logo: logoFilename, // Store only the filename for the logo
        });

        // Save the sponsor object to the database
        const result = await sponsor.save();

        return res.status(201).json({
          message: "Sponsor added successfully",
          data: result,
        });
      });
    } catch (err) {
      console.error("Error in addSponsor controller:", err);
      return res.status(500).json({ message: "Error creating sponsor" });
    }
  }


  static deleteSponsor = async (req, res) => {
    try {
      const sponsorId = req.params.id;
      const result = await Sponsor.findByIdAndDelete(sponsorId);

      if (!result) {
        return res.status(404).json({ error: "Sponsor not found" });
      }

      res
        .status(200)
        .json({ message: "Sponsor deleted successfully", data: result });
    } catch (err) {
      SponsorController.handleError(res, err, "Error deleting sponsor");
    }
  };

  static displayAll = async (req, res) => {
    try {
      const data = await Sponsor.find();
      res
        .status(200)
        .json({ message: "Sponsor list retrieved successfully", data });
    } catch (err) {
      SponsorController.handleError(res, err, "Error retrieving sponsors");
    }
  };

  static displayById = async (req, res) => {
    try {
      const data = await Sponsor.findById(req.params.id);

      if (!data) {
        return res.status(404).json({ error: "Sponsor not found" });
      }

      res.status(200).json({ message: "Sponsor retrieved successfully", data });
    } catch (err) {
      SponsorController.handleError(res, err, "Error retrieving sponsor by ID");
    }
  };

  static async updateSponsor(req, res) {
    try {
      await SponsorController.handleFileUpload(req, res, async () => {
        const { id } = req.params;
        const { companyName, website, status } = req.body;

        const sponsor = await Sponsor.findById(id);

        if (!sponsor) {
          return res.status(404).json({ error: "Sponsor not found" });
        }

        if (companyName) sponsor.companyName = companyName;
        if (website) sponsor.website = website;
        if (status) sponsor.status = status;

        if (req.file) {
          const originalImagePath = path.join(BASE_UPLOAD_DIR, req.file.filename);
          await fs.move(req.file.path, originalImagePath);
          sponsor.logo = req.file.filename;
        }

        const updatedSponsor = await sponsor.save();

        return res.status(200).json({
          message: "Sponsor updated successfully",
          data: updatedSponsor,
        });
      });
    } catch (err) {
      console.error("Error updating sponsor:", err);
      return res.status(500).json({ message: "Error updating sponsor" });
    }
  }
}

module.exports = SponsorController;
