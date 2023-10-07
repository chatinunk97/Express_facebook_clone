const express = require("express");

const authenticateMiddleware = require("../middleware/authenticate");
const uploadMiddleware = require("../middleware/upload");
const postController = require("../controller/post-controllers");
const likeController = require('../controller/like-controller')
const router = express.Router();

router.post(
  "/",
  authenticateMiddleware,
  uploadMiddleware.single("image"),
  postController.createPost
);
router.get('/friend',authenticateMiddleware,postController.getAllPostIncludeFriendPost)
router.post('/:postId/like', authenticateMiddleware,likeController.togglelike)
module.exports = router;
