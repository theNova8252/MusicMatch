import express from 'express';
import { handleMatch } from '../controllers/matchController.js';

const router = express.Router();

router.post('/', handleMatch); // Route zum Liken / Matchen
router.get('/', (req, res) => {
  res.json({ message: 'Match route is working!' });
});

export default router;
