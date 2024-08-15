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

describe('signUp function', () => {

    let req, res, next;
  
    beforeEach(() => {
      req = {
        body: {
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '12345678950',
          email: 'john.doe@example.com',
          password: 'Password1!',
        },
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
        message: 'Password must contain at least one capital letter and one number and special character',
      });
    });
  
    it('should return 400 if the user already exists', async () => {
      User.findOne.mockResolvedValueOnce({ email: 'john.doe@example.com' });
  
      await signUp(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User already exists',
      });
    });
  
    it('should return 400 if the phone number already exists', async () => {
      User.findOne.mockImplementation((query) => {
        if (query.email) return null; 
        if (query.phoneNumber) return { phoneNumber: '12345678950' }; 
      });
  
      await signUp(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Phone number already exists',
      });
    });
  
    it('should return 201 and create a new user successfully', async () => {
        User.findOne.mockImplementation((query) => {
          if (query.email) return null; 
          if (query.phoneNumber) return null;
        });
      
        bcrypt.genSalt.mockResolvedValueOnce('salt');
        bcrypt.hash.mockResolvedValueOnce('hashedPassword');
        User.create.mockResolvedValueOnce({ 
          _id: 'newUserId',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '1234567890',
          email: 'john.doe@example.com',
          password: 'hashedPassword',
        });
        crypto.randomBytes.mockReturnValueOnce(Buffer.from('randombytes'));
        Token.create.mockResolvedValueOnce({ token: 'randombytes', userId: 'newUserId', type: 'email' });
        sendEmail.mockResolvedValueOnce(true);
      
        await signUp(req, res, next);
      
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: 'User created',
          user: expect.objectContaining({
            _id: 'newUserId',
          }),
          token: expect.objectContaining({
            token: 'randombytes',
          }),
        });
      });
      
  
    it('should handle server errors', async () => {
      const error = new Error('Server Error');
      User.findOne.mockRejectedValueOnce(error);
  
      await signUp(req, res, next);
  
      expect(next).toHaveBeenCalledWith(error);
    });
  });


