const createError = require("../utils/create-error");
const { upload } = require("../utils/cloudinary-service");
const prisma = require("../models/prisma");
const fs = require("fs/promises");

exports.updateProfile = async (req, res, next) => {
  try {
    if (!req.files) {
      return next(createError("Profile image or Cover image is required"));
    }
    if (req.files.profileImage) {
      const url = await upload(req.files.profileImage[0].path);
      const result = await prisma.user.update({
        data: {
          profileImg: url,
        },
        where: {
          id: req.user.id,
        },
      });
    }
    if (req.files.coverImage) {
      const url = await upload(req.files.coverImage[0].path);
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
    res.json({ message: "updated profile successfully" });
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
