const mongoose = require("mongoose");


const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["password", "otp", "email"],
    required: true,
  },
  expires: {
    type: Date,
    required: true,
    default: Date.now() + 5 * 60 * 1000,
  },
});

module.exports = mongoose.model("Token", tokenSchema);