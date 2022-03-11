const User = require("../user/user.model");
const jwt = require("jsonwebtoken");
const config = require("../../config");

module.exports = async (req, res, next) => {
  try {
    const Authorization = req.get("Authorization");
    if (!Authorization)
      return res
        .status(403)
        .json({status: false, message: "You are not Authorized"});

    const decodeToken = await jwt.verify(Authorization, config.JWT_SECRET);

    const user = await User.findById(decodeToken._id);
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({status: false, error});
  }
};
