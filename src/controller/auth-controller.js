const { registerSchema, loginSchema } = require("../validators/auth-validator");
const bcrypt = require("bcryptjs");
const prisma = require("../models/prisma");
const jwt = require("jsonwebtoken");
const createError = require("../utils/create-error");

exports.register = async (req, res, next) => {
  try {
    const { value, error } = registerSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    value.password = await bcrypt.hash(value.password, 12);
    const result = await prisma.user.create({ data: value });
    const payLoad = { userId: value.id };
    const accessToken = jwt.sign(
      payLoad,
      process.env.JWT_SECRET_KEY || "secretKeyDayo",
      { expiresIn: process.env.JWT_EXPIRE }
    );
    res.status(201).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { value, error } = loginSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: value.emailOrMobile }, { mobile: value.emailOrMobile }],
      },
    });
    if (!user) {
      return next(createError("Invalid Cridential", 400));
    }
    const isMatch = await bcrypt.compare(value.password, user.password);
    if (!isMatch) {
      return next(createError("Invalid Cridential", 400));
    }
    const payLoad = { userId: value.id };
    const accessToken = jwt.sign(
      payLoad,
      process.env.JWT_SECRET_KEY || "secretKeyDayo",
      { expiresIn: process.env.JWT_EXPIRE }
    );
    delete user.password
    res.status(200).json({ accessToken, user });
  } catch (error) {
    next(error);
  }
};
