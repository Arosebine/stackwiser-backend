const mongoose = require("mongoose");


const postSchema = new mongoose.Schema({
    title: {
      type: String,
      required: [true, "title must be Provided"],
    },
    content: {
      type: String,
      required: [true, "content must be Provided"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "author must be Provided"],
    },
},
{
    timestamps: true
});

module.exports = mongoose.model("Post", postSchema);
