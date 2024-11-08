const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const generateToken = require("../middlewres/authGenerateToken");
const GroupMembers = require("../models/groupMembersModel");

exports.signup = async (req, res, next) => {
  try {
    const userExisted = await User.findOne({ where: { mail: req.body.mail } });
    if (userExisted) {
      return res
        .status(409)
        .json({ success: false, message: "user mail already exist" });
    }
    const hashed = await bcrypt.hash(req.body.password, 10);
    if (!hashed) {
      return res
        .status(500)
        .json({ success: false, message: `something went wrong` });
    }
    const user = await User.create({
      username: req.body.username,
      mail: req.body.mail,
      phoneno: req.body.phoneno,
      password: hashed,
    });
    const { password, updatedAt, createdAt, ...userDetails } = user.dataValues;
    if (user) {
      await GroupMembers.create({
        groupId: 1,
        userId: user.id,
        isAdmin: 0,
      });
      let token = await generateToken(userDetails);
      return res.status(201).json({
        success: true,
        message: "created successfully",
        token: token,
        username: userDetails.username,
        userId: userDetails.id,
      });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "something went wrong" });
    }
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: `something went wrong: ${e}` });
  }
};

exports.login = async (req, res, next) => {
  try {
    
    const hashed = await bcrypt.hash(req.body.password, 10);
    if (!hashed) {
      return res.status(500).json({ success: false, message: `something went wrong` });
    }
    const user = await User.findOne({ where: { mail: req.body.mail } });
    if (!user) {
      return res
        .status(403)
        .send({ success: "false", message: "invalid username or password" });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (isMatch) {
      const { password, updatedAt, createdAt, ...userDetails } =
        user.dataValues;
      const token = await generateToken(userDetails);
      return res.status(201).json({
        success: true,
        message: "login successfully",
        token: token,
        username: userDetails.username,
        userId: userDetails.id,
      });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "Credentials are not correct" });
    }
  } catch (e) {
    return res
      .status(401)
      .json({ success: false, message: `something went wrong: ${e}` });
  }
};
