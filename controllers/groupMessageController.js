const GroupMessage = require("../models/groupMessageModel");
const User = require("../models/userModel");
const { getBatchDownloadUrls } = require("./fileControllers");

exports.getPrevGroupMessage = async (req, res) => {
  try {
    let msgs = await GroupMessage.findAll({
      where: { groupId: req.params.groupId },
      include: [
        {
          model: User,
          attributes: ["id", "username"], // Specify attributes to include from User model
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      order: [["createdAt", "DESC"]],
      limit: 15,
    });
    let fileKeys = [];
    for (let msg of msgs) {
      if (msg.dataValues.fileKey) {
        fileKeys.push(msg.dataValues.fileKey); // Collect fileKeys
      }
    }

    const batch = await getBatchDownloadUrls(fileKeys);

    for (let msg of msgs) {
      const fileKey = msg.dataValues.fileKey;
      if (fileKey && batch[fileKey]) {
        msg.dataValues.url = batch[fileKey]; // Assign the correct URL from batch
      }
    }
    return res.json({ msgs: msgs.reverse() });
  } catch (e) {
    return res.status(500).json({ error: `Internal Server Error: ${e}` });
  }
};

exports.postGroupMessage = async ({
  groupId,
  userId,
  content,
  isFile,
  fileKey,
}) => {
  try {
    const msg = await GroupMessage.create({
      groupId: groupId,
      userId: userId,
      message: content,
      isFile,
      fileKey,
    });

    return { success: true, msg: msg };
  } catch (e) {
    return { sucess: false, error: `${e} Internal Server Error` };
  }
};
