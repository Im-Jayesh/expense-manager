const jwt = require('jsonwebtoken');

module.exports = {
  friendlyName: 'Login',

  inputs: {
  emailAddress: { type: 'string', required: true },
  password: { type: 'string', required: true },
  // Change type to 'string' because HTML forms send "on" or undefined
  rememberMe: { type: 'string' } 
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
  // Convert the string "on" into a real boolean
  const isRememberMe = rememberMe === 'on';

  // 1. Look up user...
  var userRecord = await User.findOne({
    emailAddress: emailAddress.toLowerCase(),
  });

  if (!userRecord) { throw { badCombo: '/login?error=badCombo' }; }

  // 2. Check password...
  try {
    await sails.helpers.passwords.checkPassword(password, userRecord.password);
  } catch (err) {
    throw { badCombo: '/login?error=badCombo' };
  }

  // 3. Generate JWT (Using our new isRememberMe boolean)
  const token = jwt.sign(
    { userId: userRecord.id },
    sails.config.custom.jwtSecret,
    { expiresIn: isRememberMe ? "30d" : "2d" }
  );

  // 4. Set Cookie
  const maxAge = isRememberMe ? 30*24*60*60*1000 : 2*24*60*60*1000;
  this.res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge
  });

  this.req.session.userId = userRecord.id;

  // 5. Redirect to dashboard
  throw { success: '/accounts' };
}
};