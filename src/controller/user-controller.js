const createError = require("../utils/create-error");
const { upload } = require("../utils/cloudinary-service");
const prisma = require("../models/prisma");
const fs = require("fs/promises");
const { checkUserIdSchema } = require("../validators/user-validator");

exports.updateProfile = async (req, res, next) => {
  try {
    if (!req.files) {
      return next(createError("Profile image or Cover image is required"));
    }
    const response = { profileImg: "", coverImg: "" };
    if (req.files.profileImage) {
      const url = await upload(req.files.profileImage[0].path);
      response.profileImg = url;
      const result = await prisma.user.update({
        data: {
          profileImg: url,
        },
        where: {
          id: req.user.id,
        },
      });
      delete response.coverImg
    return res.json(response);
    }
    if (req.files.coverImage) {
      const url = await upload(req.files.coverImage[0].path);
      response.coverImg = url;
      const result = await prisma.user.update({
        data: {
          coverImg: url,
        },
        where: {
          id: req.user.id,
        },
      });
      console.log(result);
      console.log(url);
    }
    delete response.profileImg
    return res.json(response);
  } catch (error) {
    next(error);
  } finally {
    if (req.files.profileImage) {
      fs.unlink(req.files.profileImage[0].path);
    }
    if (req.files.coverImage) {
      fs.unlink(req.files.coverImage[0].path);
    }
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { error } = checkUserIdSchema.validate(req.params);
    if (error) {
      return next(error);
    }
    const userId = +req.params.userId;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (user) {
      delete user.password;
      return res.status(200).json({ user });
    }
    return res.status(200).json({ user });
    // return res.status(404).json({message : "user not found"})
  } catch (error) {
    next(error);
  }
};
