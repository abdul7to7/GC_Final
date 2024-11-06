const {
  getAllFriends,
  getSendRequest,
  getAcceptRequest,
  getUnfriend,
} = require("../controllers/friendController");

const router = require("express").Router();

router.get("/send_request/:friendId", getSendRequest);
router.get("/accept_request/:friendId", getAcceptRequest);
router.get("/unfriend/:friendId", getUnfriend);
router.get("/all", getAllFriends);

module.exports = router;
