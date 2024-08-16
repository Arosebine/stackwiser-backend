const Comment = require("../../../modules/comment/model/comment.model");
const Post = require("../../../modules/post/model/post.model");
const User = require("../../../modules/user/model/user.model");


exports.createComment = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if(user.roles !== "user") {
      return res.status(401).json({
        message: "Unauthorized, you cannot comment on this user's post",
      });
    }
    const { content } = req.body;
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }
    const comment = await Comment.create({
      content,
      author: user._id,
      postId: post._id,
    });
    return res.status(201).json({
      message: "Comment created successfully",
      comment: comment.content,
    });
  } catch (error) {
    next(error);
  }
};


exports.getComments = async (req, res, next) => {
    try {
      const { id } = req.user;
      const user = await User.findById(id);
      
      if (user.roles !== "user") {
        return res.status(401).json({
          message: "Unauthorized, you cannot view comments on this post",
        });
      }
  
      const { postId } = req.params;
      const post = await Post.findById(postId);
  
      if (!post) {
        return res.status(404).json({
          message: "Post not found",
        });
      }
  
      // Pagination
      const page = parseInt(req.query.page) || 1; 
      const limit = parseInt(req.query.limit) || 10; 
      const skip = (page - 1) * limit;
  
      const comments = await Comment.find({ postId })
        .populate("postId", "content")
        .populate("author", "firstName lastName")
        .skip(skip)
        .limit(limit);
  
      const totalComments = await Comment.countDocuments({ postId });
  
      return res.status(200).json({
        message: "Comments fetched successfully",
        comments,
        page,
        totalPages: Math.ceil(totalComments / limit),
        totalComments,
      });
    } catch (error) {
      next(error);
    }
  };


exports.getCommentById = async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id);
        if (user.roles !== "user") {
            return res.status(401).json({
                message: "Unauthorized, you cannot view this comment",
            });
        }
        const { commentId } = req.params;
        const comment = await Comment.findById(commentId)
        .populate("postId", "content")
        .populate("author", "firstName lastName");
        if (!comment) {
            return res.status(404).json({
                message: "Comment not found",
            });
        }
        return res.status(200).json({
            message: "Comment fetched successfully",
            comment,
        });
    }catch (error) {
        next(error);
    }
}


exports.updateComment = async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id);
        if (user.roles !== "user") {
            return res.status(401).json({
                message: "Unauthorized, you cannot update this comment",
            });
        }
        const { commentId } = req.params;
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                message: "Comment not found",
            });
        }
        if(comment.author.toString() !== user._id.toString()) {
            return res.status(401).json({
                message: "Unauthorized, only the author can update this comment",
            });
        }
        const { content } = req.body;
        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { content },
            { new: true }
        );
        return res.status(200).json({
            message: "Comment updated successfully",
            comment: updatedComment,
        });
    } catch (error) {
        next(error);
    }
}


exports.deleteComment = async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id);
        if (user.roles !== "user") {
            return res.status(401).json({
                message: "Unauthorized, only the author can delete this comment",
            });
        }
        const { commentId } = req.params;
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                message: "Comment not found",
            });
        }
        if(comment.author.toString() !== user._id.toString()) {
            return res.status(401).json({
                message: "Unauthorized, only the author can delete this comment",
            });
        }
        await Comment.findByIdAndDelete(commentId);
        return res.status(200).json({
            message: "Comment deleted successfully",
        });
    } catch (error) {
        next(error);
    }
}