const jwt = require('jsonwebtoken');
const { User } = require('../models');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ success: false, message: 'Authentication required', data: null });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    User.findByPk(payload.userId)
      .then(user => {
        if (!user) return res.status(401).json({ success: false, message: 'User not found', data: null });
        req.user = user;
        next();
      })
      .catch(next);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token', data: null });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required', data: null });
    if (!roles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'Access denied', data: null });
    next();
  };
}

module.exports = { authenticate, requireRole };
