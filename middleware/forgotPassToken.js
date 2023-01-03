const jwt = require("jsonwebtoken");

module.exports = (user) => {
  return jwt.sign(
    { userId: user.id },
    process.env.FORGOT_PASSWORD,
    {
      expiresIn: "15m",
    }
  );
};
