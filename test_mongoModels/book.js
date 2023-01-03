const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    // we don't have to pass id, because mongoDB will create it manualy 
    name: String,
    genre: String,
    authorId: String
});
// we will have a collection named "Book" ?? books??, inside which there will be bookSchema object
module.exports = mongoose.model('Book', bookSchema);