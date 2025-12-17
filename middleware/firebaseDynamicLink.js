const admin = require('../config/firebaseConfig'); // Make sure this points to your firebaseConfig.js

// Firebase Dynamic Link Generation
async function generateDynamicLink() {
  const dynamicLinkInfo = {
    dynamicLinkInfo: {
      domainUriPrefix: 'https://yourapp.page.link', // Replace with your Firebase Dynamic Link domain
      link: 'https://www.yourwebsite.com', // Fallback URL for web
      androidInfo: {
        androidPackageName: 'com.yourapp.android', // Your Android app package name
        androidFallbackLink: 'https://play.google.com/store/apps/details?id=com.yourapp.android', // Play Store link
      },
      iosInfo: {
        iosBundleId: 'com.yourapp.ios', // Your iOS app bundle ID
        iosFallbackLink: 'https://apps.apple.com/us/app/yourapp/idYOUR_APP_ID', // App Store link
      },
    },
  };

  try {
    const response = await admin.dynamicLinks().createShortLink(dynamicLinkInfo, 'UNGUESSABLE');
    return response.shortLink;
  } catch (error) {
    console.error('Error generating dynamic link:', error);
    throw new Error('Error generating dynamic link');
  }
}

module.exports = { generateDynamicLink };
