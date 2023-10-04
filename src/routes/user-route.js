const express = require("express");
const router = express.Router();
const userController = require("../controller/user-controller");
const authenticateMiddleware = require("../middleware/authenticate");
const uploadMiddleware = require("../middleware/upload");

router.patch(
  "/",
  authenticateMiddleware,
  uploadMiddleware.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  userController.updateProfile
);

router.get('/:userId',authenticateMiddleware,userController.getUserById)
module.exports = router;
