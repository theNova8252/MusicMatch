import express from 'express';
import {
  requestAccountDeletion,
  confirmAccountDeletion
} from '../controllers/authController.js';

const router = express.Router();

router.post('/request-account-deletion', requestAccountDeletion);
router.get('/confirm-delete/:token', confirmAccountDeletion);

export default router;
