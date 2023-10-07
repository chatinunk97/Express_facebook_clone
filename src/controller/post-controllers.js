const prisma = require("../models/prisma");
const createError = require("../utils/create-error");
const { upload } = require("../utils/cloudinary-service");
const fs = require("fs/promises");
const { STATUS_ACCEPTED } = require("../config/constants");

const getFriendIds = async (targetUserId) => {
  const relationship = await prisma.friend.findMany({
    where: {
      OR: [{ requesterId: targetUserId }, { receiverId: targetUserId }],
      status: STATUS_ACCEPTED,
    },
  });

  const friends = relationship.map((el) => {
    console.log(el);
    return el.requesterId === targetUserId ? el.receiverId : el.requesterId;
  });
  console.log(friends);
  return friends;
};

exports.createPost = async (req, res, next) => {
  try {
    const { message } = req.body;
    if ((!message || !message.trim()) && !req.file) {
      return next(createError("message or Image is required", 400));
    }
    const data = { userId: req.user.id };
    if (req.file) {
      data.image = await upload(req.file.path);
    }
    if (message) {
      data.message = message;
    }
    await prisma.post.create({
      data,
    });
    res.status(201).json({ message: "post created" });
  } catch (error) {
    next(error);
  } finally {
    if (req.file) {
      fs.unlink(req.file.path);
    }
  }
};
exports.getAllPostIncludeFriendPost = async (req, res, next) => {
  try {
    const friendIds = await getFriendIds(req.user.id);
    const post = await prisma.post.findMany({
      where: {
        userId: {
          in: [...friendIds, req.user.id],
        },
      },
      select: {
        id: true,
        message: true,
        image: true,
        createdAt: true,
        totalLike: true,

        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImg: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json({ post });
  } catch (error) {
    next(error);
  }
};
