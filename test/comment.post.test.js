const { createComment, getComments, updateComment } = require('../src/modules/comment/controller/comment.controller');
const User = require('../src/modules/user/model/user.model');
const Post = require('../src/modules/post/model/post.model');
const Comment = require('../src/modules/comment/model/comment.model');

jest.mock('../src/modules/user/model/user.model');
jest.mock('../src/modules/post/model/post.model');
jest.mock('../src/modules/comment/model/comment.model');

describe('createComment', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { id: 'userId' },
      body: { content: 'This is a comment' },
      params: { postId: 'postId' },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
    
    jest.clearAllMocks();
  });

  it('should return 401 if the user is not authorized to comment', async () => {
    User.findById.mockResolvedValueOnce({ _id: 'userId', roles: 'admin' }); 

    await createComment(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Unauthorized, you cannot comment on this user's post",
    });
  });

  it('should return 404 if the post is not found', async () => {
    User.findById.mockResolvedValueOnce({ _id: 'userId', roles: 'user' });
    Post.findById.mockResolvedValueOnce(null);

    await createComment(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Post not found",
    });
  });

  it('should return 201 and create a comment successfully', async () => {
    User.findById.mockResolvedValueOnce({ _id: 'userId', roles: 'user' });
    Post.findById.mockResolvedValueOnce({ _id: 'postId', title: 'Post Title' });
    Comment.create.mockResolvedValueOnce({
      content: 'This is a comment',
      author: 'userId',
      postId: 'postId',
    });

    await createComment(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Comment created successfully",
      comment: 'This is a comment',
    });
  });

  it('should call next with an error if something goes wrong', async () => {
    const error = new Error('Database Error');
    User.findById.mockRejectedValueOnce(error);

    await createComment(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

///////////////////////////////////////////////////////////////////////////////

describe('getComments', () => {
    let req, res, next;
  
    beforeEach(() => {
      req = {
        user: {
          id: 'userId',
        },
        params: {
          postId: 'postId',
        },
        query: {
          page: 1,
          limit: 10,
        },
      };
  
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      next = jest.fn();
  
      jest.clearAllMocks();
    });
  
    it('should return 401 if the user is not authorized', async () => {
      User.findById.mockResolvedValueOnce({ roles: 'admin' });
  
      await getComments(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized, you cannot view comments on this post',
      });
    });
  
    it('should return 404 if the post does not exist', async () => {
      User.findById.mockResolvedValueOnce({ roles: 'user' });
      Post.findById.mockResolvedValueOnce(null);
  
      await getComments(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post not found',
      });
    });
  
    it('should return 200 and the paginated comments if successful', async () => {
        const mockUser = { _id: 'userId', roles: 'user' };
        const mockPost = { _id: 'postId', title: 'Sample Post' };
        const mockComments = [
          { content: 'Comment 1', author: { firstName: 'John', lastName: 'Doe' }, postId: 'postId' },
          { content: 'Comment 2', author: { firstName: 'Jane', lastName: 'Doe' }, postId: 'postId' },
        ];
      
        User.findById.mockResolvedValue(mockUser);
        Post.findById.mockResolvedValue(mockPost);
        Comment.find.mockResolvedValue(mockComments);
        Comment.countDocuments.mockResolvedValue(mockComments.length);
      
        await getComments(req, res, next);
        
      });
      
  
    it('should handle errors and call next with the error', async () => {
      const error = new Error('Database error');
      User.findById.mockRejectedValueOnce(error);
  
      await getComments(req, res, next);
  
      expect(next).toHaveBeenCalledWith(error);
    });
  });


  ////////////////////////////////////////////////////////

  describe('updateComment', () => {
    let req, res, next;
  
    beforeEach(() => {
      req = {
        user: { id: 'userId' },
        params: { commentId: 'commentId' },
        body: { content: 'Updated Comment Content' },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });
  
    it('should return 401 if user role is not "user"', async () => {
      User.findById = jest.fn().mockResolvedValue({ roles: 'admin' });
  
      await updateComment(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Unauthorized, you cannot update this comment",
      });
    });
  
    it('should return 404 if comment is not found', async () => {
      User.findById = jest.fn().mockResolvedValue({ roles: 'user' });
      Comment.findById = jest.fn().mockResolvedValue(null);
  
      await updateComment(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Comment not found",
      });
    });
  
    it('should return 401 if user is not the author of the comment', async () => {
      const mockUser = { _id: 'userId', roles: 'user' };
      const mockComment = { author: 'anotherUserId' };
  
      User.findById = jest.fn().mockResolvedValue(mockUser);
      Comment.findById = jest.fn().mockResolvedValue(mockComment);
  
      await updateComment(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Unauthorized, only the author can update this comment",
      });
    });
  
    it('should return 200 and the updated comment if successful', async () => {
      const mockUser = { _id: 'userId', roles: 'user' };
      const mockComment = {
        author: 'userId',
        content: 'Original Comment Content',
        save: jest.fn(),
      };
  
      User.findById = jest.fn().mockResolvedValue(mockUser);
      Comment.findById = jest.fn().mockResolvedValue(mockComment);
      Comment.findByIdAndUpdate = jest.fn().mockResolvedValue({
        ...mockComment,
        content: 'Updated Comment Content',
      });
  
      await updateComment(req, res, next);
  
      expect(Comment.findByIdAndUpdate).toHaveBeenCalledWith(
        'commentId',
        { content: 'Updated Comment Content' },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Comment updated successfully",
        comment: {
          ...mockComment,
          content: 'Updated Comment Content',
        },
      });
    })

  })