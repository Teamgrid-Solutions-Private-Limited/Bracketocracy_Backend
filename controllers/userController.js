const express = require("express");
const multer = require("multer");
const userModel = require("../model/userSchema");
const mongoose = require("mongoose");
const {upload}  = require("../middleware/fileUpload");
const processAndSaveImages =require("../middleware/fileUpload")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Role = require("../model/roleSchema");
const League = require("../model/leagueSchema");
const path =require("path")
const fs =require("fs-extra")
const sharp = require("sharp")
 const Rank = require('../model/rankSchema');
const RankController = require("./rankController");
const Season = require("../model/seasonSchema");

const BASE_URL = process.env.BASE_URL || "https://v2.bracketocracy.com";
const upload_URL = `${BASE_URL}`;
console.log(upload_URL);

class userController {
  

  static addUser = async (req, res) => {
    try {
      upload.single("profilePhoto")(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ message: "Error uploading file" });
        }

        const { email, password, userName, firstName, lastName, roleId, active } = req.body;

        // Validate required fields
        if (!userName || !firstName || !lastName || !password) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        // Check if userName or email already exists
        const existingUser = await userModel.findOne({
          $or: [{ userName }, { email }],
        });
        if (existingUser) {
          const conflictField =
            existingUser.userName === userName ? "Username" : "Email";
          return res.status(400).json({ message: `${conflictField} already exists` });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user object
        const user = new userModel({
          userName,
          firstName,
          lastName,
          email,
          password: hashedPassword,
          roleId: roleId && mongoose.Types.ObjectId.isValid(roleId) ? roleId : undefined,
          active: active !== undefined ? active : "yes",
        });

        // Save user to database to generate userId
        await user.save();

         //  check if the users email is in any leagues pendingInvites
         const leagues = await League.find({ pendingInvites: email });

         for (const league of leagues) {
             // Remove email from pendingInvites
             league.pendingInvites = league.pendingInvites.filter(invite => invite !== email);
             
             // Add the user to the league
             if (!league.emails.includes(email)) {
                 league.emails.push(email);
             }
             if (!league.userId.includes(user._id)) {
                 league.userId.push(user._id);
             }

             await league.save();
         }

        // Handle profile photo if uploaded
        if (req.file) {
          const userId = user._id.toString();
          const profilePhotoFilename = req.file.filename;

          // Define user-specific paths
          const userFolderPath = path.join(__dirname, `../my-upload/uploads/users/${userId}`);
          const smallFolderPath = path.join(userFolderPath, "small");

          // Ensure directories exist
          await fs.ensureDir(userFolderPath);
          await fs.ensureDir(smallFolderPath);

          // Define file paths
          const originalImagePath = path.join(userFolderPath, profilePhotoFilename);
          const smallImagePath = path.join(smallFolderPath, profilePhotoFilename);

          // Move uploaded file to userId folder directly
          await fs.move(req.file.path, originalImagePath);

          // Resize the image using sharp and save it in the small folder
          await sharp(originalImagePath)
            .resize(80) // Resize to 80px width
            .toFile(smallImagePath);

          // Save only the filename in the profilePhoto field
          user.profilePhoto = profilePhotoFilename;

          // Save user again with updated profile photo information
          await user.save();
        }

        res.status(201).json(user);
      });
    } catch (err) {
      console.error("Error in addUser function:", err);
      res.status(500).json({ message: "Error creating user" });
    }
  };
  
   
// Get all users
static getUser = async (req, res) => {
  try {
    const user = await userModel.find().exec();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

// Get a user by ID

static getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    console.log("Received ID:", id);

    const userId = new mongoose.Types.ObjectId(id);

    // ✅ Get active season
    const activeSeason = await Season.findOne({ status: "new" }).select("_id").lean();
    if (!activeSeason) {
      return res.status(404).json({ message: "No active season found" });
    }
    const seasonId = activeSeason._id;

    // ✅ Fetch user with rank from the current season
    const userWithRank = await userModel.aggregate([
      { $match: { _id: userId } },
      {
        $lookup: {
          from: "ranks",
          let: { userId: "$_id" },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ["$userId", "$$userId"] }, { $eq: ["$seasonId", seasonId] }] } } },
            { $project: { rank: 1, _id: 0 } } // ✅ Only fetch rank
          ],
          as: "rank"
        }
      },
      { $unwind: { path: "$rank", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          userName: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          profilePhoto: 1,
          score: 1,
          rank: { $ifNull: ["$rank.rank", 0] }, // ✅ Default rank = 1 if not found
          roleId: 1,
          updated: 1,
          created: 1
        }
      }
    ]);

    if (!userWithRank || userWithRank.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(userWithRank[0]);

  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Error fetching user" });
  }
};



// static getUserById = async (req, res) => {
//   try {
//     const userId = req.params.id;

//     // Find the user by ID
//     const user = await userModel.findById(userId).exec();
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Prepare the profilePhoto field dynamically
//     let profilePhoto;
//     if (typeof user.profilePhoto === 'string') {
//       // If profilePhoto is a string, it's the original filename
//       profilePhoto = {
//         original: `${upload_URL}/images/${user._id.toString()}/${user.profilePhoto}`,
//       };

//       // Check if the small version exists (assumes filesystem-based check)
//       const smallPhotoPath = path.join(__dirname, `../my-upload/images/${user._id.toString()}/small/${user.profilePhoto}`);
//       const smallPhotoExists = fs.existsSync(smallPhotoPath); // Check for the small version

//       if (smallPhotoExists) {
//         profilePhoto.small = `${upload_URL}/images/${user._id.toString()}/small/${user.profilePhoto}`;
//       }
//     } else if (Array.isArray(user.profilePhoto)) {
//       // If profilePhoto is an array, map over it to construct full URLs
//       profilePhoto = user.profilePhoto.map(photo => ({
//         original: `${upload_URL}/images/${user._id.toString()}/${photo.filename}`,
//         small: `${upload_URL}/images/${user._id.toString()}/small/${photo.filename}`,
//         uploadedAt: photo.uploadedAt,
//       }));
//     }

//     // Prepare the response data
//     const userData = {
//       userId: user._id,
//       userName: user.userName,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//       active: user.active,
//       roleId: user.roleId,
//       profilePhoto,
//     };

//     res.status(200).json(userData);
//   } catch (err) {
//     console.error("Error in getUser function:", err);
//     res.status(500).json({ message: "Error fetching user data" });
//   }
// };


  // static login = async (req, res) => {
  //   const { email, password } = req.body;

  //   if (!email || !password) {
  //     return res
  //       .status(400)
  //       .json({ message: "Email and password are required" });
  //   }

  //   try {
  //     const user = await userModel.findOne({ email }).lean();
  //     if (!user) {
  //       return res.status(404).json({ message: "User not found" });
  //     }

  //     const isValidPassword = await bcrypt.compare(password, user.password);
  //     if (!isValidPassword) {
  //       return res.status(401).json({ message: "Invalid password" });
  //     }

  //     const roleId = user.roleId;
  //     const role = await Role.findById(roleId);
  //     if (!role) {
  //       return res.status(404).json({ message: "Role not found" });
  //     }

  //     const roleName = role.name;

  //     const genToken = jwt.sign(
  //       {
  //         id: user._id,
  //         email: user.email,
  //         role: roleName,
  //       },
  //       "secret",
  //       { algorithm: "HS256" }
  //     );

  //     // Login successful, return user data
  //     res.status(200).json({
  //       id: user._id,
  //       name: user.firstName,
  //       email: user.email,
  //       token: genToken,
  //       message: "Login successful",
  //     });
  //   } catch (err) {
  //     console.error("Error in login function:", err.message);
  //     res.status(500).json({ error: "Error logging in" });
  //   }
  // };

  static login = async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
  
    try {
      const user = await userModel.findOne({ email }).lean();
      
      // Check if user exists
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Check if the user is trying to log in with an incorrect auth type
      if (user.authType !== "email" && req.body.authType === "email") {
        return res.status(400).json({
          message: `User signed up with ${user.authType}. Please log in using your ${user.authType} credentials.`,
        });
      }
  
      // Check if user is trying to login with a different authentication provider
      if (user.authType && user.authType !== 'email' && req.body.authType !== user.authType) {
        return res.status(400).json({
          message: `You signed up using ${user.authType}. Please use ${user.authType} to log in.`,
        });
      }
  
      // Validate password for 'email' auth type
      if (user.authType === 'email') {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ message: "Invalid password" });
        }
      }
  
      const roleId = user.roleId;
      const role = await Role.findById(roleId);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
  
      const roleName = role.name;
  
      const genToken = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: roleName,
        },
        "secret",
        { algorithm: "HS256" }
      );
  
      // Successful login response
      res.status(200).json({
        id: user._id,
        name: user.firstName,
        email: user.email,
        token: genToken,
        message: "Login successful.",
      });
  
    } catch (err) {
      console.error("Error in login function:", err.message);
      res.status(500).json({ message: " Server Error", error:err.message });
    }
  };
  

  // static getUser = async (req, res) => {
  //   try {
  //     const user = await userModel.find().exec();
  //     res.json(user);
  //   } catch (error) {
  //     res
  //       .status(500)
  //       .json({ message: "Error fetching roles", error: error.message });
  //   }
  // };

  // Get a user by ID
  // static getUserById = async (req, res) => {
  //   try {
  //     const id = req.params.id;
  //     const user = await userModel.findById(id);

  //     // Check if the user exists
  //     if (!user) {
  //       return res.status(404).json({ message: "User not found" });
  //     }

  //     res.json(user);
  //   } catch (err) {
  //     console.error("Error fetching user:", err);
  //     res.status(500).json({ message: "Error fetching user" });
  //   }
  // };
  /// update a user by 
  
  // static updateUser = async (req, res) => {
  //   try {
  //     upload.single("profilePhoto")(req, res, async (err) => {
  //       if (err) {
  //         console.error("Error uploading file:", err);
  //         return res.status(400).json({ message: "Error uploading file" });
  //       }

  //       const {
  //         email,
  //         password,
  //         currentPassword,
  //         userName,
  //         firstName,
  //         lastName,
  //         active,
  //       } = req.body;

  //       const userId = req.params.id;

  //       // Validate required fields
  //       if (!userId) {
  //         console.error("User ID is required");
  //         return res.status(400).json({ message: "User ID is required" });
  //       }

  //       if (password && !currentPassword) {
  //         console.error("Current password is required to update password");
  //         return res.status(400).json({
  //           message: "Current password is required to update password",
  //         });
  //       }

  //       // Find the user by ID
  //       const user = await userModel.findById(userId);
  //       if (!user) {
  //         console.error("User not found");
  //         return res.status(404).json({ message: "User not found" });
  //       }

  //       // Verify current password if password update is requested
  //       if (password) {
  //         const isValid = await bcrypt.compare(currentPassword, user.password);
  //         if (!isValid) {
  //           console.error("Invalid current password");
  //           return res
  //             .status(401)
  //             .json({ message: "Invalid current password" });
  //         }

  //         // Hash new password using bcrypt
  //         const salt = await bcrypt.genSalt(10);
  //         const hashedPassword = await bcrypt.hash(password, salt);
  //         user.password = hashedPassword;
  //       }

  //       // Update email if changed
  //       if (req.body.email && req.body.email !== user.email) {
  //         user.email = req.body.email;
  //       }

  //       //update username if changed
  //       if (req.body.userName) {
  //         user.userName = req.body.userName;
  //       }
  //       //update username if changed
  //       if (req.body.firstName) {
  //         user.firstName = req.body.firstName;
  //       }

  //       //update username if changed
  //       if (req.body.lastName) {
  //         user.lastName = req.body.lastName;
  //       }
  //       if (req.body.active) {
  //         user.active = req.body.active;
  //       }
  //       // Update profile photo if uploaded
  //       if (req.file) {
  //         user.profilePhoto = `${upload_URL}${req.file.filename}`;
  //       }

  //       try {
  //         await user.save();
  //         res.status(200).json({ message: "User updated successfully" });
  //       } catch (err) {
  //         console.error("Error updating user:", err);
  //         res.status(500).json({ message: "Error updating user" });
  //       }
  //     });
  //   } catch (err) {
  //     console.error("Error in updateUserById function:", err);
  //     res.status(500).json({ message: "Error updating user" });
  //   }
  // };

  // static updateUser = async (req, res) => {
  //   try {
  //     upload.single("profilePhoto")(req, res, async (err) => {
  //       if (err) {
  //         console.error("Error uploading file:", err);
  //         return res.status(400).json({ message: "Error uploading file" });
  //       }
  
  //       const {
  //         email,
  //         password,
  //         currentPassword,
  //         userName,
  //         firstName,
  //         lastName,
  //         active,
  //       } = req.body;
  
  //       const userId = req.params.id;
  
  //       // Validate required fields
  //       if (!userId) {
  //         console.error("User ID is required");
  //         return res.status(400).json({ message: "User ID is required" });
  //       }
  
  //       if (password && !currentPassword) {
  //         console.error("Current password is required to update password");
  //         return res.status(400).json({
  //           message: "Current password is required to update password",
  //         });
  //       }
  
  //       // Find the user by ID
  //       const user = await userModel.findById(userId);
  //       if (!user) {
  //         console.error("User not found");
  //         return res.status(404).json({ message: "User not found" });
  //       }
  
  //       // Verify current password if password update is requested
  //       if (password) {
  //         const isValid = await bcrypt.compare(currentPassword, user.password);
  //         if (!isValid) {
  //           console.error("Invalid current password");
  //           return res
  //             .status(401)
  //             .json({ message: "Invalid current password" });
  //         }
  
  //         // Hash new password using bcrypt
  //         const salt = await bcrypt.genSalt(10);
  //         const hashedPassword = await bcrypt.hash(password, salt);
  //         user.password = hashedPassword;
  //       }
  
  //       // Update email if changed
  //       if (email && email !== user.email) {
  //         user.email = email;
  //       }
  
  //       // Update other user fields if provided
  //       if (userName) user.userName = userName;
  //       if (firstName) user.firstName = firstName;
  //       if (lastName) user.lastName = lastName;
  //       if (active) user.active = active;
  
  //       // // Update profile photo if uploaded
  //       // if (req.file) {
  //       //   const photoPath = `${upload_URL}${req.file.filename}`;
  //       //   const newPhoto = {
  //       //     original: photoPath,
  //       //     small: `${photoPath}?size=small`, // Modify URL to point to a smaller version if needed
  //       //     uploadedAt: new Date(),
  //       //   };
  
  //       //   // Add the new photo to the profilePhoto array
  //       //   user.profilePhoto.push(newPhoto);
  //       // }
  //       if (req.file) {
  //         const userId = user._id.toString(); // Ensure you have the user's ID
  //         const profilePhotoFilename = req.file.filename;
        
  //         // Define the proper paths for the image
  //         const originalPhotoPath = `${upload_URL}/images/${userId}/${profilePhotoFilename}`;
  //         const smallPhotoPath = `${upload_URL}/images/${userId}/small/${profilePhotoFilename}`;
        
  //         const newPhoto = {
  //           original: originalPhotoPath,
  //           small: smallPhotoPath,
  //           uploadedAt: new Date(),
  //         };
        
  //         // Add the new photo to the profilePhoto array
  //         user.profilePhoto.push(newPhoto);
  //       }
        

  //       // Save updated user data
  //       try {
  //         await user.save();
  //         res.status(200).json({ message: "User updated successfully", user });
  //       } catch (err) {
  //         console.error("Error updating user:", err);
  //         res.status(500).json({ message: "Error updating user" });
  //       }
  //     });
  //   } catch (err) {
  //     console.error("Error in updateUser function:", err);
  //     res.status(500).json({ message: "Error updating user" });
  //   }
  // };
  
  static updateUser = async (req, res) => {
    try {
      upload.single("profilePhoto")(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ message: "Error uploading file" });
        }
  
        const {
          email,
          password,
          currentPassword,
          userName,
          firstName,
          lastName,
          roleId,
          active,
        } = req.body;
  
        const userId = req.params.id;
  
        // Validate required fields
        if (!userId) {
          return res.status(400).json({ message: "User ID is required" });
        }
  
        // Fetch the user by ID
        const user = await userModel.findById(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
  
        // Handle password update with current password verification
        if (password) {
          if (!currentPassword) {
            return res.status(400).json({
              message: "Current password is required to update password",
            });
          }
  
          const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
          if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid current password" });
          }
  
          // Hash the new password
          user.password = await bcrypt.hash(password, 10);
        }
  
        // Update other user details
        if (email && email !== user.email) user.email = email;
        if (userName) user.userName = userName;
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (roleId && mongoose.Types.ObjectId.isValid(roleId)) {
          user.roleId = roleId;
        }
        if (active !== undefined) user.active = active;
  
        // Handle profile photo update if uploaded
        if (req.file) {
          const profilePhotoFilename = req.file.filename;
  
          // Define user-specific paths
          const userFolderPath = path.join(__dirname, `../my-upload/uploads/users/${userId}`);
          const smallFolderPath = path.join(userFolderPath, "small");
  
          // Ensure directories exist
          await fs.ensureDir(userFolderPath);
          await fs.ensureDir(smallFolderPath);
  
          // Define file paths
          const originalImagePath = path.join(userFolderPath, profilePhotoFilename);
          const smallImagePath = path.join(smallFolderPath, profilePhotoFilename);
  
          // Move uploaded file to userId folder directly
          await fs.move(req.file.path, originalImagePath);
  
          // Resize the image using sharp and save it in the small folder
          await sharp(originalImagePath)
            .resize(80) // Resize to 80px width
            .toFile(smallImagePath);
  
          // Save only the filename in the profilePhoto field
          user.profilePhoto = profilePhotoFilename;
        }
  
        // Save the updated user
        try {
          const updatedUser = await user.save();
          res.status(200).json({ message: "User updated successfully", user: updatedUser });
        } catch (saveError) {
          console.error("Error saving updated user:", saveError);
          res.status(500).json({ message: "Error updating user" });
        }
      });
    } catch (err) {
      console.error("Error in updateUser function:", err);
      res.status(500).json({ message: "Error updating user" });
    }
  };
  
  
  

  static updateAdminUser = async (req, res) => {
    try {
      // Handle file upload
      upload.single("profilePhoto")(req, res, async (err) => {
        if (err) {
          console.error("Error uploading file:", err);
          return res.status(400).json({ message: "Error uploading file" });
        }

        const { email, userName, firstName, lastName, active } = req.body;
        const userId = req.params.id;

        // Validate required fields
        if (!userId) {
          console.error("User ID is required");
          return res.status(400).json({ message: "User ID is required" });
        }

        // Find the user by ID
        const user = await userModel.findById(userId);
        if (!user) {
          console.error("User not found");
          return res.status(404).json({ message: "User not found" });
        }

        // Update email if changed
        if (email && email !== user.email) {
          user.email = email;
        }

        // Update username if changed
        if (userName) {
          user.userName = userName;
        }

        // Update first name if changed
        if (firstName) {
          user.firstName = firstName;
        }

        // Update last name if changed
        if (lastName) {
          user.lastName = lastName;
        }
        if (active) {
          user.active = active;
        }

        // Update profile photo if uploaded
        if (req.file) {
          user.profilePhoto = `${upload_URL}${req.file.filename}`;
        }

        // Save the updated user
        try {
          await user.save();
          res.status(200).json({ message: "User updated successfully" });
        } catch (err) {
          console.error("Error updating user:", err);
          res.status(500).json({ message: "Error updating user" });
        }
      });
    } catch (err) {
      console.error("Error in updateUser function:", err);
      res.status(500).json({ message: "Error updating user" });
    }
  };

  //delete user
  static deleteUser = async (req, res) => {
    try {
      const userId = req.params.id;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const user = await userModel.deleteOne({ _id: userId });
      if (user.deletedCount === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error deleting user", error: error.message });
    }
  };

  static resetPassword = async (req, res) => {
    try {
      // Extract userId from params and update data from body
      const { id } = req.params;

      const { password } = req.body;

      // Validate userId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid User ID format" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update the user with the new hashed password
      const updatedUser = await userModel.findByIdAndUpdate(
        id,
        { $set: { password: hashedPassword } }, // Ensure only the password is updated
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res
        .status(200)
        .json({ message: "Password reset successfully", updatedUser });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating password", error: error.message });
    }
  };

  static async registerOrUpdateToken(req, res) {
    const { email, fcmToken } = req.body; // Assume email and fcmToken are sent by the frontend

    try {
      // Find the user by email and update or create a new one with the FCM token
      const user = await userModel.findOneAndUpdate(
        { email },
        { fcmToken },
        { new: true, upsert: true } // If user doesn't exist, create new user
      );

      res.status(200).json({
        success: true,
        message: "User FCM token updated",
        user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static getUserImages = async (req, res) => {
    try {
      const userId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid User ID" });
      }

      // Find the user by ID and retrieve the `profilePhoto` field
      const user = await userModel
        .findById(userId)
        .select("profilePhoto userName");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const images = user.profilePhoto ? [user.profilePhoto] : [];
      res.status(200).json({
        userId: user._id,
        userName: user.userName,
        images,
      });
    } catch (err) {
      console.error("Error fetching user images:", err);
      res.status(500).json({ message: "Error fetching user images" });
    }
  };
}
module.exports = userController;
