const mongoose = require("mongoose");

const blacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "token is required"],
    },
  },
  {
    timestamps: true,
  }
);

const tokenblacklistModal = mongoose.model("tokenblacklist", blacklistSchema);

module.exports = tokenblacklistModal;
