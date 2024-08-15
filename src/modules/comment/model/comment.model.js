const mongoose = require("mongoose");


const commentSchema = new mongoose.Schema({
    content: {
      type: String,
      required: [true, "content must be Provided"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "author must be Provided"],
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "post must be Provided"],
    },
},
{
    timestamps: true
});

module.exports = mongoose.model("Comment", commentSchema);