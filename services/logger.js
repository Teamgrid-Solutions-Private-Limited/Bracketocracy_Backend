// const { createLogger, format, transports } = require("winston");
// const { combine, timestamp, printf, colorize } = format;

// // Define the custom format for log messages
// const logFormat = printf(({ level, message, timestamp }) => {
//   return `${timestamp} [${level.toUpperCase()}]: ${message}`;
// });

// // Create the logger
// const logger = createLogger({
//   format: combine(
//     timestamp(), // Add timestamp to each log
//     colorize(), // Colorize the log levels for console output
//     logFormat // Use custom log format defined above
//   ),
//   transports: [
//     // Log messages to the console
//     new transports.Console({
//       level:process.env.LOGGER_LEVEL || "info", // You can set different logging levels (e.g., 'info', 'debug', 'warn', 'error')
//     }),
//     // Log messages to a file (for production logs)
//     new transports.File({
//       filename: "error.log",
//       level: "error", // Only log errors to this file
//     }),
//     new transports.File({
//       filename: "combined.log", // Log all messages to this file
//     }),
//   ],
// });

// module.exports = logger;

const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize } = format;
const path = require("path");

// Define the custom format for log messages
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// Determine the environment
const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

// Set the log level based on the environment or fallback to 'info'
const logLevel = process.env.LOGGER_LEVEL || (isProduction ? "warn" : "info");

// Define the transports
const loggerTransports = [
  // Console transport with colorized output for development and production
  new transports.Console({
    level: logLevel, // Set the console log level
    format: combine(
      timestamp(), // Add timestamp to each log
      colorize(), // Colorize the log levels for console output
      logFormat // Custom log format
    ),
  }),
];

// In production, log errors to a separate file
if (isProduction) {
  loggerTransports.push(
    new transports.File({
      filename: path.join(__dirname, "logs", "error.log"),
      level: "error", // Only log errors to this file
      format: combine(
        timestamp(),
        logFormat // Use the same log format
      ),
    }),
    new transports.File({
      filename: path.join(__dirname, "logs", "combined.log"), // Log all levels to this file
      format: combine(timestamp(), logFormat),
    })
  );
}

// In testing environment, disable file logging
if (isTest) {
  loggerTransports.push(
    new transports.Console({
      level: "info", // Only log info to the console
      format: combine(timestamp(), logFormat),
    })
  );
}

// Create the logger
const logger = createLogger({
  level: logLevel,
  format: combine(
    timestamp(),
    logFormat // Apply the log format
  ),
  transports: loggerTransports, // Use the defined transports
});

module.exports = logger;
