const Social = require("../model/socialMediaSchema");

class socialmediaController {
  static showAll = async (req, res) => {
    try {
      const data = await Social.find();
      res.status(200).json({ info: data });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  };

  static searchSocial = async (req, res) => {
    try {
      let socialId = req.params.id;
      const result = await Social.findById(socialId);
      res.status(200).json({ data: result });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  };

  static addSocial = async (req, res) => {
    try {
      const data = req.body;
      const socialData = new Social();
      socialData.facebook = data.facebook;
      socialData.twitter = data.twitter;
      socialData.instagram = data.instagram;
      socialData.linkedin = data.linkedin;

      const result = await socialData.save();
      res
        .status(200)
        .json({ msg: "social media created  successful", data: result });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  };

  static updateSocial = async (req, res) => {
    try {
      const { id } = req.params;
      const update = req.body;

      const updatedSocial = await Social.findByIdAndUpdate(
        id,
        { $set: update },
        { new: true }
      );

      if (!updatedSocial) {
        res.status(404).json({ error: "socialmedia id not found" });
        return;
      }

      res
        .status(201)
        .json({ message: "Update done successfully", info: updatedSocial });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  static socialDelete = async (req, res) => {
    try {
      const socialId = req.params.id;
      const result = await Emp.findByIdAndDelete(socialId);
      res.status(200).json({ msg: "record delete done", info: result });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  };
}
module.exports = socialmediaController;
