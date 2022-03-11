const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: String,
    userName: String,
    password: String,
    image: {type: String, default: null},
    balance: {type: Number, default: 0},
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("User", UserSchema);
