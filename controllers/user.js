const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Account = require('../models/account');

/**
 * Sing up user
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.signup = (req, res, next) => {
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  
  let user;
  bcrypt
    .hash(password, 12)
    .then(hashedPw => {
      const user = new User({
        email: email,
        password: hashedPw,
        name: name
      });
      
      return user.save();
    })
    .then(result => {
      user= result
      const account = new Account({
        totalBalance:0,
        user:result 
      });
      return account.save();
    })
    .then(result => {
      user.account = result;
      user.save();
      res.status(201).json({ message: 'User created!', userId: user._id });

    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};