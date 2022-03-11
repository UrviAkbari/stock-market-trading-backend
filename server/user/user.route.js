const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({
  storage,
});

const UserController = require("./user.controller");

const UserMiddleware = require("../middleware/user.middleware");

//get user profile
router.get("/profile", UserMiddleware, UserController.getProfile);

// create user
router.post("/", UserController.store);

//user login
router.post("/login", UserController.login);

//update user password
router.put("/", UserMiddleware, UserController.updatePassword);

//update user profile
router.patch("/", UserMiddleware, UserController.update);

//update user Profile Image
router.patch(
  "/updateImage",
  UserMiddleware,
  upload.single("image"),
  UserController.updateImage
);

module.exports = router;
