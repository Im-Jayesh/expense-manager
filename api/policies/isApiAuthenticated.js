const jwt = require('jsonwebtoken');

module.exports = async function (req, res, proceed) {
  try {
    // 1) Authorization header (Bearer)
    let token = null;
    const auth = req.headers.authorization || '';
    if (auth && auth.split(' ')[0] === 'Bearer') {
      token = auth.split(' ')[1];
    }
    
    // 2) If no header token, check cookies (jwt cookie)
    if (!token && req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
      console.log("JWT TOKEN: 🎟️ ", token);
    }
    

    if (!token) {
      return res.forbidden('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.apiUser = decoded;
    return proceed();
  } catch (err) {
    return res.forbidden('Invalid or expired token');
  }
};
