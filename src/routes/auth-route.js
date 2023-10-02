const express = require("express");
const router = express.Router();
const authController = require("../controller/auth-controller");
const authenticateMiddleware = require('../middleware/authenticate')

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get('/me',authenticateMiddleware,authController.getMe)
module.exports = router;
