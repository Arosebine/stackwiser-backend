const express = require("express");
const limiter  = require("../../../middleware/ratelimit.middleware");
const { auth } = require("../../../middleware/auth.middleware");
const userController = require("../controller/user.controller");
const router = express.Router();

router.post("/signup", userController.signUp);
router.post("/login", limiter, userController.userLogin);
router.get("/verify-email/:token", userController.emailVerify );
router.post("/forgotpassword", userController.forgotPassword );
router.post("/resetpassword/:",  userController.resetPassword );

router.use(auth);
router.get("/viewprofile",  userController.viewUserProfile );



module.exports = router;
