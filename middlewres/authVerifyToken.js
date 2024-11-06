const jwt = require("jsonwebtoken");
async function authenticate(req, res, next) {
  const token = req.headers.token;
  if (!token) return res.status(403).json({});
  await jwt.verify(token, "secret_key", (err, result) => {
    if (err) {
      return res
        .status(401)
        .json({ success: false, message: "credentails are not correct" });
    }
    req.user = result;
    next();
  });
}

module.exports = authenticate;
