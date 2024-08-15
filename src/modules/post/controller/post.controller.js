const User = require("../../../modules/user/model/user.model");
const Post = require("../../../modules/post/model/post.model");


exports.createPost = async (req, res, next) => {
    try {
      const { id } = req.user;
      const user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (user.roles === 'user') {
        
        const { title, content } = req.body;  
        if (!title || !content) {
          return res.status(400).json({ message: 'Title and content are required' });
        }
  
        const post = await Post.create({
          title,
          content,
          author: user._id
        });
  
        return res.status(201).json({
          message: 'Post created successfully',
          post
        });
      } else {
        return res.status(403).json({
          message: 'Unauthorized: Only users can create a post'
        });
      }
    } catch (error) {
      next(error);
    }
  };


  exports.getAllPosts = async (req, res, next) => {
    try {
      const { id } = req.user;
      const user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (user.roles === 'user') {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
  
        // Fetch paginated posts
        const posts = await Post.find()
        .populate('author', 'firstName lastName')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }); // Sorting by creation date (most recent first)
  
        // Get total number of posts
        const totalPosts = await Post.countDocuments();
  
        return res.status(200).json({
          message: 'Posts retrieved successfully',
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
          totalPosts,
          posts,
        });
      } else {
        return res.status(403).json({
          message: 'Unauthorized: Only users can view posts',
        });
      }
    } catch (error) {
      next(error);
    }
  };
  

  exports.getPostById = async (req, res, next) => {
    try {
        const { id } = req.user;
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (user.roles === 'user') {
        const { postId } = req.params;
        const post = await Post.findById(postId)
        .populate('author', 'firstName lastName');
        if (!post) {
          return res.status(404).json({ message: 'Post not found' });
        }
        return res.status(200).json({
          message: 'Post retrieved successfully',
          post
        });
      } else {
        return res.status(403).json({
          message: 'Unauthorized: Only users can view posts',
        });
      }
    } catch (error) {
      next(error);
    }
  };

  exports.updatePost = async (req, res, next) => {
    try {
      const { id } = req.user;
      const user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (user.roles !== 'user') {
        return res.status(403).json({
          message: 'Unauthorized: Only users can update posts',
        });
      }
  
      const { postId } = req.params;
      const { title, content } = req.body;
      const post = await Post.findById(postId);
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      if (post.author.toString() !== user._id.toString()) {
        return res.status(403).json({
          message: 'Unauthorized: Only the author can update the post',
        });
      }
  
      // Update post details
      post.title = title || post.title;
      post.content = content || post.content;
      await post.save();
  
      return res.status(200).json({
        message: 'Post updated successfully',
        post,
      });
    } catch (error) {
      next(error);
    }
  };
  


  exports.deletePost = async (req, res, next) => {
    try {
      const { id } = req.user;
      const user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (user.roles !== 'user') {
        return res.status(403).json({
          message: 'Unauthorized: Only users can delete posts',
        });
      }
  
      const { postId } = req.params;
      const post = await Post.findById(postId);
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      if (post.author.toString() !== user._id.toString()) {
        return res.status(403).json({
          message: 'Unauthorized: Only the author can delete the post',
        });
      }
  
      await post.findByIdAndDelete(post._id);
  
      return res.status(200).json({
        message: 'Post deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
  

  exports.searchPostByTitleAndContent = async (req, res, next) => {
    try {
      const { id } = req.user;
      const user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (user.roles !== 'user') {
        return res.status(403).json({
          message: 'Unauthorized: Only users can search posts',
        });
      }
  
      const { title, content } = req.body;
  
      if (!title && !content) {
        return res.status(400).json({ message: 'Title or content must be provided for search' });
      }
  
      const searchCriteria = [];
      if (title) {
        searchCriteria.push({ title: new RegExp(title, "i") });
      }
      if (content) {
        searchCriteria.push({ content: new RegExp(content, "i") });
      }
  
      const posts = await Post.find({ $or: searchCriteria });
      if(!posts){
        return res.status(404).json({ message: 'No criteria found'})
      }
  
      return res.status(200).json({
        message: 'Posts retrieved successfully',
        posts,
      });
    } catch (error) {
      next(error);
    }
  };


  exports.searchByAuthor = async (req, res, next) => {
    try {
      const { id } = req.user;
      const user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (user.roles !== 'user') {
        return res.status(403).json({
          message: 'Unauthorized: Only users can search posts',
        });
      }
  
      const { firstName } = req.body;
      const { page = 1, limit = 10 } = req.query; 
  
      if (!firstName) {
        return res.status(400).json({ message: 'Author is required for search' });
      }
  
      const userAuthor = await User.find({ firstName: new RegExp(firstName, "i") });
  
      if (userAuthor.length === 0) {
        return res.status(404).json({ message: 'No users found with the specified author name' });
      }
  
      const authorIds = userAuthor.map(user => user._id);
  
      const posts = await Post.find({ authorIds })
        .populate('author', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
  
      const totalPosts = await Post.countDocuments({ authorIds });
  
      if (posts.length === 0) {
        return res.status(404).json({ message: 'No posts found for the specified author(s)' });
      }
  
      return res.status(200).json({
        message: 'Posts retrieved successfully',
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: parseInt(page),
        posts,
      });
    } catch (error) {
      next(error);
    }
  };
  
  