const {
  getAllUser,
  getAllUsersWithFriendStatus,
} = require("../controllers/userControllers");

const router = require("express").Router();

router.get("/allusers", getAllUser);
router.get("/allusers_excl", getAllUsersWithFriendStatus);

module.exports = router;
