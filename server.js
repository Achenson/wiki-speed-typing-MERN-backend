const express = require("express");
const graphqlHttp = require("express-graphql");

const { ApolloServer } = require("apollo-server-express");
const schema = require("./schema/schema");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const jwt = require("jsonwebtoken");
const User = require("./mongoModels/user");
const createAccessToken = require("./middleware/accessToken");
const createRefreshToken = require("./middleware/refreshToken");
const sendRefreshToken = require("./middleware/sendRefreshToken.js");

// UNCOMMENT for testing!!!
// const sendEmail = require("./utils/sendEmail.js");

// const bodyParser = require("body-parser");

const app = express();
// 1 step Heroku
const PORT = process.env.PORT || 4000;

app.use(helmet());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:4000",
      "http://localhost:5000",
    ],
    credentials: true,
  })
);

// 2(3) step heroku
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

/* app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
}); */

const isAuth = require("./middleware/is-auth");

// body parser unnecessary? [uninstalled], express-graphql can parse request according to its body type
// app.use(bodyParser.json());

app.use(isAuth);

/* app.use(
  "/graphql",
  graphqlHttp({
    schema,
    graphiql: true,
  })
);
 */

// app.use(cookieParser());
//  parsing cookie only in the context of that particular route
app.use("/refresh_token", cookieParser());

app.post("/refresh_token", async (req, res) => {
  // 1. testing sending test cookie in request using postman
  // cookies -> add domain: localhost -> coookie name: jid
  // console.log(req.headers);

  // testing sending cookie after cookie-parser is applied
  console.log(req.cookies);

  const token = req.cookies.jid;

  if (!token) {
    return res.send({ ok: false, accessToken: "" });
  }

  let payload = null;

  try {
    // payload = jwt.verify(token, "secretKeyForRefreshToken");
    payload = jwt.verify(token, process.env.REFRESH);
  } catch (err) {
    console.log(err);
    console.log("refresh token erorr2");
    return res.send({ ok: false, accessToken: "" });
  }

  // token is valid
  // we can send access token
  const user = await User.findById(payload.userId);

  if (!user) {
    console.log("refresh token erorr3");
    return res.send({ ok: false, accessToken: "" });
  }

  // revoking tokens: tokenVersion == 0 when creating user
  // refreshTokens' tokenVersion == user.tokenVerssion
  // to invalidate user -> increment user's tokenVersion
  // when the user tries to refresh tokens(refreshing or after accessToken runs out),
  // his user.tokenVersion doesn't match the version from the refresh token in his cookies

  if (user.tokenVersion !== payload.tokenVersion) {
    console.log("invalid tokenVersion");

    return res.send({ ok: false, accessToken: "" });
  }

  sendRefreshToken(res, createRefreshToken(user));

  return res.send({
    ok: true,
    accessToken: createAccessToken(user),
    userId: payload.userId,
  });

  //  testing: send login mutation in graphql, get accessToken
  // testin2: take refresh cookie from res (sieć)
});

const apolloServer = new ApolloServer({
  schema: schema,
  playground: true,
  context: ({ req, res }) => ({ req, res }),
});

dotenv.config();

const MONGODB_CONNECTION_STRING = process.env.DB;

mongoose
  .connect(MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connection succesfull"))
  .catch((err) => console.log(err));

/* 
app.use('/graphql', graphqlHTTP( 
  {
    schema,
    // graphiql testing when we go to this address
    graphiql: true,
    context: ({ req, res }) => buildContext({ req, res }),
}));
 */

/* const server = new ApolloServer({
  schema,
  context: ({ req, res }) => buildContext({ req, res, User }),
  playground: {
    settings: {
      'request.credentials': 'same-origin',
    },
  },
}); */

// server.applyMiddleware({ app });

apolloServer.applyMiddleware({ app, cors: false });

// 3 step heroku -> scripts, so npm run build in the client run automatically on heroku
// script "heroku-postbuild" <- this exact name!
// scirpt "start" <- also for heroku

app.get("/", (req, res) => {
  res.status(200).send("Hello World!4");
});

app.listen(PORT, () => {
  console.log(`now listening for requests on port ${PORT}`);
  // UNCOMMENT FOR TESTING!!!
  // sendEmail();
});
