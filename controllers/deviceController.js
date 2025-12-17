 

const DeviceToken = require("../model/deviceInformationSchema");

const registerDeviceToken = async (req, res) => {
  const { userId, expoToken } = req.body;

  if (!userId || !expoToken || typeof expoToken !== "string") {
    return res.status(400).json({ message: "Invalid request data" });
  }

  try {
    // Find the user's device information document
    let deviceInfo = await DeviceToken.findOne({ userId });

    if (!deviceInfo) {
      // If not found, create a new document with the token
      deviceInfo = new DeviceToken({
        userId,
        expoTokens: [expoToken],
      });
    } else {
      // Check if the token already exists for the user
      if (deviceInfo.expoTokens.includes(expoToken)) {
        return res
          .status(400)
          .json({ message: "Token already exists for this user" });
      }

      // Add the new token to the user's token array
      deviceInfo.expoTokens.push(expoToken);
    }

    await deviceInfo.save();
    return res
      .status(200)
      .json({ message: "Token added successfully", data: deviceInfo });
  } catch (error) {
    console.error("Error adding token:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { registerDeviceToken };
