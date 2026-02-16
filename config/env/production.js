/**
 * Production environment settings for "Poof!"
 */

module.exports = {

  datastores: {
    default: {
      adapter: 'sails-mongo',
      url: process.env.MONGO_URL, 
    },
  },

  models: {
    // Note: Change to 'alter' only for the very first deployment to build collections, 
    // then switch back to 'safe' to protect your data.
    migrate: 'alter',
  },

  blueprints: {
    shortcuts: false,
  },

  security: {
    cors: {
      // Replace with your actual Render URL after your first deployment
      // allowOrigins: ['https://poof-expenses.onrender.com'],
    },
  },

  session: {
    // secret: process.env.SESSION_SECRET,
    cookie: {
      secure: true, // Required because Render provides HTTPS
      maxAge: 24 * 60 * 60 * 1000,  // 24 hours
    },
  },

  sockets: {
    onlyAllowOrigins: [
      "https://poof-expenses.onrender.com", // Replace with your ACTUAL Render URL
    ],
    // onlyAllowOrigins: ['https://poof-expenses.onrender.com'],
  },

  log: {
    level: 'info'
  },

  http: {
    cache: 365.25 * 24 * 60 * 60 * 1000, // One year
    trustProxy: true, // CRITICAL for Render/Load Balancers to handle cookies correctly
  },

  custom: {
    baseUrl: 'https://poof-expenses.onrender.com', // Update this after deployment
    internalEmailAddress: 'jamnasuthar1007@gmail.com',
    
    // JWT Configuration
    jwtSecret: process.env.JWT_SECRET,
    jwtExpires: '24h'
  },

};