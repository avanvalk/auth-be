require('dotenv').config();
require('../../lib/utils/connect')();
const mongoose = require('mongoose');
const { Types } = require('mongoose');
const User = require('../../lib/models/User');
const { tokenize, untokenize } = require('../../lib/utils/token');

describe('User model', () => {
  beforeEach(done => {
    mongoose.connection.dropDatabase(done);
  });

  it('validates a good model', () => {
    const user = new User({ email: 'test@test.com' });
    expect(user.toJSON()).toEqual({ email: 'test@test.com', _id: expect.any(Types.ObjectId) });
  });

  it('has a required email', () => {
    const user = new User({});
    const errors = user.validateSync().errors;
    expect(errors.email.message).toEqual('Email required');
  });

  it('stores a _tempPassword', () => {
    const user = new User({
      email: 'test@test.com',
      password: 'password'
    });
    expect(user._tempPassword).toEqual('password');
  });

  it('has a passwordHash', () => {
    return User.create({
      email: 'test@test.com',
      password: 'password'
    })
      .then(user => {
        expect(user.passwordHash).toEqual(expect.any(String));
        expect(user.password).toBeUndefined();
      });
  });
  it('can find a user by token', () => {
    return User.create({
      email: 'test@test.com',
      password: 'password'
    })
      .then(user => {
        const token = tokenize(user);
        return User.findByToken(token);
      })
      .then(userFromToken => {
        expect(userFromToken).toEqual({
          email: 'test@test.com',
          _id: expect.any(String)
        });
      });
  });
  it('can create an auth token', () => {
    return User.create({
      email: 'test@test.com',
      password: 'password'
    })
      .then(user => user.authToken())
      .then(token => untokenize(token))
      .then(token => {
        expect(token).toEqual({ _id: expect.any(String), email: 'test@test.com' });
      });
  });
});
