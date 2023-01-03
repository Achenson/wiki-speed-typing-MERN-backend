const graphql = require("graphql");

const User = require("../mongoModels/user");
const Score = require("../mongoModels/score");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createAccessToken = require("../middleware/accessToken.js");
const createRefreshToken = require("../middleware/refreshToken.js");
const createForgotPasswordToken = require("../middleware/forgotPassToken.js");
const sendRefreshToken = require("../middleware/sendRefreshToken.js");

const sendEmail = require("../utils/sendEmail.js");

const environment = process.env.NODE_ENV;

let passforgotUri;

if (environment === "production") {
  passforgotUri = "https://wikispeedtyping.herokuapp.com/#/passforgot-change/"
} else {
  passforgotUri = "http://localhost:3000/passforgot-change/";
}

const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLBoolean,
} = graphql;

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    tokenVersion: { type: GraphQLInt },
    score: {
      type: ScoreType,
      resolve(parent, args) {
        return Score.findOne({ userId: parent.id });
      },
    },
  }),
});

const ScoreType = new GraphQLObjectType({
  name: "Score",
  fields: () => ({
    id: { type: GraphQLID },
    five_s: { type: new GraphQLList(new GraphQLList(GraphQLFloat)) },
    one_min: { type: new GraphQLList(new GraphQLList(GraphQLFloat)) },
    two_min: { type: new GraphQLList(new GraphQLList(GraphQLFloat)) },
    five_min: { type: new GraphQLList(new GraphQLList(GraphQLFloat)) },
    ten_min: { type: new GraphQLList(new GraphQLList(GraphQLFloat)) },

    user: {
      type: UserType,
      resolve(parent, args) {
        return User.findById(parent.userId);
      },
    },
  }),
});

const AuthData = new GraphQLObjectType({
  name: "Auth",
  fields: () => ({
    userId: { type: GraphQLID },
    token: { type: GraphQLString },
    // tokenExpiration: { type: GraphQLInt },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType,
      args: { email: { type: GraphQLString } },
      resolve(parent, args, { req, res }) {
        return User.findOne({ email: args.email });
      },
    },
    userById: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args, { req, res }) {
        return User.findById(args.id);
      },
    },

    score: {
      type: ScoreType,
      // changed from id to userId
      args: { userId: { type: GraphQLID } },

      resolve(parent, args, { req, res }) {
        if (!req.isAuth) {
          console.log("not authenticated");
          // no throwing Error because it causes unhandled error rejection
          // so it is possible to check stats even if notAuth but that's fine
        } else {
          if (args.userId) {
            return Score.findOne({ userId: args.userId });
          }
          console.log("user not found");
          // error will be handled by useQuery in Stats
          throw new Error("user not found");
        }
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        let arrOfBooleans = await Promise.all([
          new Promise((resolve, reject) => {
            User.findOne({ name: args.name }, (err, res) => {
              if (err) console.log(err);

              if (res != null) {
                console.log("name is already present in DB");
                resolve(false);
              } else {
                resolve(true);
              }
            });
          }),

          new Promise((resolve, reject) => {
            User.findOne({ email: args.email }, (err, res) => {
              if (err) console.log(err);

              if (res != null) {
                console.log("email is already present in DB");
                resolve(false);
              } else {
                resolve(true);
              }
            });
          }),
        ]);

        return new Promise((resolve, reject) => {
          if (arrOfBooleans[0] && arrOfBooleans[1]) {
            // if user  with this name & email is not found

            bcrypt.hash(args.password, 12).then((hashedPassword) => {
              let user = new User({
                name: args.name,
                email: args.email,
                password: hashedPassword,
                tokenVersion: 0,
              });

              return user.save((err, product) => {
                if (err) console.log(err);

                console.log("product");
                console.log(product);

                let arrOfZeros = [
                  [0, 0],
                  [0, 0],
                  [0, 0],
                  [0, 0],
                  [0, 0],
                  [0, 0],
                  [0, 0],
                  [0, 0],
                  [0, 0],
                  [0, 0],
                ];

                let newScore = new Score({
                  userId: product.id,
                  five_s: arrOfZeros,
                  one_min: arrOfZeros,
                  two_min: arrOfZeros,
                  five_min: arrOfZeros,
                  ten_min: arrOfZeros,
                });

                newScore.save();

                resolve(product);
              });
            });
          } else {
            resolve(null);
          }
        });

        /*   BEFORE (only email check):
        let myPromise = new Promise((resolve, reject) => {
          User.findOne({ email: args.email }, (err, res) => {
            if (err) console.log(err);
            if (res === null) {
              bcrypt.hash(args.password, 12).then((hashedPassword) => {
                let user = new User({
                  name: args.name,
                  email: args.email,
                  password: hashedPassword,
                  tokenVersion: 0,
                });

                return user.save((err, product) => {
                  if (err) console.log(err);

                  let arrOfZeros = [
                    [0, 0],[0, 0],[0, 0],[0, 0],[0, 0],
                    [0, 0],[0, 0],[0, 0],[0, 0],[0, 0],
                  ];

                  let newScore = new Score({
                    userId: product.id, five_s: arrOfZeros,
                    ten_min: arrOfZeros, one_min: arrOfZeros,
                    two_min: arrOfZeros, five_min: arrOfZeros,
                  });

                  newScore.save();
                  resolve(product);
                });
              });
            } else {
              console.log("email already present in DB");
              resolve(null);
            }
          });
        });  
        return myPromise
        */
      },
    },

    changePassword: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        newPassword: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args, { req, res }) {
        if (!req.isAuth) {
          console.log("not authenticated");
          // email will never have @ so it can by used to check auth
          return { email: "not auth" };
        }

        const user = await User.findById(args.id);

        if (!user) {
          console.log("User not found");
          return null;
        }

        const isEqual = await bcrypt.compare(args.password, user.password);

        if (!isEqual) {
          console.log("incorrect password");
          return null;
        }

        let update;
        await bcrypt.hash(args.newPassword, 12).then((newHashedPassword) => {
          update = {
            password: newHashedPassword,
          };
        });

        return User.findByIdAndUpdate(user._id, update, {
          new: true,
          useFindAndModify: false,
        });
      },
    },

    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args, { req, res }) {
        if (!req.isAuth) {
          console.log("not authenticated");
          return { email: "not auth" };
        }

        const user = await User.findById(args.id);

        if (!user) {
          console.log("User not found");
          return null;
        }

        const isEqual = await bcrypt.compare(args.password, user.password);

        if (!isEqual) {
          console.log("incorrect password");
          return null;
        }

        return User.findByIdAndDelete(user._id);
      },
    },

    revokeRefreshTokensForUser: {
      type: UserType,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args, { req, res }) {
        return User.findOneAndUpdate(
          { _id: args.userId },
          { $inc: { tokenVersion: 1 } },
          { new: true },
          (err, response) => {
            if (err) {
              console.log(err);
            } else {
              console.log("response");
              console.log(response);
            }
          }
        );
      },
    },

    addScore: {
      type: ScoreType,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLString) },
        five_s: { type: new GraphQLList(new GraphQLList(GraphQLFloat)) },
        one_min: { type: new GraphQLList(new GraphQLList(GraphQLFloat)) },
        two_min: { type: new GraphQLList(new GraphQLList(GraphQLFloat)) },
        five_min: { type: new GraphQLList(new GraphQLList(GraphQLFloat)) },
        ten_min: { type: new GraphQLList(new GraphQLList(GraphQLFloat)) },
      },
      resolve(parent, args, { req, res }) {
        // not a new Score!!! to not overwrite id

        if (!req.isAuth) {
          // throw new Error("not authenticatedddd");
          console.log("not authenticated");
          return null;
        } else {
          console.log("authenticated");

          let update = {
            five_s: args.five_s,
            one_min: args.one_min,
            two_min: args.two_min,
            five_min: args.five_min,
            ten_min: args.ten_min,
          };

          return Score.findOneAndUpdate({ userId: args.userId }, update, {
            // to return updated object
            new: true,
            upsert: true, // Make this update into an upsert,
            useFindAndModify: false,
          });
        }
      },
    },

    login: {
      // type: UserType,
      type: AuthData,
      args: {
        email_or_name: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },

      async resolve(parent, { email_or_name, password }, { req, res }) {
        let credential;

        // checking is user entered email or name
        if (email_or_name.indexOf("@") === -1) {
          credential = "name";
        } else {
          credential = "email";
        }

        const user = await User.findOne({ [credential]: email_or_name });
        if (!user) {
          // throw new Error("User does not exist!");
          return {
            userId: null,
            token: "User does not exist!",
          };
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
          // throw new Error("Password is incorrect!");
          return {
            userId: null,
            token: "Password is incorrect!",
          };
        }

        sendRefreshToken(res, createRefreshToken(user));

        const token = createAccessToken(user);

        return { userId: user.id, token: token };
      },
    },

    logout: {
      type: GraphQLBoolean,
      args: {},
      resolve(parent, args, { req, res }) {
        sendRefreshToken(res, "");

        return true;
      },
    },

    forgotPassword: {
      type: GraphQLBoolean,
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args, { req, res }) {
        const user = await User.findOne({ email: args.email });

        if (!user) {
          return true;
        }

        const token = createForgotPasswordToken(user);

        await sendEmail(
          args.email,
          // `http://localhost:3000/passforgot-change/${token}`
          // `https://wikispeedtyping.herokuapp.com/#/passforgot-change/${token}`
          `${passforgotUri}${token}`
        );

        return true;
      },
    },

    changePasswordAfterForgot: {
      type: AuthData,
      args: {
        token: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args, { req, res }) {
        let decodedToken = jwt.verify(args.token, process.env.FORGOT_PASSWORD);

        let userId = decodedToken.userId;

        if (!userId) {
          return null;
        }

        let user = await User.findById(userId);

        if (!user) {
          return null;
        }

        let update;
        await bcrypt.hash(args.password, 12).then((newHashedPassword) => {
          update = {
            password: newHashedPassword,
          };
        });

        let updatedUser = await User.findByIdAndUpdate(userId, update, {
          new: true,
          useFindAndModify: false,
        });

        // automatically logging in
        sendRefreshToken(res, createRefreshToken(updatedUser));

        const token = createAccessToken(updatedUser);

        return { userId: updatedUser.id, token: token };
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
