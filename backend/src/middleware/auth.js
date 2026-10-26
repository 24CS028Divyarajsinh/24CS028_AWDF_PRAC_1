const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Authentication required. Please log in.' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-only-secret-change-me');
    const user = await User.findById(payload.sub).select('name email');
    if (!user) return res.status(401).json({ message: 'User account was not found.' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is invalid or expired. Please log in again.' });
  }
}

module.exports = { requireAuth };
