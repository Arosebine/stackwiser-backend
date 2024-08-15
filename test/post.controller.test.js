const { createPost } = require('../src/modules/post/controller/post.controller');
const User = require('../src/modules/user/model/user.model');
const Post = require('../src/modules/post/model/post.model');

// Mock the models
jest.mock('../src/modules/user/model/user.model');
jest.mock('../src/modules/post/model/post.model');

describe('createPost', () => {
  let req, res, next;

  beforeEach(() => {
    // Initialize mocks
    req = {
      user: { id: 'userId123' },
      body: { title: 'Test Post', content: 'This is a test post' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should create a post successfully if the user is found and has the "user" role', async () => {
    User.findById.mockResolvedValue({ _id: 'userId123', roles: 'user' });
    Post.create.mockResolvedValue({
      _id: 'postId123',
      title: 'Test Post',
      content: 'This is a test post',
      author: 'userId123',
    });

    await createPost(req, res, next);

    expect(User.findById).toHaveBeenCalledWith('userId123');
    expect(Post.create).toHaveBeenCalledWith({
      title: 'Test Post',
      content: 'This is a test post',
      author: 'userId123',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Post created successfully',
      post: {
        _id: 'postId123',
        title: 'Test Post',
        content: 'This is a test post',
        author: 'userId123',
      },
    });
  });

  it('should return 404 if the user is not found', async () => {
    User.findById.mockResolvedValue(null);

    await createPost(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 403 if the user does not have the "user" role', async () => {
    User.findById.mockResolvedValue({ _id: 'userId123', roles: 'admin' });

    await createPost(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unauthorized: Only users can create a post',
    });
  });

  it('should return 400 if title or content is missing', async () => {
    req.body.title = 'Test Post';
    req.body.title = '';

    await createPost(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unauthorized: Only users can create a post',
    });
  });

  it('should call next(error) if an error occurs', async () => {
    const mockError = new Error('Something went wrong');
    User.findById.mockRejectedValue(mockError);

    await createPost(req, res, next);

    expect(next).toHaveBeenCalledWith(mockError);
  });
});
