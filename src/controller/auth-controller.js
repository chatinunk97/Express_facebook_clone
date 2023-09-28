const { registerSchema } = require("../validators/auth-validator");
const bcrypt = require("bcryptjs");
const prisma = require("../models/prisma");
const jwt = require("jsonwebtoken");

exports.register = async (req, res, next) => {
  try {
    const { value, error } = registerSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    value.password = await bcrypt.hash(value.password, 12);
    const result = await prisma.user.create({ data: value });
    const payLoad = { userId: result.id };
    const accessToken = jwt.sign(
      payLoad,
      process.env.JWT_SECRET_KEY || "secretKeyDayo",
      { expiresIn: process.env.JWT_EXPIRE }
    );
    res.status(201).json({ accessToken});
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    res.json({ message: "Auth" });
  } catch (error) {
    next(error);
  }
};
