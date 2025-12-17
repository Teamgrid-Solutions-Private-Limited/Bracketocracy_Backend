// const multer = require("multer");
// const path = require("path");

// const maxSize = 2 * 1024 * 1024;

// const storage = multer.diskStorage({
//   destination: "my-upload/images",
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const sanitizedFilename = file.originalname.replace(/\s+/g, "_"); // Replace spaces with underscores
//     cb(null, uniqueSuffix + sanitizedFilename);
//   },
// });

// const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     // Log file mimetype and extension
//     console.log("File mimetype:", file.mimetype);
//     console.log("File extension:", path.extname(file.originalname));

//     if (
//       file.mimetype === "image/png" ||
//       file.mimetype === "image/jpg" ||
//       file.mimetype === "image/jpeg" ||
//       file.mimetype === "image/svg+xml" ||
//       file.mimetype === "application/pdf"
//     ) {
//       cb(null, true);
//     } else {
//       cb(null, false);
//       return cb(
//         new Error("Only .jpg, .jpeg, .png and .svg formats are allowed!")
//       );
//     }
//   },
//   limits: { fileSize: maxSize },
// });

// module.exports = upload;
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs-extra");
const path = require("path");

const maxSize = 5 * 1024 * 1024; // Maximum file size: 5MB

// Multer configuration for storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = "my-upload/images/"; // Default directory

    // Customize the upload directory based on the request route
    if (req.baseUrl.includes("/users")) {
      uploadDir = "my-upload/uploads/users"; // Directory for user uploads
    } else if (req.baseUrl.includes("/teams")) {
      uploadDir = "my-upload/uploads/teams"; // Directory for team uploads
    } else if (req.baseUrl.includes("/sponsors")) {
      uploadDir = "my-upload/uploads/sponsors"; // Directory for sponsor uploads
    }

    // Ensure the directory exists
    fs.mkdirSync(uploadDir, { recursive: true });

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitizedFilename = file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueSuffix + sanitizedFilename);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/png",
      "image/jpg",
      "image/jpeg",
      "image/svg+xml",
      "application/pdf",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .jpg, .jpeg, .png, .svg formats are allowed"));
    }
  },
  limits: { fileSize: maxSize },
});





// // Multer configuration for storage
// const storage = multer.diskStorage({
//   destination: "my-upload/images/", // Directory for original images
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const sanitizedFilename = file.originalname.replace(/\s+/g, "_");
//     cb(null, uniqueSuffix + sanitizedFilename);
//   },
// });

// const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     const allowedMimeTypes = [
//       "image/png",
//       "image/jpg",
//       "image/jpeg",
//       "image/svg+xml",
//       "application/pdf",
//     ];

//     if (allowedMimeTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(null, false);
//       return cb(new Error("Only .jpg, .jpeg, .png, .svg formats are allowed"));
//     }
//   },
//   limits: { fileSize: maxSize },
// });



// Middleware to process and save images
const processAndSaveImages = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const file = req.file;
    const originalFileName = file.filename; // Already sanitized
    const mainDir = "./my-upload/images/";
    const smallDir = "./my-upload/images/small/";

    // Ensure directories exist
    await fs.ensureDir(mainDir);
    await fs.ensureDir(smallDir);

    // Define output paths
    const originalFilePath = `${mainDir}${originalFileName}`;
    const smallFilePath = `${smallDir}${originalFileName}`;

    // Move the original file to the main directory only if the source and destination are different
    if (file.path !== originalFilePath) {
      await fs.move(file.path, originalFilePath, { overwrite: true });
    }

    // Create and save the small version in the small directory
    await sharp(originalFilePath)
      .resize(256, 256) // Resize to 256x256 pixels
      .toFile(smallFilePath);

    // Attach the filenames to req for further use
    req.imagePaths = {
      original: originalFilePath,
      small: smallFilePath,
    };

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error processing the image:", error);
    res.status(500).send("Error processing the image.");
  }
};


module.exports = { upload, processAndSaveImages };

