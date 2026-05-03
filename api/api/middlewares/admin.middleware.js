// src/api/middlewares/admin.middleware.js
const adminMiddleware = (req, res, next) => {
  // Ensure the user exists (from authMiddleware) and their type is 'admin'
  if (req.user && req.user.user_type === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin privileges required." });
  }
};

module.exports = adminMiddleware;