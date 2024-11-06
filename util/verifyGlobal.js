const Group = require("../models/groupModel");

const verifyGlobal = async () => {
  const global = await Group.findOne({
    where: {
      id: 1,
      groupName: "global",
    },
  });
  if (!global) {
    await Group.create({
      id: 1,
      groupName: "global",
    });
  }
};

module.exports = verifyGlobal;
