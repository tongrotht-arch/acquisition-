import { signupSchema } from "#validations/auth.validation.js";
import { formatValidationErrors } from "#utils/format.js";
import logger from '#config/logger.js';

/**
 * Express controller to handle user signup requests.
 * 
 * Flow:
 * 1. Validates input body against signupSchema (Zod).
 * 2. On validation failure, returns 400 Bad Request with errors.
 * 3. On success, responds with 201 Created (Mock ID).
 * 4. Catches errors (e.g., 'User already exist' -> 409 Conflict).
 * 5. Passes other unhandled errors to the global Express error-handler via next(e).
 */
export const signup = async (req, res, next) => {
    try {
        // Validate request body
        const validationResult = signupSchema.safeParse(req.body);

        // If validation fails, return early with 400 and format the issues
        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationErrors(validationResult.error)
            });
        }

        const { name, email, role } = validationResult.data;
        logger.info(`User signup successfully: ${email}`);

        // Return early with 201 Created and user details
        return res.status(201).json({
            message: 'User registered',
            id: 1,
            name,
            email,
            role
        });
    } catch (e) {
        logger.error('Signup error', e);

        // If user already exists, return 409 Conflict
        if (e.message === 'User already exist') {
            return res.status(409).json({ error: 'Email already exist' });
        }

        // Pass any other unexpected errors to the Express error handler middleware
        return next(e);
    }
}