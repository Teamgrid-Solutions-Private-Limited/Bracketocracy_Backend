// const Notification = require("../model/notificationSchema");
// const Token = require("../model/deviceInformationSchema");
// const admin = require("../config/firebaseConfig");

// const saveNotification = async (
//   title,
//   body,
//   recipients,
//   status = "sent",
//   errors = []
// ) => {
//   try {
//     const notification = new Notification({
//       title,
//       body,
//       recipients,
//       status,
//       errors,
//     });

//     await notification.save(); // Save the notification record in MongoDB
//     console.log("Notification saved successfully!");
//   } catch (error) {
//     console.error("Error saving notification:", error);
//     throw error;
//   }
// };

// const sendNotifications = async (userIds, title, body) => {
//   try {
//     const tokens = [];

//     // Fetch tokens for all userIds from MongoDB
//     const tokenRecords = await Token.find({ userId: { $in: userIds } });

//     tokenRecords.forEach((record) => {
//       if (record.expoToken) tokens.push(record.expoToken);
//     });

//     if (tokens.length === 0) {
//       throw new Error("No valid tokens found for the provided users");
//     }

//     // Create the batch notification payload
//     const message = {
//       tokens, // List of Expo tokens
//       notification: {
//         title,
//         body,
//       },
//     };

//     const response = await admin.messaging().sendMulticast(message);

//     // Extract errors if any
//     const errors = response.responses.filter((r) => !r.success);

//     // Save notification to the database
//     await saveNotification(title, body, userIds, "sent", errors);

//     console.log(`Notifications sent successfully: ${response.successCount}`);
//     console.log(`Failed to send: ${response.failureCount}`);
//     return response;
//   } catch (error) {
//     console.error("Error sending notifications:", error);

//     // Save failed notification attempt to the database
//     await saveNotification(title, body, userIds, "failed", [error.message]);

//     throw error;
//   }
// };

// module.exports = sendNotifications;

const { Expo } = require("expo-server-sdk");
const DeviceToken = require("../model/deviceInformationSchema");
const NotificationMessage = require("../model/notificationSchema");
// Initialize Expo SDK
const expo = new Expo();

// Function to send push notifications to a user's registered devices
// Import the new schema

const sendNotificationToUser = async (userId, title, body) => {
  try {
    // Fetch the user's device information
    const userDevice = await DeviceToken.findOne({ userId });

    if (
      !userDevice ||
      !userDevice.expoTokens ||
      userDevice.expoTokens.length === 0
    ) {
      await NotificationMessage.create({
        userId,
        title,
        body,
        status: "failed",
        errorDetails: { error: "User not registered with any Expo token" },
      });
      return {
        success: false,
        error: "User not registered with any Expo token",
      };
    }

    const validTokens = userDevice.expoTokens.filter((token) =>
      Expo.isExpoPushToken(token)
    );

    if (validTokens.length === 0) {
      await NotificationMessage.create({
        userId,
        title,
        body,
        status: "failed",
        errorDetails: { error: "No valid Expo push tokens found" },
      });
      return { success: false, error: "No valid Expo push tokens found" };
    }

    // Create notification messages for all valid tokens
    const messages = validTokens.map((token) => ({
      to: token,
      sound: "default",
      title,
      body,
      data: { userId },
    }));

    // Send notifications using Expo SDK
    const tickets = await expo.sendPushNotificationsAsync(messages);

    // Check for any errors in the ticket responses
    const errors = tickets.filter((ticket) => ticket.status === "error");

    // Log each message in the database
    await NotificationMessage.create({
      userId,
      title,
      body,
      data: { userId },
      status: errors.length > 0 ? "failed" : "success",
      errorDetails: errors.length > 0 ? errors : null,
    });

    if (errors.length > 0) {
      console.error("Errors in sending notifications:", errors);
      return { success: false, errors };
    }

    return { success: true, tickets };
  } catch (error) {
    console.error("Error in sending notification:", error);

    // Log the error in the database
    await NotificationMessage.create({
      userId,
      title,
      body,
      status: "failed",
      errorDetails: { error: error.message },
    });

    return { success: false, error: error.message };
  }
};

// const sendNotificationToUsers = async (userIds, title, body) => {
//   try {
//     // Fetch all users' device tokens
//     const usersWithTokens = await DeviceToken.find({
//       userId: { $in: userIds },
//     });

//     const notifications = [];
//     const invalidUsers = [];

//     // Prepare notifications
//     for (const userId of userIds) {
//       const userDevice = usersWithTokens.find(
//         (device) => device.userId.toString() === userId
//       );

//       if (!userDevice || !userDevice.expoTokens?.length) {
//         invalidUsers.push({
//           userId,
//           error: "User not registered with any Expo token",
//         });
//         continue;
//       }

//       const validTokens = userDevice.expoTokens.filter((token) =>
//         Expo.isExpoPushToken(token)
//       );

//       if (!validTokens.length) {
//         invalidUsers.push({
//           userId,
//           error: "No valid Expo push tokens found",
//         });
//         continue;
//       }

//       validTokens.forEach((token) =>
//         notifications.push({
//           to: token,
//           sound: "default",
//           title,
//           body,
//           data: { userId },
//         })
//       );
//     }

//     if (!notifications.length) {
//       // No valid notifications to send
//       await NotificationMessage.create({
//         title,
//         body,
//         userIds,
//         status: "failed",
//         errorDetails: invalidUsers,
//       });
//       return { success: false, errors: invalidUsers };
//     }

//     // Send notifications via Expo SDK
//     const tickets = await expo.sendPushNotificationsAsync(notifications);

//     // Handle errors from Expo
//     const errors = tickets
//       .map((ticket, index) =>
//         ticket.status === "error"
//           ? {
//               userId: notifications[index].data.userId,
//               error: ticket.details,
//             }
//           : null
//       )
//       .filter(Boolean);

//     await NotificationMessage.create({
//       title,
//       body,
//       userIds,
//       status: errors.length ? "failed" : "success",
//       errorDetails: [...invalidUsers, ...errors],
//     });

//     return { success: errors.length === 0, tickets, errors };
//   } catch (error) {
//     console.error("Error in sending notifications:", error);

//     await NotificationMessage.create({
//       title,
//       body,
//       userIds,
//       status: "failed",
//       errorDetails: [{ error: error.message }],
//     });

//     return { success: false, error: error.message };
//   }
// };

const sendNotificationToUsers = async (userIds, title, body) => {
  try {
    // Fetch all users' device tokens
    const usersWithTokens = await DeviceToken.find({ userId: { $in: userIds } });

    const notifications = [];
    const invalidUsers = [];

    // Prepare notifications
    for (const userId of userIds) {
      const userDevice = usersWithTokens.find((device) => device.userId.toString() === userId);

      if (!userDevice || !userDevice.expoTokens?.length) {
        invalidUsers.push({ userId, error: "User not registered with any Expo token" });
        continue;
      }

      const validTokens = userDevice.expoTokens.filter((token) => Expo.isExpoPushToken(token));

      if (!validTokens.length) {
        invalidUsers.push({ userId, error: "No valid Expo push tokens found" });
        continue;
      }

      validTokens.forEach((token) =>
        notifications.push({
          to: token,
          sound: "default",
          title,
          body,
          data: { userId },
        })
      );
    }

    if (!notifications.length) {
      // No valid notifications to send
      await NotificationMessage.create({
        title,
        body,
        userIds,
        status: "failed",
        errorDetails: invalidUsers,
      });
      return { success: false, errors: invalidUsers };
    }

    // Split notifications into batches of 100
    const chunkSize = 100;
    const batches = [];
    for (let i = 0; i < notifications.length; i += chunkSize) {
      batches.push(notifications.slice(i, i + chunkSize));
    }

    // Send all batches in parallel (Optimized)
    const results = await Promise.all(
      batches.map(async (batch) => await expo.sendPushNotificationsAsync(batch))
    );

    // Handle errors from Expo responses
    const errors = results.flatMap((tickets, batchIndex) =>
      tickets.map((ticket, index) =>
        ticket.status === "error"
          ? { userId: batches[batchIndex][index].data.userId, error: ticket.details }
          : null
      ).filter(Boolean)
    );

    // Save notification status
    await NotificationMessage.create({
      title,
      body,
      userIds,
      status: errors.length ? "failed" : "success",
      errorDetails: [...invalidUsers, ...errors],
    });

    return { success: errors.length === 0, results, errors };
  } catch (error) {
    console.error("Error in sending notifications:", error);

    await NotificationMessage.create({
      title,
      body,
      userIds,
      status: "failed",
      errorDetails: [{ error: error.message }],
    });

    return { success: false, error: error.message };
  }
};

module.exports = { sendNotificationToUsers, sendNotificationToUser };
