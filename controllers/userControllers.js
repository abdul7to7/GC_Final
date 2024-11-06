const { Sequelize } = require("sequelize");
const Friend = require("../models/friendModel");
const User = require("../models/userModel");

const { Op } = require("sequelize");

exports.getAllUsersWithFriendStatus = async (req, res, next) => {
  try {
    const currentUserId = req.user.id; // ID of the current logged-in user

    const users = await User.findAll({
      attributes: ["id", "username"], // Select the attributes you want to retrieve
      include: [
        {
          model: Friend,
          as: "userFriends",
          attributes: ["id", "status", "userId", "friendId"],
          required: false,
        },
      ],
    });
    const result = users
      .map((user) => {
        if (user.id == currentUserId) return;
        let isFriend = false;
        let status = "available";
        user.userFriends.map((friend) => {
          if (friend.friendId == currentUserId) {
            status = friend.status;
            if (status == "accepted") {
              isFriend = true;
            }
          }
        });
        for (let i = 0; i < user.userFriends.length; i++) {
          if (user.userFriends[i].friendId == currentUserId) {
            status = user.userFriends[i].status;
            if (status == "accepted") {
              isFriend = true;
            } else if (status == "pending") {
              status = "requested";
            } else if (status == "requested") {
              status = "pending";
            }
            break;
          }
        }
        return {
          id: user.id,
          username: user.username,
          isFriend: isFriend,
          status: status,
        };
      })
      .filter((user) => user !== undefined);
    return res.json({ success: true, users: result });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: `Internal Server Error:${error}` });
  }
};

exports.getAllUser = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username"],
    });

    return res.json({ users: users });
  } catch (e) {
    return res.json({ success: false, message: `something went wrong:${e}` });
  }
};
