const { checkPostIdSchema } = require("../validators/post-validator");
const prisma = require("../models/prisma");
const createError = require("../utils/create-error");

exports.togglelike = async (req, res, next) => {
  try {
    const { value, error } = checkPostIdSchema.validate(req.params);
    if (error) {
      next(error);
    }

    const existPost = await prisma.post.findUnique({
      where: {
        id: value.postId,
      },
    });
    if (!existPost) {
      return next(createError("Post not  found", 400));
    }
    const existLike = await prisma.like.findFirst({
      where: {
        userId: req.user.id,
        postId: value.postId,
      },
    });
    console.log(existLike);
    if (existLike) {
      await prisma.like.delete({
        where: {
          id: existLike.id,
        },
      });
      await prisma.post.update({
        data: {
          totalLike: {
            decrement: 1,
          },
        },
        where: {
          id: value.postId,
        },
      });
      return res.json({ message: false });
    }
    await prisma.like.create({
      data: {
        userId: req.user.id,
        postId: value.postId,
      },
    });
    await prisma.post.update({
      data: {
        totalLike: {
          increment: 1,
        },
      },
      where: {
        id: value.postId,
      },
    });
   res.json({ message: true });
  } catch (error) {
    next(error);
  }
};
