// config/env/production.js
module.exports = {

  // Give it 3 full minutes to wake up
  hookTimeout: 180000, 

  // Disable Grunt in production to save time and memory
  hooks: {
    
  },

  datastores: {
    default: {
      adapter: 'sails-mongo',
      url: process.env.MONGO_URL, 
    },
  },

  models: {
    migrate: 'safe',
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