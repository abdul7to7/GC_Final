const {
  generateUploadUrl,
  confirmUpload,
} = require("../controllers/fileControllers");

const router = require("express").Router();

router.get("/getuploadurl", generateUploadUrl);
router.post("/confirm-upload", confirmUpload);
// router.post("/send", postChat);

module.exports = router;
