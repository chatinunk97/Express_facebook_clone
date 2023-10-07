const createError = require("../utils/create-error");
const {
  checkReceiverIdSchema,
  checkRequesterIdSchema,
  checkFriendIdSchema,
} = require("../validators/user-validator");
const prisma = require("../models/prisma");
const { STATUS_PENDING, STATUS_ACCEPTED } = require("../config/constants");

exports.requestFriend = async (req, res, next) => {
  try {
    const { error, value } = checkReceiverIdSchema.validate(req.params);
    if (error) {
      return next(error);
    }
    if (value.receiverId === req.user.id) {
      return next(createError("cannot request to yourself", 400));
    }
    const targetUser = await prisma.user.findUnique({
      where: {
        id: value.receiverId,
      },
    });
    if (!targetUser) {
      return next(createError("user does not exist", 400));
    }

    const existRelationship = await prisma.friend.findFirst({
      where: {
        OR: [
          { requesterId: req.user.id, receiverId: value.receiverId },
          { requesterId: value.receiverId, receiverId: req.user.id },
        ],
      },
    });
    console.log(existRelationship);
    if (existRelationship) {
      return next(createError("user already has a relationship", 400));
    }
    await prisma.friend.create({
      data: {
        requesterId: req.user.id,
        receiverId: value.receiverId,
        status: STATUS_PENDING,
        // request : {connect : {id : 1 }},
        // receiver :{connect : {id : 2 }}
      },
    });

    res.status(201).json({ message: "Friend Request reached" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.acceptRequest = async (req, res, next) => {
  try {
    const { error, value } = checkRequesterIdSchema.validate(req.params);
    if (error) {
      return next(error);
    }
    const existRelationship = await prisma.friend.findFirst({
      where: {
        requesterId: value.requesterId,
        receiverId: req.user.id,
        status: STATUS_PENDING,
      },
    });

    if (!existRelationship) {
      return next(createError("there's no such relationship", 400));
    }
    await prisma.friend.update({
      data: {
        status: STATUS_ACCEPTED,
      },
      where: {
        id: existRelationship.id,
      },
    });

    res.status(200).json({ message: "friend accepted" });
  } catch (error) {
    next(error);
  }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const { value, error } = checkRequesterIdSchema.validate(req.params);
    if (error) {
      return next(error);
    }
    const existRelationship = await prisma.friend.findFirst({
      where: {
        receiverId: req.user.id,
        requesterId: value.requesterId,
        status: STATUS_PENDING,
      },
    });
    console.log(existRelationship);
    if (!existRelationship) {
      return next(createError("relationship doesnot exist", 400));
    }
    await prisma.friend.delete({
      where: {
        id: existRelationship.id,
      },
    });
    res.status(200).json({ message: "friend request rejected" });
  } catch (error) {
    next(error);
  }
};

exports.cancelRequest = async (req, res, next) => {
  try {
    const { value, error } = checkReceiverIdSchema.validate(req.params);
    if (error) {
      return next(error);
    }
    const existRelationship = await prisma.friend.findFirst({
      where: {
        requesterId: req.user.id,
        status: STATUS_PENDING,
      },
    });
    if (!existRelationship) {
      return next(createError("relationship does not exist", 400));
    }

    await prisma.friend.delete({
      where: {
        id: existRelationship.id,
      },
    });
    res.json({ message: "sucessfully cancel request" });
  } catch (error) {
    next(error);
  }
};

exports.unfriend = async (req, res, next) => {
  console.log(req.params) //1
  try {
    const { error, value } = checkFriendIdSchema.validate(req.params);
    if (error) {
      return next(error);
    }
    //{friendId : 1}

    const existRelationship = await prisma.friend.findFirst({
      where: {
        OR: [
          { requesterId: req.user.id, receiverId: value.friendId },
          { requesterId: value.friendId, receiverId: req.user.id },
        ],
        status: STATUS_ACCEPTED,
      },
    });

    if (!existRelationship) {
      return next(createError("relationship does not exist", 400));
    }

    await prisma.friend.delete({
      where: {
        id: existRelationship.id,
      },
    });
    res.json({ message: "unfriend successfully" });
  } catch (error) {
    next(error);
  }
};
