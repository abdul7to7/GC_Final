const { getChat, postChat } = require("../controllers/messageController");

const router = require("express").Router();

router.get("/chat/:receiverId", getChat);
// router.post("/send", postChat);

module.exports = router;
