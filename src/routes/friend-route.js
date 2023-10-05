const express = require("express");
const router = express.Router();
const authenticateMiddleware = require("../middleware/authenticate");
const friendController = require("../controller/friend-controller");

router.post(
  "/:receiverId",
  authenticateMiddleware,
  friendController.requestFriend
);

module.exports = router;
