require("dotenv").config();
require("./services/cronJobs");
const session = require("express-session");
const passport = require("passport");
require("./services/passport");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cron = require("node-cron");

const connection = require("./db/connection");
const roleRoute = require("./routes/roleRoutes");
const userRoute = require("./routes/userRoutes");
const seasonRoute = require("./routes/seasonRoutes");
const roundRoute = require("./routes/roundsRoutes");
const teamRoute = require("./routes/teamRoutes");
const notificationRoute = require("./routes/notificationRoutes");
const leagueRoute = require("./routes/leagueroutes");
const invitationRoute = require("./routes/invitationRoutes");
const matchRoute = require("./routes/matchRoutes");
const zoneRoute = require("./routes/zoneRoutes");
const messageRoute = require("./routes/messageRoutes");
const sponsorRoute = require("./routes/sponsorRoutes");
const socialMediaRoute = require("./routes/socialMediaRoutes");
const bettingRoute = require("./routes/bettingRoutes");
const countdownRoute = require("./routes/countdownRoutes");
const adminNotificationRoute = require("./routes/adminNotificationRoutes");
const settingRoute = require("./routes/settingRoutes");
const rankRoute = require("./routes/rankRoutes");
const authRoutes = require("./routes/authRoutes");
const pushNotificationRoute = require("./routes/pushNotificationRoutes");
const devicesRoute = require("./routes/deviceRoutes");
const emailRoute = require("./routes/mailRoutes");
const contactRoute = require("./routes/contactRoutes");
const testRoute = require("./routes/testRoutes");

const PORT = process.env.PORT || 4000;
const app = express();

 
app.use(
  session({
    secret: process.env.COOKIE_KEY,
    resave: false,
    saveUninitialized: false, // Generally safer to prevent unmodified sessions from being stored
    cookie: {
      secure: true, // Ensures cookies are only sent over HTTPS
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      sameSite: "strict", // Prevents CSRF attacks; use "lax" if you need cross-site requests
      maxAge: 24 * 60 * 60 * 1000, // Optional: sets cookie expiration time (e.g., 1 day)
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("my-upload"));
app.use("/uploads", express.static(path.join(__dirname, "my-upload/uploads")));

app.use("/role", roleRoute);
app.use("/user", userRoute);
app.use("/auth", authRoutes);
app.use("/zone", zoneRoute);
app.use("/season", seasonRoute);
app.use("/round", roundRoute);
app.use("/team", teamRoute);
app.use("/notification", notificationRoute);
app.use("/league", leagueRoute);
app.use("/invitation", invitationRoute);
app.use("/match", matchRoute);
app.use("/bet", bettingRoute);
app.use("/message", messageRoute);
app.use("/sponsor", sponsorRoute);
app.use("/socialmedia", socialMediaRoute);
app.use("/countdown", countdownRoute);
app.use("/adminnotification", adminNotificationRoute);
app.use("/setting", settingRoute);
app.use("/rank", rankRoute);
app.use("/notifications", pushNotificationRoute);
app.use("/devices", devicesRoute);
app.use("/email", emailRoute);
app.use("/contact", contactRoute);
// test api for email bypass
app.use("/test", testRoute);

app.get("/", (req, res) => {
  res.send("Welcome to the homepage!");
});

app.listen(PORT, () => {
  console.log(`server has started at port ${PORT}`);
});

 
