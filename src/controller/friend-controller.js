const createError = require("../utils/create-error");
const { checkReceiverIdSchema } = require("../validators/user-validator");
const prisma = require("../models/prisma");
const {STATUS_PENDING} = require('../config/constants')

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
    console.log(existRelationship)
    if(existRelationship){
        return next(createError("user already has a relationship",400))
    }
    await prisma.friend.create({
        data : {
            status : STATUS_PENDING,
            // requesterId : req.user.id,
            // receiverdId : value.receiverId,
            request : {connect : {id : 1 }},
            receiver :{connect : {id : 2 }}
        }
    })
    res.status(201).json({ message: "Friend Request reached" });
  } catch (error) {
    console.log(error)
    next(error);
  }
};
