// api/policies/is-logged-in.js
module.exports = async function (req, res, proceed) {

  // 1. Check if the session exists
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  // 2. Look up the user to ensure they are still valid
  const user = await User.findOne({ id: req.session.userId });

  if (!user) {
    // Session exists but user doesn't (deleted from DB)
    delete req.session.userId;
    return res.redirect('/login');
  }

  // 3. Attach user to req so your controllers can use it easily
  req.me = user; 

  return proceed();
};