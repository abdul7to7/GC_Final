const Friend = require("../models/friendModel");
const Sequelize = require("sequelize");
const User = require("../models/userModel");
const { Op } = require("sequelize");

exports.getSendRequest = async (req, res, next) => {
  try {
    const request = await Friend.findOne({
      where: { userId: req.user.id, friendId: req.params.friendId },
    });
    if (request) {
      if (request.status == "pending") {
        return res.json({
          success: false,
          message: "already sent request",
        });
      } else if (request.status == "accepted") {
        return res.json({
          success: false,
          message: "already friends",
        });
      } else if (request.status == "requested") {
        return res.json({
          success: false,
          message: "need to accept",
        });
      }
    }
    await Friend.bulkCreate([
      {
        userId: req.user.id,
        friendId: req.params.friendId,
        status: "requested",
        requestedBy: req.user.id,
      },
      {
        userId: req.params.friendId,
        friendId: req.user.id,
        requestedBy: req.user.id,
        status: "pending",
      },
    ]);
    return res.json({ success: true });
  } catch (e) {
    return res.json({ success: false, message: `something went wrong:${e}` });
  }
};

exports.getAcceptRequest = async (req, res, next) => {
  try {
    const request = await Friend.findOne({
      where: {
        userId: req.user.id,
        friendId: req.params.friendId,
      },
    });
    if (request.status != "pending") {
      return res.json({
        success: false,
        message: "not requested to be friend",
      });
    }
    await Friend.update(
      {
        status: "accepted",
        isFriends: true,
      },
      {
        where: {
          [Op.or]: [
            {
              userId: req.params.friendId,
              friendId: req.user.id,
              requestedBy: req.params.friendId,
            },
            {
              userId: req.user.id,
              friendId: req.params.friendId,
              requestedBy: req.params.friendId,
            },
          ],
        },
      }
    );
    res.json({ success: true });
  } catch (e) {
    return res.json({ success: false, message: `something went wrong:${e}` });
  }
};

exports.getAllFriends = async (req, res, next) => {
  try {
    const friends = await Friend.findAll({
      where: {
        isFriends: true,
        userId: req.user.id,
      },
      include: [
        {
          model: User,
          as: "friendDetails",
          attributes: ["username", "mail"],
        },
      ],
      attributes: ["friendId"],
    });

    return res.json({ friends });
  } catch (e) {
    return res.json({ success: false, message: `something went wrong:${e}` });
  }
};

exports.getUnfriend = async (req, res, next) => {
  try {
    const friend = await Friend.destroy({
      where: {
        [Sequelize.Op.or]: [
          { userId: req.user.id, friendId: req.params.friendId },
          { userId: req.params.friendId, friendId: req.user.id },
        ],
        isFriends: true,
      },
    });
    if (!friend) {
      return res.json({ success: false, message: "something went wrong" });
    }
    return res.json({ success: true });
  } catch (e) {
    return res.json({ success: false, message: `something went wrong:${e}` });
  }
};
