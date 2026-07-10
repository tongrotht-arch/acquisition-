import express from 'express';
import {
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from '#controllers/users.controller.js';
import { authenticate } from '#middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getAllUsers);
router.get('/:id', authenticate, getUserById);
router.patch('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, deleteUser);

export default router;
