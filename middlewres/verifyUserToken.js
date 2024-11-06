const jwt = require("jsonwebtoken");
async function verifyUserToken(token) {
  if (!token) return;
  return await jwt.verify(token, "secret_key", (err, result) => {
    if (err) {
      return {};
    }
    return result;
  });
}

module.exports = verifyUserToken;
