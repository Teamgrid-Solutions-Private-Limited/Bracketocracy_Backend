const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const User = require("../model/userSchema");

 

// EmailController class
class emailController {
 

  async sendEmail(req, res) {
    console.log("Request body:", req.body); // Log the incoming request body
    const { to } = req.body;

    // Basic validation for email address
    if (!to || !this.validateEmail(to)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    try {
      const user = await User.findOne({ email: to });
      if (user.authType !== 'email') {
        return res.status(400).json({ message: "User not registered with email." });
      }

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      const id = user._id;
      const reseturl = `https://bracketocracy.com/reset-password/${id}`;

 
      const msg = {
        to: to, 
        from: 'no-reply@bracketocracy.com', 
        subject: "Reset Password",
        
        html: `<!DOCTYPE html>
         <html>
         <body style="padding:0; margin:0;">
         <table style="padding:0; margin:0; background:#dadada; padding:50px 0; width:100%; height: 100%;height: 500px;"
         bgcolor="#dadada" border="0" cellpadding="0" cellspacing="0">
         <tbody>
         <tr>
         <td>
         <table bgcolor="#ffffff;"
         style="background: #ffffff; width:600px; margin:0 auto; font-family: Roboto, Arial, sans-serif; font-size:16px; line-height:20px;padding-left: 10px; padding-bottom: 25px;"
         border="0" cellpadding="0" cellspacing="0" align="center">
         <tbody>
         <tr>
         <td bgcolor="#ffffff;" style="background: #ffffff; padding:15px; text-align:center;"><img
         src="https://v2.bracketocracy.com/uploads/logo/logo.png" alt="Logo" width="260">
         </td>
         </tr>
         <tr>
         <td style="width: 1px;height: 1px;"></td>
         </tr>
         <tr>
         <td>
         <table style="width:100%">
         <tr>
         <td style="padding: 20px 30px 0px;">
         Click the link below to reset your password:\n\n<a href="${reseturl}" target="_blank">${reseturl}</a>
         </td>
         </tr>
         <tr>
         <td style="padding: 30px;">
         <div>If you have any problems, please email us at <a href="mailto:support@bracketocracy.com"
         target="_blank"  >support@bracketocracy.com</a></div>
         <br />
         <div style="margin-top: 10px;">
         Best Regards, <br />
         Bracketocracy Team
         </div>
         </td>
         </tr>
         </table>
         </td>
         </tr>
         <tr>
         </tr>
         </tbody>
         </table>
         </td>
         </tr>
         </tbody>
         </table>
         </body>
         </html>`,
      };

 

      await sgMail.send(msg);
      
      res
        .status(200)
        .json({ message: "Email sent successfully."});
    } catch (error) {
      console.error("Error sending email:", error);
      res
        .status(500)
        .json({ message: "Error sending email", error: error.message });
    }
  }

  // Updated sendInviteEmail method
  async sendInviteEmail(email, title, leagueId) {
    // Basic validation for email address
    if (!this.validateEmail(email)) {
      throw new Error("Invalid email address");
    }

    try {
      const inviteUrl = `https://bracketocracy.com/leagues/${leagueId}`;

      // const mailOptions = {
      //   from: "no-reply@bracketocracy.com",
      //   to: email,
      //   subject: `Join My Bracketocracy.com League`,
      //   html: `<!DOCTYPE html>
      //   <html>
      //   <head>
      //   <meta name="viewport" content="width=device-width, initial-scale=1">
      //   <style>
      //   /* Make email responsive */
      //   @media screen and (max-width: 600px) {
      //     .container {
      //       width: 100% !important;
      //       padding: 20px !important;
      //     }
      //     .logo {
      //       width: 150px !important;
      //     }
      //     .app-badge {
      //       width: 100px !important;
      //     }
      //     .text {
      //       font-size: 14px !important;
      //       line-height: 20px !important;
      //     }
      //     .textsmall {
      //       font-size: 12px !important;
      //       line-height: 20px !important;
      //     }
      //   }
      //   </style>
      //   </head>
      //   <body style="padding: 0; margin: 0; background: #dadada;">
      //   <table style="background: #dadada; padding: 50px 0; width: 100%; min-height: 500px;" bgcolor="#dadada" border="0" cellpadding="0" cellspacing="0">
      //   <tbody>
      //   <tr>
      //   <td align="center">
      //   <table class="container" bgcolor="#ffffff" style="background: #ffffff; width: 600px; max-width: 100%; margin: 0 auto; font-family: Roboto, Arial, sans-serif; font-size: 16px; line-height: 24px; padding: 30px; border-radius: 8px;" border="0" cellpadding="0" cellspacing="0">
      //   <tbody>
      //   <tr>
      //   <td bgcolor="#ffffff" style="text-align: center; padding-bottom: 15px;">
      //   <img class="logo" src="https://v2.bracketocracy.com/uploads/logo/logo.png" alt="Logo" width="220">
      //   </td>
      //   </tr>
      //   <tr>
      //   <td style="padding: 20px;">
      //   <p class="text" style="margin: 0;">Hey,</p>
      //   <p class="text" style="margin: 0;">I've started a <strong>${title}</strong> League at <a href="${inviteUrl}" target="_blank" style="color: #007bff; text-decoration: none;">Bracketocracy.com</a>, come join. <a href="${inviteUrl}" target="_blank" style="color: #007bff; text-decoration: none;">${inviteUrl}</a></p>
      //   </td>
      //   </tr>
      //   <tr>
      //   <td style="padding: 20px;">
      //   <p class="text" style="margin: 0;">If you have any problems, please email us at <a href="mailto:support@bracketocracy.com" target="_blank" style="color: #007bff; text-decoration: none;">support@bracketocracy.com</a></p>
      //   </td>
      //   </tr>
      //   <tr>
      //   <td style="padding: 20px;">
      //   <strong>Best Regards, <br /> Bracketocracy Team</strong>
      //   </td>
      //   </tr>
      //   </tbody>
      //   </table>
      //   </td>
      //   </tr>
      //   <tr>
      //   <td align="center">
      //   <p style=" font-family: Roboto, Arial, sans-serif; font-size:13px; padding-top: 10px;">Haven't downloaded the Bracketocracy App yet?</p>
      //   <p><a href="https://apps.apple.com/us/app/yourapp/idYOUR_APP_ID" target="_blank" style="text-decoration: none; margin-right: 10px;">
      //   <img class="app-badge" src="https://v2.bracketocracy.com/uploads/logo/app-store1.png" alt="Download on the App Store" width="120" height="36">
      //   </a> <a href="https://play.google.com/store/apps/details?id=com.yourapp.android" target="_blank" style="text-decoration: none;">
      //   <img class="app-badge" src="https://v2.bracketocracy.com/uploads/logo/g-play-1.png" alt="Get it on Google Play" width="120" height="36">
      //   </a> </p>
      //   </td>
      //   </tr>
      //   </tbody>
      //   </table>
      //   </body>
      //   </html>`
      // };

      const msg = {
        to: email, 
        from: 'no-reply@bracketocracy.com', 
        subject: `Join My Bracketocracy.com League`,
        html: `<!DOCTYPE html>
        <html>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
        /* Make email responsive */
        @media screen and (max-width: 600px) {
          .container {
            width: 100% !important;
            padding: 20px !important;
          }
          .logo {
            width: 150px !important;
          }
          .app-badge {
            width: 100px !important;
          }
          .text {
            font-size: 14px !important;
            line-height: 20px !important;
          }
          .textsmall {
            font-size: 12px !important;
            line-height: 20px !important;
          }
        }
        </style>
        </head>
        <body style="padding: 0; margin: 0; background: #dadada;">
        <table style="background: #dadada; padding: 50px 0; width: 100%; min-height: 500px;" bgcolor="#dadada" border="0" cellpadding="0" cellspacing="0">
        <tbody>
        <tr>
        <td align="center">
        <table class="container" bgcolor="#ffffff" style="background: #ffffff; width: 600px; max-width: 100%; margin: 0 auto; font-family: Roboto, Arial, sans-serif; font-size: 16px; line-height: 24px; padding: 30px; border-radius: 8px;" border="0" cellpadding="0" cellspacing="0">
        <tbody>
        <tr>
        <td bgcolor="#ffffff" style="text-align: center; padding-bottom: 15px;">
        <img class="logo" src="https://v2.bracketocracy.com/uploads/logo/logo.png" alt="Logo" width="220">
        </td>
        </tr>
        <tr>
        <td style="padding: 20px;">
        <p class="text" style="margin: 0;">Hey,</p>
        <p class="text" style="margin: 0;">I've started a <strong>${title}</strong> League at <a href="${inviteUrl}" target="_blank" style="color: #007bff; text-decoration: none;">Bracketocracy.com</a>, come join. <a href="${inviteUrl}" target="_blank" style="color: #007bff; text-decoration: none;">${inviteUrl}</a></p>
        </td>
        </tr>
        <tr>
        <td style="padding: 20px;">
        <p class="text" style="margin: 0;">If you have any problems, please email us at <a href="mailto:support@bracketocracy.com" target="_blank" style="color: #007bff; text-decoration: none;">support@bracketocracy.com</a></p>
        </td>
        </tr>
        <tr>
        <td style="padding: 20px;">
        <strong>Best Regards, <br /> Bracketocracy Team</strong>
        </td>
        </tr>
        </tbody>
        </table>
        </td>
        </tr>
        <tr>
        <td align="center">
        <p style=" font-family: Roboto, Arial, sans-serif; font-size:13px; padding-top: 10px;">Haven't downloaded the Bracketocracy App yet?</p>
        <p><a href="https://apps.apple.com/us/app/yourapp/idYOUR_APP_ID" target="_blank" style="text-decoration: none; margin-right: 10px;">
        <img class="app-badge" src="https://v2.bracketocracy.com/uploads/logo/app-store1.png" alt="Download on the App Store" width="120" height="36">
        </a> <a href="https://play.google.com/store/apps/details?id=com.yourapp.android" target="_blank" style="text-decoration: none;">
        <img class="app-badge" src="https://v2.bracketocracy.com/uploads/logo/g-play-1.png" alt="Get it on Google Play" width="120" height="36">
        </a> </p>
        </td>
        </tr>
        </tbody>
        </table>
        </body>
        </html>`
      };

      await sgMail.send(msg);
      
      return { message: "Email sent successfully."};
    } catch (error) {
      console.error("Error sending email:", error.message);
      throw new Error("Failed to send invitation email");
    }
  }

  // Simple email validation function
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}

module.exports = new emailController();



