const jwt = require('jsonwebtoken');

module.exports = {
  friendlyName: 'Signup',

  inputs: {
  emailAddress: { required: true, type: 'string', isEmail: true },
  password: { required: true, type: 'string', maxLength: 200 },
  fullName: { required: true, type: 'string' },
  // CHANGE THIS:
  agreed: { type: 'string' } 
},

  exits: {
    success: {
      responseType: 'redirect' // Tell the browser to move to a new page
    },
    emailAlreadyInUse: {
      // If email exists, redirect back to signup with an error flag
      responseType: 'redirect' 
    },
    invalid: {
      responseType: 'badRequest'
    }
  },

  fn: async function ({ emailAddress, password, fullName }) {
    var newEmailAddress = emailAddress.toLowerCase();

    // 1. Create the User Record
    try {
      var newUserRecord = await User.create(_.extend({
        fullName,
        emailAddress: newEmailAddress,
        password: await sails.helpers.passwords.hashPassword(password),
        tosAcceptedByIp: this.req.ip
      }, sails.config.custom.verifyEmailAddresses ? {
        emailProofToken: await sails.helpers.strings.random('url-friendly'),
        emailProofTokenExpiresAt: Date.now() + sails.config.custom.emailProofTokenTTL,
        emailStatus: 'unconfirmed'
      } : {}))
      .fetch();

      // 2. Create the Default Account
      await Account.create({
        name: "Default Account",
        owner: newUserRecord.id
      });

      // 3. Session & JWT Logic
      this.req.session.userId = newUserRecord.id;

      const token = jwt.sign(
        { userId: newUserRecord.id },
        sails.config.custom.jwtSecret,
        { expiresIn: "2d" }
      );

      this.res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 2 * 24 * 60 * 60 * 1000
      });

      // 4. Handle Email Verification (if enabled)
      if (sails.config.custom.verifyEmailAddresses) {
        await sails.helpers.sendTemplateEmail.with({
          to: newEmailAddress,
          subject: 'Please confirm your account',
          template: 'email-verify-account',
          templateData: {
            fullName,
            token: newUserRecord.emailProofToken
          }
        });
      }

      // SUCCESS: Go to the dashboard
      return this.res.redirect('/login');

    } catch (err) {
      if (err.code === 'E_UNIQUE') {
        throw { emailAlreadyInUse: '/signup?error=emailInUse' };
      }
      throw err;
    }
  }
};