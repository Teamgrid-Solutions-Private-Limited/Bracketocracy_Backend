const Zone = require("../model/zoneSchema");
const slugify = require("slugify");

class ZoneController {
  static handleError = (res, error, message = "Internal Server Error", status = 500) => {
    console.error(message, error);
    res.status(status).json({ error: message });
  };

  static addZone = async (req, res) => {
    try {
      const { zoneName } = req.body;

      if (!zoneName) {
        console.log("Zone name is missing:", zoneName);
        return res.status(400).json({ error: "Name is required" });
      }

      const zone = new Zone({
        zoneName,
        slug: slugify(zoneName),
      });

      const result = await zone.save();
      res.status(201).json({ message: "Zone created successfully", data: result });
    } catch (error) {
      ZoneController.handleError(res, error, "Error creating zone");
    }
  };

  static viewAll = async (req, res) => {
    try {
      const data = await Zone.find();
      res.status(200).json({ message: "Zones retrieved successfully", info: data });
    } catch (error) {
      ZoneController.handleError(res, error, "Error retrieving zones");
    }
  };

  static searchZone = async (req, res) => {
    try {
      const zoneId = req.params.id;
      const result = await Zone.findById(zoneId);

      if (!result) {
        return res.status(404).json({ error: "Zone not found" });
      }

      res.status(200).json({ data: result });
    } catch (error) {
      ZoneController.handleError(res, error, "Error fetching zone by ID");
    }
  };

  static zoneDelete = async (req, res) => {
    try {
      const zoneId = req.params.id;
      const result = await Zone.findByIdAndDelete(zoneId);

      if (!result) {
        return res.status(404).json({ error: "Zone not found" });
      }

      res.status(200).json({ message: "Zone deleted successfully", info: result });
    } catch (error) {
      ZoneController.handleError(res, error, "Error deleting zone");
    }
  };

  static updateZone = async (req, res) => {
    try {
      const zoneId = req.params.id;
      const { zoneName } = req.body;

      const zoneData = await Zone.findById(zoneId);

      if (!zoneData) {
        return res.status(404).json({ error: "Zone not found" });
      }

      zoneData.zoneName = zoneName;
      zoneData.slug = slugify(zoneName);
      const updatedZone = await zoneData.save();

      res.status(200).json({ message: "Update done successfully", info: updatedZone });
    } catch (error) {
      ZoneController.handleError(res, error, "Error updating zone");
    }
  };

  static searchZoneBySlug = async (req, res) => {
    try {
      const slug = req.params.slug;
      const zone = await Zone.findOne({ slug });

      if (!zone) {
        return res.status(404).json({ message: "Zone not found" });
      }

      res.status(200).json({ data: zone });
    } catch (error) {
      ZoneController.handleError(res, error, "Error fetching zone by slug");
    }
  };
}

module.exports = ZoneController;
