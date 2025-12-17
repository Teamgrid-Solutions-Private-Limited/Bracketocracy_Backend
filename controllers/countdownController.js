const Count = require("../model/countdownSchema");

class countdownController {

    static addCountdown = async (req, res) => {
        try {
          const { note, date } = req.body;
          const data = await Count.create({ note, date });
      
          res.status(201).json({ message: "Countdown created successfully", info: data });
        } catch (err) {
          console.error("Error creating countdown:", err);
          res.status(500).json({ error: "Failed to create countdown" });
        }
      };
    static countDelete = async (req, res) => {
        try {
            const countId = req.params.id;
            const data = await Count.findByIdandDelete(countId);

            res.status(201).json({ message: "deleted successfully", info: data });
        }

        catch (err) {
            res.status(404).json({ error: err.message });
        }
    }
    static viewAll = async (req, res) => {
        try {
            const data = await Count.find();
            res.status(201).json({ message: "retrive successfully", info: data });
        } catch (err) {
            res.status(404).json({ error: err.message });
        }
    }
    static searchById = async (req, res) => {
        try {
            const countId = req.params.id;
            const data = await Count.findById(countId);
            res.status(201).json({ message: "retrive successfully", info: data });

        } catch (err) {
            res.status(404).json({ error: err.message });
        }
    }

    static updateCount = async (req, res) => {
        try {
            const { id } = req.params;
            const update = req.body;


            const updatedCount = await Count.findByIdAndUpdate(id, { $set: update }, { new: true });

            if (!updatedCount) {
                res.status(404).json({ error: 'Countdown not found' });
                return;
            }

            res.status(201).json({ message: 'Update done successfully', info: updatedCount });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}
module.exports = countdownController;