const { createPost, getAllPosts, updatePost } = require('../src/modules/post/controller/post.controller');
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


/////////////////////////////////////////////////////////////

describe('getAllPosts', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { id: 'userId' },
      query: { page: '1', limit: '10' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should return 404 if user is not found', async () => {
    User.findById = jest.fn().mockResolvedValue(null);

    await getAllPosts(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 403 if user is not authorized', async () => {
    User.findById = jest.fn().mockResolvedValue({ roles: 'admin' });

    await getAllPosts(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: Only users can view posts' });
  });

  it('should return 200 and paginated posts if successful', async () => {
    const mockUser = { roles: 'user' };
    const mockPosts = [
      { _id: 'postId1', title: 'Post 1', author: { firstName: 'John', lastName: 'Doe' } },
      { _id: 'postId2', title: 'Post 2', author: { firstName: 'Jane', lastName: 'Doe' } }
    ];

    User.findById = jest.fn().mockResolvedValue(mockUser);
    Post.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockPosts)
    });
    Post.countDocuments = jest.fn().mockResolvedValue(2);

    await getAllPosts(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Posts retrieved successfully',
      currentPage: 1,
      totalPages: 1,
      totalPosts: 2,
      posts: mockPosts
    });
  });

  it('should call next with an error if an exception occurs', async () => {
    const error = new Error('Something went wrong');
    User.findById = jest.fn().mockRejectedValue(error);

    await getAllPosts(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

////////////////////////////////////////////////

describe('updatePost', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { id: 'userId' },
      params: { postId: 'postId' },
      body: { title: 'Updated Title', content: 'Updated Content' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should return 404 if user is not found', async () => {
    User.findById = jest.fn().mockResolvedValue(null);

    await updatePost(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 403 if user role is not "user"', async () => {
    User.findById = jest.fn().mockResolvedValue({ roles: 'admin' });

    await updatePost(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unauthorized: Only users can update posts',
    });
  });

  it('should return 404 if post is not found', async () => {
    User.findById = jest.fn().mockResolvedValue({ roles: 'user' });
    Post.findById = jest.fn().mockResolvedValue(null);

    await updatePost(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post not found' });
  });

  it('should return 403 if user is not the author of the post', async () => {
    const mockUser = { _id: 'userId', roles: 'user' };
    const mockPost = { author: 'anotherUserId' };

    User.findById = jest.fn().mockResolvedValue(mockUser);
    Post.findById = jest.fn().mockResolvedValue(mockPost);

    await updatePost(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unauthorized: Only the author can update the post',
    });
  });

  it('should return 200 and the updated post if successful', async () => {
    const mockUser = { _id: 'userId', roles: 'user' };
    const mockPost = {
      author: 'userId',
      title: 'Old Title',
      content: 'Old Content',
      save: jest.fn().mockResolvedValue(true),
    };

    User.findById = jest.fn().mockResolvedValue(mockUser);
    Post.findById = jest.fn().mockResolvedValue(mockPost);

    await updatePost(req, res, next);

    expect(mockPost.title).toBe('Updated Title');
    expect(mockPost.content).toBe('Updated Content');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Post updated successfully',
      post: mockPost,
    });
  });

  it('should call next with an error if an exception occurs', async () => {
    const error = new Error('Something went wrong');
    User.findById = jest.fn().mockRejectedValue(error);

    await updatePost(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});