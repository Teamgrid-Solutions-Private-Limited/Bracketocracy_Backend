
const Notification = require("../model/adminNotificationSchema");

class adminNotificationController {

    static createNotification = async (req, res) => {
        try {
            const { notificationTitle, notificationText } = req.body;

            if (!notificationTitle || !notificationText) {
                return res.status(400).json({
                    message: "Missing required fields: notificationTitle and/or notificationText",
                });
            }

            const notification = await Notification.create(req.body);

            res.status(201).json({
                message: "Notification created successfully",
                result: notification,
            });
        } catch (err) {
            console.error("Error creating notification:", err);
            res.status(500).json({ message: "Error creating notification" });
        }
    };

    static notificationDelete = async (req, res) => {
        try {
            const countId = req.params.id;
            const data = await Notification.findByIdandDelete(countId);

            res.status(201).json({ message: "notification deleted successfully", info: data });
        }

        catch (err) {
            res.status(404).json({ error: err.message });
        }
    }
    static viewAll = async (req, res) => {
        try {
            const data = await Notification.find();
            res.status(201).json({ message: "notification retrive successfully", info: data });
        } catch (err) {
            res.status(404).json({ error: err.message });
        }
    }
    static updatedNotification = async (req, res) => {
        try {
            const { id } = req.params;
            const update = req.body;


            const updatedNotification = await Notification.findByIdAndUpdate(id, { $set: update }, { new: true });

            if (!updatedNotification) {
                res.status(404).json({ error: 'notification not found' });
                return;
            }

            res.status(201).json({ message: 'Update done successfully', info: updatedNotification });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = adminNotificationController;
