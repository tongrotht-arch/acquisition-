import { signupSchema } from '#validations/auth.validation.js';
import { formatValidationErrors } from '#utils/format.js';
import logger from '#config/logger.js';
import { createUser } from '#services/auth.service.js';
import { jwttoken } from '#utils/jwts.js';
import { cookies } from '#utils/cookies.js';

export const signup = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(validationResult.error),
      });
    }

    const { name, email, password, role } = validationResult.data;
    const user = await createUser({ name, email, password, role });
    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    cookies.set(res, 'token', token);
    logger.info(`User signup successfully: ${email}`);

    return res.status(201).json({
      message: 'User registered',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    logger.error('Signup error', error);

    if (error.message === 'User already exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    return next(error);
  }
};
