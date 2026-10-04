const jwt = require('jsonwebtoken');
const env = require('../config/env');

exports.signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
