const jwt = require("jsonwebtoken");

module.exports = (user) => {
  return jwt.sign(
    { userId: user.id },
    process.env.ACCESS,
    {
      expiresIn: "15m",
    }
  );
};
