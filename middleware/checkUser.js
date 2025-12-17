///Middleware :

const jwt = require("jsonwebtoken");

// Middleware to check if the user has a valid token
const checkUser = (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded; // Attach decoded user info to request object
    console.log(decoded); // Log decoded information (for debugging purposes)
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error("Token verification error:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = checkUser;
console.log("User check middleware is ready to use");
