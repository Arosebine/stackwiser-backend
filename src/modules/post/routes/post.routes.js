const express = require("express");
const { auth } = require("../../../middleware/auth.middleware");
const postController = require("../controller/post.controller");
const router = express.Router();


router.use(auth);
router.post("/createPost", postController.createPost);
router.get("/viewPost", postController.getAllPosts);
router.get("/viewPost/:postId", postController.getPostById);
router.put("/updatePost/:postId", postController.updatePost);
router.delete("/deletePost/:postId", postController.deletePost);
router.get("/searchPost", postController.searchPostByTitleAndContent);
router.get("/searchByAuthor", postController.searchByAuthor);

module.exports = router;


