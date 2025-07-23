const express = require('express');
const { 
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  uploadPostImage,
  addComment,
  removeComment,
  likePost,
  unlikePost
} = require('../controllers/postController');

const { 
  postValidation,
  commentValidation,
  validateRequest 
} = require('../middleware/validation');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Post routes
router.route('/')
  .get(getPosts)
  .post(protect, postValidation, validateRequest, createPost);

router.route('/:id')
  .get(getPost)
  .put(protect, postValidation, validateRequest, updatePost)
  .delete(protect, deletePost);

// Image upload
router.put('/:id/image', protect, uploadPostImage);

// Comments
router.post('/:id/comments', protect, commentValidation, validateRequest, addComment);
router.delete('/:id/comments/:commentId', protect, removeComment);

// Likes
router.put('/:id/like', protect, likePost);
router.put('/:id/unlike', protect, unlikePost);

module.exports = router;