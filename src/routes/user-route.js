const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const authenticateMiddleware = require("../middleware/authenticate");
const uploadMiddleware = require("../middleware/upload");

router.patch(
  "/",
  authenticateMiddleware,
  uploadMiddleware.single("qwerty"),
  userController.updateProfile
);

module.exports = router;
