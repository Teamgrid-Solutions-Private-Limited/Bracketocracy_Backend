const express = require("express");
const Router = express.Router();
const {
  addUser,
  login,
  getUser,
  getUserById,
  deleteUser,
  updateUser,
  resetPassword,
  updateAdminUser,
  registerOrUpdateToken,
  getUserImages
} = require("../controllers/userController");
Router.get("/user/viewbyid/:id", getUserById);
Router.post("/user/create", addUser);
Router.post("/user/login", login);
Router.post("/admin/login", login);
Router.get("/user/view", getUser);

Router.put("/user/update/:id", updateUser);
Router.put("/user/updateuser/:id", updateAdminUser);
Router.delete("/user/delete/:id", deleteUser);
Router.put("/user/reset/:id", resetPassword);

Router.post("/register-token", registerOrUpdateToken);
// Route to fetch images uploaded by a user
Router.get("/user/:id/images", getUserImages);

module.exports = Router;
