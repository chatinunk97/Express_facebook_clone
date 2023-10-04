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

exports.createFriend = async (req, res, next) => {
  console.log(req.body);
  const receiverId = +req.body.receiverId;
  const requesterId = +req.user.id;
  if (receiverId === requesterId) {
    return next(createError("cannot request friend to yourself", 400));
  }

  const checkDuplicates = await prisma.friend.findMany({
    where: {
      OR: [
        {
          AND: [{ userId: requesterId }, { receiverId: receiverId }],
        },
        {
          AND: [{ userId: receiverId }, { receiverId: requesterId }],
        },
      ],
    },
  });
  if (checkDuplicates[0]) {
    return next(createError(`Friend Request already exist `, 400));
  }
  const result = await prisma.friend.create({
    data: {
      requesterId,
      receiverId,
      status: "PENDING",
      userId: requesterId,
    },
  });

  res.status(202).json({ message: "completed", result });
};

exports.deleteFriend = async (req, res, next) => {
  let requesterId = "";
  let receiverId = "";
  if (req.body.receiverId) {
    requesterId = req.user.id;
    receiverId = +req.body.receiverId;
  }
  if (req.body.requesterId) {
    requesterId = +req.body.requesterId;
    receiverId = req.user.id;
    console.log(requesterId, receiverId);
  }

  const searchFriendRequest = await prisma.friend.findMany({
    where: {
      AND: [{ requesterId }, { receiverId }],
    },
  });
  if (!searchFriendRequest[0]) {
    return next(createError("no friend request found", 404));
  }
  const deleteTarget = searchFriendRequest[0].id;
  const result = await prisma.friend.delete({ where: { id: deleteTarget } });

  res.json({ message: "DELETE DONE" });
};

exports.getFriend = async (req, res, next) => {
  try {
    const friendId = +req.query.friendId;
    const userId = req.user.id;
    if (friendId === userId) {
      res.json({ message: "same user" });
    }
    const result = await prisma.friend.findMany({
      where: {
        OR: [
          {
            AND: [{ userId: userId }, { receiverId: friendId }],
          },
          {
            AND: [{ userId: friendId }, { receiverId: userId }],
          },
        ],
      },
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.pathFriend = async (req, res, next) => {
  try {
    const status = req.body.status;
    const requesterId = +req.body.requesterId;
    const receiverId = req.user.id;

    const [result] = await prisma.friend.findMany({
      where: {
        AND: [{ requesterId }, { receiverId }],
      },
    });
    const updateId = result?.id;
    if (!updateId) {
      return next(createError("friend request not found"));
    }

    const updateResult = await prisma.friend.update({
      data: {
        status,
      },
      where: {
        id: updateId,
      },
    });

    res.json(updateResult);
  } catch (error) {}
};

exports.unfriend = async (req, res, next) => {
  const requesterId = req.user.id;
  const receiverId = +req.body.receiverId;

  const searchFriendRequest = await prisma.friend.findMany({
    where: {
      OR: [
        {
          AND: [{ userId: requesterId }, { receiverId: receiverId }],
        },
        {
          AND: [{ userId: receiverId }, { receiverId: requesterId }],
        },
      ],
    },
  });
  if (!searchFriendRequest[0]) {
    return next(createError("no friend request found", 404));
  }
  const deleteTarget = searchFriendRequest[0].id;
  const result = await prisma.friend.delete({ where: { id: deleteTarget } });

  res.json({ message: "DELETE DONE" });
};
