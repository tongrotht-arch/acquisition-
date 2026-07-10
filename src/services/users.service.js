import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { eq } from 'drizzle-orm';
import { users } from '#models/user.model.js';
import { hashPassword } from '#services/auth.service.js';

const publicUserColumns = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  created_at: users.created_at,
  updated_at: users.updated_at,
};

export const getAllUsers = async () => {
  try {
    const allUsers = await db.select(publicUserColumns).from(users);

    logger.info('Users retrieved successfully', { count: allUsers.length });
    return allUsers;
  } catch (error) {
    logger.error('Error retrieving users', error);
    throw new Error('Error retrieving users', { cause: error });
  }
};

export const getUserById = async (id) => {
  try {
    const [user] = await db
      .select(publicUserColumns)
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user;
  } catch (error) {
    logger.error('Error retrieving user', error);
    throw new Error('Error retrieving user', { cause: error });
  }
};

export const updateUser = async (id, updates) => {
  try {
    const existingUser = await getUserById(id);

    if (!existingUser) {
      throw new Error('User not found');
    }

    const updateValues = { ...updates, updated_at: new Date() };

    if (updateValues.password) {
      updateValues.password = await hashPassword(updateValues.password);
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateValues)
      .where(eq(users.id, id))
      .returning(publicUserColumns);

    logger.info('User updated successfully', { userId: updatedUser.id });
    return updatedUser;
  } catch (error) {
    if (error.message === 'User not found') {
      throw error;
    }

    logger.error('Error updating user', error);
    throw new Error('Error updating user', { cause: error });
  }
};

export const deleteUser = async (id) => {
  try {
    const existingUser = await getUserById(id);

    if (!existingUser) {
      throw new Error('User not found');
    }

    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning(publicUserColumns);

    logger.info('User deleted successfully', { userId: deletedUser.id });
    return deletedUser;
  } catch (error) {
    if (error.message === 'User not found') {
      throw error;
    }

    logger.error('Error deleting user', error);
    throw new Error('Error deleting user', { cause: error });
  }
};


```
getAllUsers, 
getUserById, 
updateUser, 
deleteUser 

```