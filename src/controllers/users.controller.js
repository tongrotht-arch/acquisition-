import {
  deleteUser as deleteUserService,
  getAllUsers as getAllUsersService,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
} from '#services/users.service.js';

import {
  updateUserSchema,
  userIdSchema,
} from '#validations/users.validation.js';

import { formatValidationErrors } from '#utils/format.js';
import logger from '#config/logger.js';

const validateUserId = (req, res) => {
  const validationResult = userIdSchema.safeParse(req.params);

  if (!validationResult.success) {
    res.status(400).json({
      error: 'Validation failed',
      details: formatValidationErrors(validationResult.error),
    });
    return null;
  }

  return validationResult.data.id;
};

const requireAuthenticatedUser = (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return false;
  }

  return true;
};

export const getAllUsers = async (_req, res, next) => {
  try {
    const users = await getAllUsersService();

    logger.info('Users retrieved successfully');
    return res.status(200).json({ users });
  } catch (error) {
    logger.error('Get all users error', error);
    return next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const id = validateUserId(req, res);

    if (!id) {
      return;
    }

    const user = await getUserByIdService(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info('User retrieved successfully', { userId: id });
    return res.status(200).json({ user });
  } catch (error) {
    logger.error('Get user by id error', error);
    return next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    if (!requireAuthenticatedUser(req, res)) {
      return;
    }

    const id = validateUserId(req, res);

    if (!id) {
      return;
    }

    const validationResult = updateUserSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(validationResult.error),
      });
    }

    const updates = validationResult.data;
    const isAdmin = req.user.role === 'admin';
    const isOwnAccount = Number(req.user.id) === id;

    if (!isAdmin && !isOwnAccount) {
      return res
        .status(403)
        .json({ error: 'You can only update your own information' });
    }

    if (updates.role && !isAdmin) {
      return res
        .status(403)
        .json({ error: 'Only admins can update user roles' });
    }

    const user = await updateUserService(id, updates);

    logger.info('User updated successfully', {
      userId: id,
      updatedBy: req.user.id,
    });

    return res.status(200).json({
      message: 'User updated',
      user,
    });
  } catch (error) {
    logger.error('Update user error', error);

    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    return next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (!requireAuthenticatedUser(req, res)) {
      return;
    }

    const id = validateUserId(req, res);

    if (!id) {
      return;
    }

    const isAdmin = req.user.role === 'admin';
    const isOwnAccount = Number(req.user.id) === id;

    if (!isAdmin && !isOwnAccount) {
      return res
        .status(403)
        .json({ error: 'You can only delete your own account' });
    }

    const user = await deleteUserService(id);

    logger.info('User deleted successfully', {
      userId: id,
      deletedBy: req.user.id,
    });

    return res.status(200).json({
      message: 'User deleted',
      user,
    });
  } catch (error) {
    logger.error('Delete user error', error);

    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    return next(error);
  }
};
