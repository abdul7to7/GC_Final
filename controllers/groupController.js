const GroupMessage = require("../models/groupMessageModel");
const User = require("../models/userModel");
const Group = require("../models/groupModel");
const GroupMembers = require("../models/groupMembersModel");

exports.getAllGroup = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: {
        model: Group,
        attributes: ["id", "groupName"],
        through: { attributes: ["isAdmin"] },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.groups) {
      return res.json({ success: false, message: "something went wrong" });
    }
    const groups = user.groups; // Sequelize includes associated groups in the Groups property
    return res.json({ success: true, groups });
  } catch (error) {
    return res.status(500).json({ error: `Internal Server Error:${error}` });
  }
};

exports.postCreateGroup = async (req, res, next) => {
  try {
    const group = await Group.create({
      groupName: req.body.groupName,
    });
    const groupId = group.id;

    const groupAdmin = await GroupMembers.create({
      groupId: groupId,
      userId: req.user.id,
      isAdmin: true,
    });
    return res.json({ success: true });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: `${e} Internal Server Error` });
  }
};

exports.getDeleteGroup = async (req, res, next) => {
  try {
    if (req.params.groupId == 1) {
      return res.json({
        success: false,
        message: "access denied",
      });
    }
    const group = await Group.destroy({
      where: {
        id: req.params.groupId,
      },
    });
    return res.json({ success: true });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: `${e} Internal Server Error` });
  }
};

exports.postAddUserToGroup = async (req, res, next) => {
  try {
    if (req.params.groupId == 1) {
      return res.json({
        success: false,
        message: "access denied",
      });
    }
    const added = await GroupMembers.create({
      isAdmin: false,
      groupId: req.body.groupId,
      userId: req.body.userId,
    });
    return res.json({ success: true });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: `${e} Internal Server Error` });
  }
};

exports.getAllMembersOfAGroup = async (req, res, next) => {
  try {
    if (req.params.groupId == 1) {
      return res.json({
        success: false,
        message: "access denied",
      });
    }
    const users = await Group.findOne({
      where: {
        id: req.params.groupId,
      },
      include: {
        model: User,
        attributes: ["id", "username"],
        through: {
          attributes: ["isAdmin"],
        },
      },
    });
    return res.json({ success: true, users: users.users });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: `${e} Internal Server Error` });
  }
};

exports.removeMemberFromGroup = async (req, res, next) => {
  try {
    if (req.params.groupId == 1) {
      return res.json({
        success: false,
        message: "access denied",
      });
    }
    const group = await GroupMembers.findOne({
      where: {
        userId: req.params.userId,
        groupId: req.params.groupId,
      },
    });
    if (!group.isAdmin) {
      return res
        .status(400)
        .json({ success: false, message: `you are not admin` });
    }
    await GroupMembers.destroy({
      where: {
        userId: req.params.userId,
        groupId: req.params.groupId,
      },
    });
    return res.json({ success: true });
  } catch (e) {
    return res
      .status(500)
      .json({ success: true, message: `${e} Internal Server Error` });
  }
};

exports.leaveGroup = async (req, res, next) => {
  try {
    if (req.params.groupId == 1) {
      return res.json({
        success: false,
        message: "access denied",
      });
    }
    await GroupMembers.destroy({
      where: {
        userId: req.user.id,
        groupId: req.params.groupId,
      },
    });
    return res.json({ success: true });
  } catch (e) {
    return res
      .status(500)
      .json({ success: true, message: `${e} Internal Server Error` });
  }
};
