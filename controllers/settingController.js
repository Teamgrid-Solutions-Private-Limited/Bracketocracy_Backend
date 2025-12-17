const Setting = require("../model/settingSchema");

// Create a new setting
exports.createSetting = async (req, res) => {
  try {
    const { settingKey, settingValue, status, settingRef } = req.body;

    // Check for required fields
    if (!settingKey || !settingValue || status === undefined || !settingRef) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if settingKey already exists
    const existingSetting = await Setting.findOne({ settingKey });
    if (existingSetting) {
      return res
        .status(400)
        .json({ message: "Setting with this key already exists" });
    }

    const newSetting = new Setting({
      settingKey,
      settingValue,
      status,
      settingRef,
    });

    await newSetting.save();
    res.status(201).json(newSetting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a setting by settingKey
exports.getSetting = async (req, res) => {
  try {
    const setting = await Setting.findOne({
      settingKey: req.params.settingKey,
    });
    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }
    res.json(setting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a setting by settingKey
exports.updateSetting = async (req, res) => {
  try {
    const { settingValue, status, settingRef } = req.body;

    const updatedSetting = await Setting.findOneAndUpdate(
      { settingKey: req.params.settingKey },
      { settingValue, status, settingRef, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedSetting) {
      return res.status(404).json({ message: "Setting not found" });
    }

    res.json(updatedSetting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a setting by settingKey
exports.deleteSetting = async (req, res) => {
  try {
    const deletedSetting = await Setting.findOneAndDelete({
      settingKey: req.params.settingKey,
    });
    if (!deletedSetting) {
      return res.status(404).json({ message: "Setting not found" });
    }
    res.json({ message: "successfully deleted this settings" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
