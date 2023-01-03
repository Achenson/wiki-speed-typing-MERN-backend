const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  // we don't have to pass id, because mongoDB will create it manualy
  name: String,
  email: String,
  password: String,
  tokenVersion: Number,
});

module.exports = mongoose.model("User", userSchema);
