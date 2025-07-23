const Post = require('../models/Post');
const path = require('path');
const fs = require('fs');

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;
    
    const post = await Post.create(req.body);
    
    res.status(201).json({
      success: true,
      data: post
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res, next) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };
    
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
    
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Finding resource
    let query = Post.find(JSON.parse(queryStr))
      .populate('user', 'name avatar')
      .populate('category', 'name');
    
    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Post.countDocuments(JSON.parse(queryStr));
    
    query = query.skip(startIndex).limit(limit);
    
    // Executing query
    const posts = await query;
    
    // Pagination result
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: posts.length,
      pagination,
      data: posts
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name avatar bio')
      .populate('category', 'name')
      .populate('comments.user', 'name avatar');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Make sure user is post owner or admin
    if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }
    
    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Make sure user is post owner or admin
    if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }
    
    // Delete image if it exists
    if (post.image && post.image !== 'default-post.jpg') {
      const imagePath = path.join(__dirname, '../../uploads', post.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await post.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload post image
// @route   PUT /api/posts/:id/image
// @access  Private
exports.uploadPostImage = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Make sure user is post owner or admin
    if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }
    
    if (!req.files) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }
    
    const file = req.files.file;
    
    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }
    
    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD || file.size > 1000000) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image less than 1MB'
      });
    }
    
    // Create custom filename
    file.name = `post_${post._id}${path.parse(file.name).ext}`;
    
    // Delete old image if it exists
    if (post.image && post.image !== 'default-post.jpg') {
      const imagePath = path.join(__dirname, '../../uploads', post.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Upload file
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: 'Problem with file upload'
        });
      }
      
      await Post.findByIdAndUpdate(req.params.id, { image: file.name });
      
      res.status(200).json({
        success: true,
        data: file.name
      });
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    const comment = {
      text: req.body.text,
      user: req.user.id
    };
    
    post.comments.unshift(comment);
    
    await post.save();
    
    // Populate the newly added comment with user details
    await post.populate('comments[0].user', 'name avatar');
    
    res.status(200).json({
      success: true,
      data: post.comments[0]
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove comment from post
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private
exports.removeComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Get comment
    const comment = post.comments.find(
      comment => comment._id.toString() === req.params.commentId
    );
    
    // Check if comment exists
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Check if user is comment owner or admin
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }
    
    // Get remove index
    const removeIndex = post.comments
      .map(comment => comment._id.toString())
      .indexOf(req.params.commentId);
    
    post.comments.splice(removeIndex, 1);
    
    await post.save();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Like a post
// @route   PUT /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if the post has already been liked by the user
    if (post.likes.some(like => like.toString() === req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Post already liked'
      });
    }
    
    post.likes.unshift(req.user.id);
    
    await post.save();
    
    res.status(200).json({
      success: true,
      data: post.likes
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Unlike a post
// @route   PUT /api/posts/:id/unlike
// @access  Private
exports.unlikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if the post has not yet been liked by the user
    if (!post.likes.some(like => like.toString() === req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Post has not yet been liked'
      });
    }
    
    // Get remove index
    const removeIndex = post.likes
      .map(like => like.toString())
      .indexOf(req.user.id);
    
    post.likes.splice(removeIndex, 1);
    
    await post.save();
    
    res.status(200).json({
      success: true,
      data: post.likes
    });
  } catch (err) {
    next(err);
  }
};