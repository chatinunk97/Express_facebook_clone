const { rateLimit } = require("express-rate-limit");

module.exports = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  message: {message :"Too many requests from this IP"},
});
