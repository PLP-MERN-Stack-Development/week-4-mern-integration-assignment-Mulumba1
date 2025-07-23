const { body, validationResult } = require('express-validator');

// Middleware to handle validation results
exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg
      }))
    });
  }
  next();
};

// User registration validation rules
exports.registerValidation = [
  body('name', 'Name is required').trim().not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
];

// User login validation rules
exports.loginValidation = [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
];

// Create post validation rules
exports.postValidation = [
  body('title', 'Title is required').trim().not().isEmpty(),
  body('title', 'Title cannot be more than 200 characters').isLength({ max: 200 }),
  body('content', 'Content is required').trim().not().isEmpty(),
  body('content', 'Content must be at least 10 characters').isLength({ min: 10 }),
  body('category', 'Category is required').not().isEmpty()
];

// Create category validation rules
exports.categoryValidation = [
  body('name', 'Name is required').trim().not().isEmpty(),
  body('name', 'Name cannot be more than 50 characters').isLength({ max: 50 })
];

// Comment validation rules
exports.commentValidation = [
  body('text', 'Text is required').trim().not().isEmpty()
];