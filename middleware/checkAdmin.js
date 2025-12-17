const Role = require("../model/roleSchema");
const jwt = require("jsonwebtoken");

const checkAdmin = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1]; // Extract token from Bearer <token>
  //console.log(token);

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify the token using the extracted token
    const decoded = jwt.verify(token, "secret");

    // Ensure the decoded token contains a role ID
    const roleId = decoded.role;
    if (!roleId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Find the role by ID
    const role = await Role.findById(roleId);
    // console.log(role.name);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Check if the role is admin
    if (role.name === "admin") {
      return next(); // Proceed to the next middleware/handler
    } else {
      return res.status(403).json({
        message: "Only Admin has privilege to access this operation.",
      });
    }
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

module.exports = checkAdmin;
