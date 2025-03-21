import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
  console.log('🔍 Checking session...');
  console.log('📌 Session:', req.session);
  console.log('📌 Session User ID:', req.session?.userId);

  if (!req.session || !req.session.userId) {
    console.error('❌ Unauthorized: No session found.');
    return res.status(401).json({ message: 'Unauthorized: No session found.' });
  }

  req.user = { id: req.session.userId };

  console.log('✅ Authenticated User:', req.user);
  next();
}
