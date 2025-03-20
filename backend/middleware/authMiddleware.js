// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';


export default function authMiddleware(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized: No session found.' });
  }

  req.user = { id: req.session.userId };

  next();
}
