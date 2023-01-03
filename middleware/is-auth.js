const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // headers are being set in indes.js on the client side!!!
  // and in there the access token is being taken from the redux store
  const authHeader = req.get("Authorization");
  console.log(req.headers);
  // const authHeader = req.headers.authorisation;

  console.log("authHeader");
  console.log(authHeader);

  // checking it there is in authorisation field in the incoming request
  if (!authHeader) {
    // request will travel through API, but with attached info that the user is not authorised
    req.isAuth = false;
    // exiting function but the request continues
    return next();
  }
  // signalling which type of authentication we are using
  const token = authHeader.split(" ")[1]; // [[Authorization]]: Bearer faksldfasdf[tokenvalue]
  if (!token || token === "") {
    req.isAuth = false;
    return next();
  }
  let decodedToken;
  try {
    // decodedToken = jwt.verify(token, 'somesupersecretkey');
    decodedToken = jwt.verify(token, process.env.ACCESS);
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  req.isAuth = true;
  req.userId = decodedToken.userId;
  console.log(req.isAuth);

  next();
};
