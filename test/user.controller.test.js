const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../src/modules/user/model/user.model');
const Token = require('../src/modules/user/model/token.model');
const sendEmail = require('../src/service/sendEmail.services');
const { signUp, userLogin  } = require('../src/modules/user/controller/user.controller');

jest.mock('bcryptjs');
jest.mock('crypto');
jest.mock('jsonwebtoken');
jest.mock('../src/modules/user/model/user.model');
jest.mock('../src/modules/user/model/token.model');
jest.mock('../src/service/sendEmail.services');

describe('signUp', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        email: 'john@example.com',
        password: 'Password123!'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  it('should return 400 if the password does not meet criteria', async () => {
    req.body.password = 'password';

    await signUp(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Password must contain at least one capital letter and one number and special character'
    });
  });

  it('should return 400 if the email is already in use', async () => {
    User.findOne.mockResolvedValueOnce({ email: 'john@example.com' });

    await signUp(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User already exists'
    });
  });

  it('should return 400 if the phone number is already in use', async () => {
    User.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ phoneNumber: '1234567890' });

    await signUp(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Phone number already exists'
    });
  });

  it('should return 201 and create a new user successfully', async () => {
    bcrypt.genSalt.mockResolvedValueOnce('salt');
    bcrypt.hash.mockResolvedValueOnce('hashedPassword');
    User.findOne.mockResolvedValueOnce(null);
    User.findOne.mockResolvedValueOnce(null);
    User.create.mockResolvedValueOnce({
      _id: 'newUserId',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phoneNumber: '1234567890',
      password: 'hashedPassword',
      picture: 'pictureUrl'
    });

    crypto.randomBytes.mockReturnValueOnce(Buffer.from('randombytes'));
    Token.create.mockResolvedValueOnce({ token: 'randombytes' });

    await signUp(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User created',
      user: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        picture: 'pictureUrl'
      }
    });

    expect(sendEmail).toHaveBeenCalledWith({
      email: 'john@example.com',
      subject: 'Welcome to the app',
      message: expect.any(String),
    });
  });

  it('should call next with an error if something goes wrong', async () => {
    const error = new Error('Database Error');
    User.findOne.mockRejectedValueOnce(error);

    await signUp(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

