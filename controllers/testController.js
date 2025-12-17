const Email = require("../model/testEmail");

class testController
{

  static async addTestEmail(req, res) {
    try {
        let { emails } = req.body;
        
        if (!emails) {
            return res.status(400).json({ message: "Email(s) are required." });
        }

        // Convert single email string to array
        if (typeof emails === "string") {
            emails = [emails];
        }

        if (!Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({ message: "Invalid email format." });
        }

        const newEntry = new Email({ emails });
        await newEntry.save();

        res.status(201).json({ message: "Emails added successfully.", data: newEntry });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

    static viewAll = async (req, res) => {
        try {
          const data = await Email.find();
          res.status(200).json({ message: "retrieved successfully", info: data });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      };

      static async updateEmail(req, res) {
        try {
          const { id } = req.params;
          let { emails } = req.body;

          if (!emails) {
            return res.status(400).json({ message: "Email(s) are required." });
          }

          // Convert single email string to array
          if (typeof emails === "string") {
            emails = [emails];
          }

          if (!Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({ message: "Invalid email format." });
          }

          const data = await Email.findByIdAndUpdate(
            id,
            { $addToSet: { emails: { $each: emails } } },
            { new: true }
          );

          res.status(200).json({ message: "updated successfully", info: data });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      }

  static async deleteEmails(req, res) {
    try {
      const { id } = req.params;
      const { emails } = req.body;
      console.log(emails);

      if (!emails) {
        return res.status(400).json({ message: "Email(s) are required." });
      }

      // Convert single email string to array
      let emailsToDelete = emails;
      if (typeof emails === "string") {
        emailsToDelete = [emails];
      }

      if (!Array.isArray(emailsToDelete) || emailsToDelete.length === 0) {
        return res.status(400).json({ message: "Invalid email format." });
      }

      const emailEntry = await Email.findById(id);
      if (!emailEntry) {
        return res.status(404).json({ message: "Email entry not found." });
      }

      emailEntry.emails = emailEntry.emails.filter(email => !emailsToDelete.includes(email));
      await emailEntry.save();

      res.status(200).json({ message: "Emails deleted successfully.", data: emailEntry });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
    }

module.exports = testController;