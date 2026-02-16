const jwt = require('jsonwebtoken');

module.exports = {
  friendlyName: 'Login',

  inputs: {
    emailAddress: { type: 'string', required: true },
    password: { type: 'string', required: true },
    rememberMe: { type: 'boolean' }
  },

  exits: {
    success: {
      description: 'Login successful.',
      responseType: 'redirect' // This tells Sails to redirect the browser
    },
    badCombo: {
      description: 'Invalid email/password.',
      // Since we aren't using AJAX, we redirect back to login with an error query param
      responseType: 'redirect' 
    }
  },

  fn: async function ({ emailAddress, password, rememberMe }) {
    // 1. Look up user
    var userRecord = await User.findOne({
      emailAddress: emailAddress.toLowerCase(),
    });

    if (!userRecord) {
      // If no user, send them back to login page with an error flag
      throw { success: '/login?error=badCombo' }; 
    }

    // 2. Check password
    try {
      await sails.helpers.passwords.checkPassword(password, userRecord.password);
    } catch (err) {
      throw { success: '/login?error=badCombo' };
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { userId: userRecord.id },
      sails.config.custom.jwtSecret, // Use the config we set up earlier
      { expiresIn: rememberMe ? "30d" : "2d" }
    );

    // 4. Set Cookie (This makes it "work" without Vue/JS)
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 2 * 24 * 60 * 60 * 1000;
    this.res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge
    });

    // 5. Traditional Session fallback (Good for Sails policy support)
    this.req.session.userId = userRecord.id;

    // 6. REDIRECT to the dashboard
    throw { success: '/dashboard' };
  }
};