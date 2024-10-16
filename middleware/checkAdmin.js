// backend/middleware/checkAdmin.js

const checkAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next(); // User is an admin, proceed to the next middleware or route handler
    } else {
      res.status(403).json({ message: 'Access denied, admin privileges required.' });
    }
  };
  
  module.exports = checkAdmin;
  