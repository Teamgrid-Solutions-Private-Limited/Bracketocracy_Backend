 


const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const League = require('../model/leagueSchema')
const User = require('../model/userSchema');
const SocialMedia = require('../model/socialMediaSchema');
const jwksClient = require('jwks-rsa');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// General function to find or create a user


// const findOrCreateUser = async (profile, provider, res) => {
//   let authType, profileFields;

//   // Normalize profile fields based on the provider
//   const mapProfileFields = (provider, profile) => {
//     switch (provider) {
//       case 'google':
//         return {
//           email: profile.email,
//           userName: profile.name || `${profile.firstName} ${profile.lastName}`,
//           firstName: profile.given_name,
//           lastName: profile.family_name,
//           profilePhoto: profile.picture,
//           socialMediaId: profile.id,
//         };
//       case 'facebook':
//         return {
//           email: profile.email,
//           userName: profile.name || `${profile.firstName} ${profile.lastName}`,
//           firstName: profile.first_name,
//           lastName: profile.last_name,
//           profilePhoto: profile.picture.data.url,
//           socialMediaId: profile.id,
//         };
//       case 'apple':
//         return {
//           email: profile.email,
//           userName: profile.name || `${profile.firstName} ${profile.lastName}`,
//           firstName: profile.firstName,
//           lastName: profile.lastName,
//           profilePhoto: profile.picture ? profile.picture.data.url : null,
//           socialMediaId: profile.id,
//         };
//       default:
//         return null;
//     }
//   };

//   try {
//     profileFields = mapProfileFields(provider, profile);
//     if (!profileFields) {
//       res.status(400).json({ message: 'Unsupported provider' });
//       return null; // Stop further execution
//     }

//     authType = provider; // Use provider directly as authType
//     if (!authType) {
//       res.status(400).json({ message: 'Invalid authentication type' });
//       return null; // Stop further execution
//     }

//     // Find the user by socialMediaId
//     let user = await User.findOne({ socialMediaId: profileFields.socialMediaId, authType });
//     if (!user) {
//       // Check if a user exists with the same email
//       user = await User.findOne({ email: profileFields.email });

//       if (user) {
//         if (user.authType !== authType) {
//           // Provide user-specific error messages
//           const providerNameMap = {
//             email: 'email and password',
//             google: 'Google',
//             facebook: 'Facebook',
//             apple: 'Apple',
//           };

//           const existingProvider = providerNameMap[user.authType] || user.authType;

//           const message =
//             existingProvider === 'email and password'
//               ? `This email address is already registered using email and password. Please sign in using email and password or reset your password if needed.`
//               : `This email address is already registered using ${existingProvider}. Please sign in using ${existingProvider}.`;

//           res.status(400).json({ message });
//           return null; // Stop further execution
//         }
//       } else {
//         // Create a new user if no email match found
//         user = new User({ ...profileFields, authType });
//         await user.save();
//       }
//     }

//     return user; // Return user if successful
//   } catch (error) {
//     console.error('Error in findOrCreateUser:', error.message);
//     res.status(500).json({ message: 'Internal server error' });
//     return null; // Stop further execution
//   }
// };

// const findOrCreateUser = async (profile, provider, res) => {
//   let authType, profileFields;

//   // Normalize profile fields based on the provider
//   const mapProfileFields = (provider, profile) => {
//     switch (provider) {
//       case 'google':
//         return {
//           email: profile.email,
//           userName: profile.name || `${profile.firstName} ${profile.lastName}`,
//           firstName: profile.given_name,
//           lastName: profile.family_name,
//           profilePhoto: profile.picture,
//           socialMediaId: profile.id,
//         };
//       case 'facebook':
//         return {
//           email: profile.email,
//           userName: profile.name || `${profile.firstName} ${profile.lastName}`,
//           firstName: profile.first_name,
//           lastName: profile.last_name,
//           profilePhoto: profile.picture.data.url,
//           socialMediaId: profile.id,
//         };
//       case 'apple':
//         return {
//           email: profile.email,
//           userName: profile.name || `${profile.firstName} ${profile.lastName}`,
//           firstName: profile.firstName,
//           lastName: profile.lastName,
//           profilePhoto: profile.picture ? profile.picture.data.url : null,
//           socialMediaId: profile.id,
//         };
//       default:
//         return null;
//     }
//   };

//   try {
//     profileFields = mapProfileFields(provider, profile);
//     if (!profileFields) {
//       res.status(400).json({ message: 'Unsupported provider' });
//       return null; // Stop further execution
//     }

//     authType = provider; // Use provider directly as authType
//     if (!authType) {
//       res.status(400).json({ message: 'Invalid authentication type' });
//       return null; // Stop further execution
//     }

//     // Find the user by socialMediaId
//     let user = await User.findOne({ socialMediaId: profileFields.socialMediaId, authType });
//     if (!user) {
//       // Check if a user exists with the same email
//       user = await User.findOne({ email: profileFields.email });

//       if (user) {
//         if (user.authType !== authType) {
//           // Provide user-specific error messages
//           const providerNameMap = {
//             email: 'email and password',
//             google: 'Google',
//             facebook: 'Facebook',
//             apple: 'Apple',
//           };

//           const existingProvider = providerNameMap[user.authType] || user.authType;

//           const message =
//             existingProvider === 'email and password'
//               ? `This email address is already registered using email and password. Please sign in using email and password or reset your password if needed.`
//               : `This email address is already registered using ${existingProvider}. Please sign in using ${existingProvider}.`;

//           res.status(400).json({ message });
//           return null; // Stop further execution
//         }
//       } else {
//         // Create a new user if no email match found
//         user = new User({ ...profileFields, authType });
//         await user.save();
//       }
//     }

//     // Check if the email is in the pendingInvites list of any league
//     const leagueWithPendingInvite = await League.findOne({ pendingInvites: profileFields.email });
//     if (leagueWithPendingInvite) {
//       // Remove email from pendingInvites and add to emails and userId in the league
//       leagueWithPendingInvite.pendingInvites = leagueWithPendingInvite.pendingInvites.filter(
//         (email) => email !== profileFields.email
//       );
//       leagueWithPendingInvite.emails.push(profileFields.email);
//       leagueWithPendingInvite.userId.push(user._id);
//       await leagueWithPendingInvite.save();

//       return res.status(200).json({
//         message: "User found in pending invites and added to the league successfully.",
//         user,
//       });
//     }

//     return user; // Return user if successful
//   } catch (error) {
//     console.error('Error in findOrCreateUser:', error.message);
//     res.status(500).json({ message: 'Internal server error' });
//     return null; 
//   }
// };

   
// // General function to update social media record
// const updateSocialMedia = async (userId, socialMediaId, provider) => {
//   const updateField =
//     provider === 'google'
//       ? { google: socialMediaId }
//       : provider === 'facebook'
//       ? { facebook: socialMediaId }
//       : { apple: socialMediaId };

//   await SocialMedia.findOneAndUpdate({ userId }, updateField, { upsert: true, new: true });
// };

// // Google OAuth callback route
// router.post('/google/callback', async (req, res) => {
//   const { accessToken } = req.body;

//   try {
//     const response = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`);
//     const profile = response.data;

//     const user = await findOrCreateUser(profile, 'google', res);
//     if (!user) return; // Exit if an error was already sent

//     await updateSocialMedia(user._id, profile.id, 'google');
//     const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

//     res.status(200).json({ message: 'Sign-in successful', token, user });
//   } catch (error) {
//     console.error('Error during Google sign-in:', error.message);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // Facebook OAuth callback route
// router.post('/facebook/callback', async (req, res) => {
//   const { accessToken } = req.body;

//   try {
//     const response = await axios.get(
//       `https://graph.facebook.com/me?fields=id,name,email,first_name,last_name,picture&access_token=${accessToken}`
//     );
//     const profile = response.data;

//     const user = await findOrCreateUser(profile, 'facebook', res);
//     if (!user) return; // Exit if an error was already sent

//     await updateSocialMedia(user._id, profile.id, 'facebook');
//     const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

//     res.status(200).json({ message: 'Sign-in successful', token, user });
//   } catch (error) {
//     console.error('Error during Facebook sign-in:', error.message);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // Apple OAuth callback route
// router.post('/apple/callback', async (req, res) => {
//   const { credential } = req.body;
//   const { identityToken, fullName } = credential;
//   const { familyName, givenName } = fullName;

//   try {
//     const client = jwksClient({
//       jwksUri: 'https://appleid.apple.com/auth/keys',
//     });

//     const getAppleKey = (header, callback) => {
//       client.getSigningKey(header.kid, (err, key) => {
//         const signingKey = key.getPublicKey();
//         callback(null, signingKey);
//       });
//     };

//     jwt.verify(identityToken, getAppleKey, { algorithms: ['RS256'] }, async (err, decodedToken) => {
//       if (err) {
//         console.error('Token verification failed:', err.message);
//         return res.status(401).json({ message: 'Invalid ID token' });
//       }

//       const profile = {
//         email: decodedToken.email,
//         firstName: givenName,
//         lastName: familyName,
//         id: decodedToken.sub, // Apple uses "sub" as the unique user ID
//       };

//       const user = await findOrCreateUser(profile, 'apple', res);
//       if (!user) return; // Exit if an error was already sent

//       await updateSocialMedia(user._id, profile.id, 'apple');
//       const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

//       res.status(200).json({ message: 'Sign-in successful', token, user });
//     });
//   } catch (error) {
//     console.error('Error during Apple sign-in:', error.message);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // Export router
// module.exports = router;


// const express = require('express');
// const axios = require('axios');
// const jwt = require('jsonwebtoken');
// const jwksClient = require('jwks-rsa');
// const User = require('../models/User');
// const League = require('../models/League');
// const SocialMedia = require('../models/SocialMedia');
// // const router = express.Router();
// // const { JWT_SECRET } = process.env;

const mapProfileFields = (provider, profile) => {
  switch (provider) {
    case 'google':
      return {
        email: profile.email,
        userName: profile.name || `${profile.firstName} ${profile.lastName}`,
        firstName: profile.given_name,
        lastName: profile.family_name,
        profilePhoto: profile.picture,
        socialMediaId: profile.id,
      };
    case 'facebook':
      return {
        email: profile.email,
        userName: profile.name || `${profile.firstName} ${profile.lastName}`,
        firstName: profile.first_name,
        lastName: profile.last_name,
        profilePhoto: profile.picture.data.url,
        socialMediaId: profile.id,
      };
    case 'apple':
      return {
        email: profile.email,
        userName: profile.name || `${profile.firstName} ${profile.lastName}`,
        firstName: profile.firstName,
        lastName: profile.lastName,
        profilePhoto: profile.picture ? profile.picture.data.url : null,
        socialMediaId: profile.id,
      };
    default:
      return null;
  }
};

const findOrCreateUser = async (profile, provider) => {
  try {
    const profileFields = mapProfileFields(provider, profile);
    if (!profileFields) return { error: 'Unsupported provider' };

    const authType = provider;
    if (!authType) return { error: 'Invalid authentication type' };

    let user = await User.findOne({ socialMediaId: profileFields.socialMediaId, authType });
    if (!user) {
      user = await User.findOne({ email: profileFields.email });
      if (user && user.authType !== authType) {
        const providerMap = { email: 'email and password', google: 'Google', facebook: 'Facebook', apple: 'Apple' };
        return { error: `This email is already registered using ${providerMap[user.authType] || user.authType}.` };
      }
      if (!user) {
        user = new User({ ...profileFields, authType });
        await user.save();
      }
    }

    const leagueWithPendingInvite = await League.findOne({ pendingInvites: profileFields.email });
    if (leagueWithPendingInvite) {
      leagueWithPendingInvite.pendingInvites = leagueWithPendingInvite.pendingInvites.filter(email => email !== profileFields.email);
      leagueWithPendingInvite.emails.push(profileFields.email);
      leagueWithPendingInvite.userId.push(user._id);
      await leagueWithPendingInvite.save();
      return { user, message: 'User added to league successfully.' };
    }

    return { user };
  } catch (error) {
    console.error('Error in findOrCreateUser:', error.message);
    return { error: 'Internal server error' };
  }
};

const updateSocialMedia = async (userId, socialMediaId, provider) => {
  const updateField = provider === 'google' ? { google: socialMediaId } : provider === 'facebook' ? { facebook: socialMediaId } : { apple: socialMediaId };
  await SocialMedia.findOneAndUpdate({ userId }, updateField, { upsert: true, new: true });
};

router.post('/google/callback', async (req, res) => {
  try {
    const response = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${req.body.accessToken}`);
    const { user, error, message } = await findOrCreateUser(response.data, 'google');
    if (error) return res.status(400).json({ message: error });

    await updateSocialMedia(user._id, response.data.id, 'google');
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    res.status(200).json({ message: message || 'Sign-in successful', token, user });
  } catch (error) {
    console.error('Error during Google sign-in:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/facebook/callback', async (req, res) => {
  try {
    const response = await axios.get(`https://graph.facebook.com/me?fields=id,name,email,first_name,last_name,picture&access_token=${req.body.accessToken}`);
    const { user, error, message } = await findOrCreateUser(response.data, 'facebook');
    if (error) return res.status(400).json({ message: error });

    await updateSocialMedia(user._id, response.data.id, 'facebook');
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    res.status(200).json({ message: message || 'Sign-in successful', token, user });
  } catch (error) {
    console.error('Error during Facebook sign-in:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/apple/callback', async (req, res) => {
  try {
    const client = jwksClient({ jwksUri: 'https://appleid.apple.com/auth/keys' });
    jwt.verify(req.body.credential.identityToken, (header, callback) => {
      client.getSigningKey(header.kid, (err, key) => callback(null, key.getPublicKey()));
    }, { algorithms: ['RS256'] }, async (err, decodedToken) => {
      if (err) return res.status(401).json({ message: 'Invalid ID token' });
      
      const profile = { email: decodedToken.email, firstName: req.body.credential.fullName.givenName, lastName: req.body.credential.fullName.familyName, id: decodedToken.sub };
      const { user, error, message } = await findOrCreateUser(profile, 'apple');
      if (error) return res.status(400).json({ message: error });

      await updateSocialMedia(user._id, profile.id, 'apple');
      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
      res.status(200).json({ message: message || 'Sign-in successful', token, user });
    });
  } catch (error) {
    console.error('Error during Apple sign-in:', error.message);
    if (!res.headersSent) res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;



