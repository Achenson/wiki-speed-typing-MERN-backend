const jwt = require("jsonwebtoken");

module.exports = (user) => {
  return jwt.sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    process.env.REFRESH,
    {
      expiresIn: "7d",
    }
  );
};
