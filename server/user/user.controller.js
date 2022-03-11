const User = require("./user.model");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const config = require("../../config");
const {deleteFile} = require("../../util/deleteFile");
const jwt = require("jsonwebtoken");

//user registration
exports.store = async (req, res) => {
  try {
    if (req.body.name && req.body.userName && req.body.password) {
      const userNameExist = await User.exists({userName: req.body.userName});

      if (userNameExist)
        return res
          .status(200)
          .json({status: false, message: "UserName Already Exist!!"});

      const user = new User();
      user.name = req.body.name;
      user.userName = req.body.userName;
      user.password = bcrypt.hashSync(req.body.password, 10);
      user.balance = 100000;

      await user.save();

      const payload = {
        _id: user._id,
        name: user.name,
        userName: user.userName,
        balance: user.balance,
        image: user.image,
      };

      const token = jwt.sign(payload, config.JWT_SECRET);

      return res.status(200).json({status: true, message: "Success!!", token});
    } else {
      return res.status(200).json({status: false, message: "Invalid Detail!!"});
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({status: false, error: error.message || "Internal Server Error!!"});
  }
};

//user login
exports.login = async (req, res) => {
  try {
    if (req.body.userName && req.body.password) {
      const user = await User.findOne({userName: req.body.userName});
      if (!user) {
        return res.status(200).json({
          status: false,
          message: "Oops ! UserName doesn't exist",
        });
      }

      const isPasswordMatch = await bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!isPasswordMatch) {
        return res.status(200).json({
          status: false,
          message: "Oops ! Password doesn't match",
        });
      }

      const payload = {
        _id: user._id,
        name: user.name,
        userName: user.userName,
        balance: user.balance,
        image: user.image,
      };

      const token = jwt.sign(payload, config.JWT_SECRET);

      return res.status(200).json({status: true, message: "Success!!", token});
    } else {
      return res.status(400).json({status: false, message: "Invalid details!"});
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({status: false, error: error.message || "Internal Server Error!!"});
  }
};

//get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(200)
        .json({status: false, message: "User does not exist"});
    }
    return res.status(200).json({status: true, message: "success", user});
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({status: false, error: error.message || "Server Error"});
  }
};

//update user profile
exports.update = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(200)
        .json({status: false, message: "User doesn't exist!"});

    const userNameExist = await User.findOne({
      _id: {$ne: user._id},
      userName: req.body.userName,
    });

    if (userNameExist)
      return res
        .status(200)
        .json({status: false, message: "UserName Already Exist!!"});

    user.name = req.body.name;
    user.userName = req.body.userName;

    await user.save();

    return res.status(200).json({
      status: true,
      message: "Admin Updated Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({status: false, error: error.message || "Server Error"});
  }
};

//update user profile image
exports.updateImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      deleteFile(req.file);
      return res
        .status(200)
        .json({status: false, message: "User does not Exist!"});
    }

    if (req.file) {
      if (fs.existsSync(user.image)) {
        fs.unlinkSync(user.image);
      }
      user.image = req.file.path;
    }

    await user.save();

    return res.status(200).json({status: true, message: "Success!!", user});
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res
      .status(500)
      .json({status: false, error: error.message || "Server Error"});
  }
};

//update user password
exports.updatePassword = async (req, res) => {
  try {
    if (req.body.oldPass && req.body.newPass && req.body.confirmPass) {
      const user = await User.findById(req.user._id);

      if (user) {
        const validPassword = bcrypt.compareSync(
          req.body.oldPass,
          user.password
        );

        if (!validPassword)
          return res.status(200).json({
            status: false,
            message: "Oops ! Old Password doesn't match ",
          });

        if (req.body.newPass !== req.body.confirmPass) {
          return res.status(200).json({
            status: false,
            message: "Oops ! New Password and Confirm Password doesn't match",
          });
        }

        user.password = bcrypt.hashSync(req.body.newPass, 10);

        await user.save();

        return res.status(200).json({
          status: true,
          message: "Password changed Successfully",
        });
      }
    } else
      return res
        .status(200)
        .json({status: false, message: "Invalid details!!"});
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({status: false, error: error.message || "Internal Server Error!!"});
  }
};
