const express = require('express');
const { 
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const { 
  categoryValidation, 
  validateRequest 
} = require('../middleware/validation');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Category routes
router.route('/')
  .get(getCategories)
  .post(protect, categoryValidation, validateRequest, createCategory);

router.route('/:id')
  .get(getCategory)
  .put(protect, categoryValidation, validateRequest, updateCategory)
  .delete(protect, deleteCategory);

module.exports = router;