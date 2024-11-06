const GroupMessage = require("../models/groupMessageModel");
const User = require("../models/userModel");
const upload = require("../middlewres/filesOperation");
const File = require("../models/fileModel");

exports.getPrevGroupMessage = async (req, res) => {
  try {
    let msgs = await GroupMessage.findAll({
      where: { groupId: req.params.groupId },
      include: [
        {
          model: User,
          attributes: ["id", "username"], // Specify attributes to include from User model
        },
        {
          model: File,
          as: "associatedGroupMessage",
          attributes: ["key", "fileName", "fileUrl"],
          required: false,
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      order: [["createdAt", "DESC"]],
      limit: 10,
    });
    for (const msg of msgs) {
      if (msg.associatedGroupMessage) {
        try {
          const fileUrl = await upload.generatePresignedUrl(
            msg.associatedGroupMessage.key
          );
          msg.associatedGroupMessage.dataValues = {
            name: msg.associatedGroupMessage.fileName,
            url: fileUrl,
          };
        } catch (error) {
          return res
            .status(500)
            .json({ error: `Internal Server Error:${error}` });
        }
      }
    }

    return res.json({ msgs: msgs.reverse() });
  } catch (e) {
    return res.status(500).json({ error: `Internal Server Error: ${e}` });
  }
};

exports.postGroupMessage = async ({ groupId, userId, content }) => {
  try {
    const msg = await GroupMessage.create({
      groupId: groupId,
      userId: userId,
      message: content,
    });
    return { success: true, msg: msg };
  } catch (e) {
    return { sucess: false, error: `${e} Internal Server Error` };
  }
};
