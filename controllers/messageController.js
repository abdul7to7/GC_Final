const File = require("../models/fileModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const upload = require("../middlewres/filesOperation");

exports.getChat = async (req, res, next) => {
  try {
    const userId1 = req.user.id;
    const userId2 = req.params.receiverId;
    const roomId = [userId1, userId2].sort().join("_");
    const msgs = await Message.findAll({
      where: {
        roomId: roomId,
      },
      include: [
        {
          model: File,
          as: "associatedMessage",
          attributes: ["key", "fileName", "fileUrl"],
          required: false,
        },
        {
          model: User,
          attributes: ["username"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });
    for (const msg of msgs) {
      if (msg.associatedMessage) {
        try {
          const fileUrl = await upload.generatePresignedUrl(
            msg.associatedMessage.key
          );
          msg.associatedMessage.dataValues = {
            name: msg.associatedMessage.fileName,
            url: fileUrl,
          };
        } catch (error) {
          return res.json({
            success: false,
            message: `something went wrong:${e}`,
          });
        }
      }
    }
    return res.json({ msgs: msgs.reverse() });
  } catch (e) {
    return res.json({ success: false, message: `something went wrong:${e}` });
  }

  //   console.log(typeof recvId);
  //   console.log(typeof req.user.id);
};

exports.postChat = async ({ roomId, userId, receiverId, content }) => {
  try {
    const msg = await Message.create({
      message: content,
      userId,
      receiverId: receiverId,
      roomId,
    });
    return { success: true, msg: msg };
  } catch (e) {
    return { success: false, message: `something went wrong:${e}` };
  }
};
