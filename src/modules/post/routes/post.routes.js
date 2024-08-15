const express = require("express");
const { auth } = require("../../../middleware/auth.middleware");
const postController = require("../controller/post.controller");
const router = express.Router();


router.use(auth);
router.post("/createpost", postController.createPost);
router.get("/viewpost", postController.getAllPosts);
router.get("/viewpost/:postId", postController.getPostById);
router.put("/updatepost/:postId", postController.updatePost);
router.delete("/deletepost/:postId", postController.deletePost);
router.get("/searchpost", postController.searchPostByTitleAndContent);
router.get("/searchbyauthor", postController.searchByAuthor);

module.exports = router;


