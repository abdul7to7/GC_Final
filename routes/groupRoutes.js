const {
  getAllGroup,
  postCreateGroup,
  getDeleteGroup,
  postAddUserToGroup,
  getAllMembersOfAGroup,
  removeMemberFromGroup,
  leaveGroup,
} = require("../controllers/groupController");
const {
  getPrevGroupMessage,
} = require("../controllers/groupMessageController");

const router = require("express").Router();

router.get("/chat/:groupId", getPrevGroupMessage);
router.get("/all", getAllGroup);
router.post("/create_group", postCreateGroup);
router.get("/delete_group/:groupId", getDeleteGroup);
router.post("/add_to_group", postAddUserToGroup);
router.get("/get_members/:groupId", getAllMembersOfAGroup);
router.get("/remove_member/:groupId/:userId", removeMemberFromGroup);
router.get("/leave/:groupId", leaveGroup);

module.exports = router;
