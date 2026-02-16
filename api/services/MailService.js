const nodemailer = require('nodemailer');

module.exports = {

  sendWelcomeEmail: async function (toEmail) {
    try {

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: `"Poof! Expense Manager" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Welcome to Expense Manager 🎉",
        text: "Your account has been successfully created.",
        html: "<h2>Welcome 🎉</h2><p>Your account has been successfully created.</p>"
      };

      await transporter.sendMail(mailOptions);

      sails.log("Welcome email sent to:", toEmail);

    } catch (err) {
      sails.log.error("Email error:", err);
      throw err;
    }
  }

};
