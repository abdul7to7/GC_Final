const jwt = require("jsonwebtoken");
async function generateToken(user) {
  const token = await jwt.sign(user, "secret_key");
  return token;
}
module.exports = generateToken;
