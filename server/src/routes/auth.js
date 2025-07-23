const express = require('express');
const { 
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  logout
} = require('../controllers/authController');

const { 
  registerValidation,
  loginValidation,
  validateRequest
} = require('../middleware/validation');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Auth routes
router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.get('/logout', logout);

module.exports = router;