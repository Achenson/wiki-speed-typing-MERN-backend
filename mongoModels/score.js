const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const scoreSchema = new Schema({
  // we don't have to pass id, because mongoDB will create it manualy
  id: String,
  userId: String,
  five_s: Array,
  one_min: Array,
  two_min: Array,
  five_min: Array,
  ten_min: Array,
});

module.exports = mongoose.model("Score", scoreSchema);
