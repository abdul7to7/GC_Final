const Message = require("../models/messageModel");
const User = require("../models/userModel");
const { getBatchDownloadUrls } = require("./fileControllers");

exports.getChat = async (req, res, next) => {
  try {
    const userId1 = req.user.id;
    const userId2 = req.params.receiverId;
    const roomId = [userId1, userId2].sort().join("_");
    const msgs = await Message.findAll({
      where: {
        roomId: roomId,
      },

      order: [["createdAt", "DESC"]],
      limit: 15,
    });

    let fileKeys = [];
    for (let msg of msgs) {
      if (msg.dataValues.fileKey) {
        fileKeys.push(msg.dataValues.fileKey);
      }
    }

    const batch = await getBatchDownloadUrls(fileKeys);

    for (let msg of msgs) {
      const fileKey = msg.dataValues.fileKey;
      if (fileKey && batch[fileKey]) {
        msg.dataValues.url = batch[fileKey];
      }
    }
    return res.json({ msgs: msgs.reverse() });
  } catch (e) {
    return res.json({ success: false, message: `something went wrong:${e}` });
  }
};

exports.postChat = async ({
  roomId,
  userId,
  receiverId,
  content,
  isFile,
  fileKey,
}) => {
  try {
    const msg = await Message.create({
      message: content,
      userId,
      receiverId: receiverId,
      roomId,
      isFile,
      fileKey,
    });
    return { success: true, msg: msg };
  } catch (e) {
    return { success: false, message: `something went wrong:${e}` };
  }
};
