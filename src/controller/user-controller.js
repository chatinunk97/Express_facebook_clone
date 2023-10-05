const createError = require("../utils/create-error");
const { upload } = require("../utils/cloudinary-service");
const prisma = require("../models/prisma");
const fs = require("fs/promises");
const { checkUserIdSchema } = require("../validators/user-validator");
const {
  AUTH_USER,
  UNKNOWN,
  STATUS_ACCEPTED,
  FRIEND,
  REQUESTER,
  RECEIVER,
} = require("../config/constants");

const getTargetUserStatusWithAuthUser = async (targetUserId, authUserId) => {
  if (targetUserId === authUserId) {
    return AUTH_USER;
  }
  const relationship = await prisma.friend.findFirst({
    where: {
      OR: [
        { requesterId: targetUserId, receiverId: authUserId },
        { requesterId: authUserId, receiverId: targetUserId },
      ],
    },
  });
  if (!relationship) {
    return UNKNOWN;
  }
  if (relationship.status === STATUS_ACCEPTED) {
    return FRIEND;
  }
  if (relationship.requesterId === authUserId) {
    return REQUESTER;
  }
  return RECEIVER;
};

const getTargetUserFriend = async (targetUserId) => {
  try {
    const relationships = await prisma.friend.findMany({
      where: {
        OR: [{ requesterId: targetUserId }, { receiverId: targetUserId }],
        status: STATUS_ACCEPTED,
      },
      select: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            mobile: true,
            profileImg: true,
            coverImg: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            mobile: true,
            profileImg: true,
            coverImg: true,
          },
        },
      },
    });
    const friends = relationships.map((el) =>
      el.requester.id === targetUserId ? el.receiver : el.requester
    );
    return friends;
  } catch (error) {}
};

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
      delete response.coverImg;
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
    delete response.profileImg;
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
    let status = null;
    let friends = null;
    if (user) {
      delete user.password;
      status = await getTargetUserStatusWithAuthUser(userId, req.user.id);
      friends = await getTargetUserFriend(userId);
      // return res.status(200).json({ user });
    }

    return res
      .status(200)
      .json({ user, statusWithAuthUser: status, friends });
  } catch (error) {
    next(error);
  }
};
