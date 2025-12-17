const roles = require("../model/roleSchema");

class roleController {
  // Create a new role

  static createRole = async (req, res) => {
    try {
      const role = new roles(req.body);
      const savedRole = await role.save();
      res.status(201).json(savedRole);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating role", error: error.message });
    }
  };

  // Get all roles
  static getRoles = async (req, res) => {
    try {
      const rolesList = await roles.find().exec();
      res.json(rolesList);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error fetching roles", error: error.message });
    }
  };

  // Get a role by ID
  static getRoleById = async (req, res) => {
    try {
      const id = req.params.id;
      const role = await roles.findById(id).exec();
      if (!role) {
        res.status(404).json({ message: "Role not found" });
      } else {
        res.json(role);
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching role", error: error.message });
    }
  };
}

module.exports = roleController;
