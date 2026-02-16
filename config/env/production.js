module.exports = {

  // 1. Tell Sails to be more patient (80 seconds instead of 40)
  hookTimeout: 90000, 

  datastores: {
    default: {
      adapter: 'sails-mongo',
      url: process.env.MONGO_URL, 
    },
  },

  models: {
    migrate: 'safe', // MUST be safe for production
  },

  sockets: {
    onlyAllowOrigins: [
      "https://poof-expenses.onrender.com",
      "https://www.poof-expenses.onrender.com"
    ],
  },

  http: {
    trustProxy: true,
  },

  session: {
    cookie: {
      secure: true,
    },
  },

  custom: {
    baseUrl: 'https://poof-expenses.onrender.com',
    jwtSecret: process.env.JWT_SECRET,
    jwtExpires: '24h'
  },
};