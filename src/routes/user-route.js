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


router.get('/friend',authenticateMiddleware,userController.getFriend)
router.delete('/friend',authenticateMiddleware,userController.deleteFriend)
router.delete('/unfriend',authenticateMiddleware,userController.unfriend)
router.patch('/friend',authenticateMiddleware,userController.pathFriend)
router.get('/:userId',authenticateMiddleware,userController.getUserById)

router.post('/friend',authenticateMiddleware,userController.createFriend)
module.exports = router;
