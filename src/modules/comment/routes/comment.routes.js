const express = require("express");
const { auth } = require("../../../middleware/auth.middleware");
const commentController = require("../controller/comment.controller");
const router = express.Router();


router.use(auth);
router.post("/createcomment/:postId", commentController.createComment);
router.get("/viewcomment/:postId", commentController.getComments);
router.get("/viewcommentById/:commentId", commentController.getCommentById);
router.put("/updatecomment/:commentId", commentController.updateComment);
router.delete("/deletecomment/:commentId", commentController.deleteComment);


module.exports = router;