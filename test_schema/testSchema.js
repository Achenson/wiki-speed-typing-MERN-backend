const graphql = require("graphql");
const _ = require("lodash");

// mongoDB models
const Book = require("../test_mongoModels/book");
const Author = require("../test_mongoModels/Author");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull
} = graphql;

// https://www.youtube.com/watch?v=5RGEODLhjhY&list=PL4cUxeGkcC9iK6Qhn-QLcXCXPQUov1U7f&index=10
// ^ netninjs graphql testing


// dummy data
var books = [
  { name: "Name of the Wind", genre: "Fantasy", id: "1", authorId: "1" },
  { name: "The Final Empire", genre: "Fantasy", id: "2", authorId: "2" },
  { name: "The Hero of Ages", genre: "Fantasy", id: "4", authorId: "2" },
  { name: "The Long Earth", genre: "Sci-Fi", id: "3", authorId: "3" },
  { name: "The Colour of Magic", genre: "Fantasy", id: "5", authorId: "3" },
  { name: "The Light Fantastic", genre: "Fantasy", id: "6", authorId: "3" },
];

var authors = [
  { name: "Patrick Rothfuss", age: 44, id: "1" },
  { name: "Brandon Sanderson", age: 42, id: "2" },
  { name: "Terry Pratchett", age: 66, id: "3" },
];

const BookType = new GraphQLObjectType({
  name: "Book",
  // why we have to wrap in a func? because this function
  // will run after the whole code executes
  // otherwise AuthorType would be undefined as code run from
  // top to bottom
  fields: () => ({
    // id: { type: GraphQLString },
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    genre: { type: GraphQLString },
    author: {
      type: AuthorType,
      // parent is the book that we get from current query!
      resolve(parent, args) {
        //  authorID comes from books array
            // for dummy data only:
        // return _.find(authors, { id: parent.authorId });
        return Author.findById(parent.authorId)
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    books: {
      type: new GraphQLList(BookType),
      resolve(parent, args) {
        // parent refers to the Author that we are quering here
        // for dummy data only:
        // return _.filter(books, { authorId: parent.id });
        return Book.find({authorId: parent.id})

      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    book: {
      type: BookType,
      // id will be attached to args(?)
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        // code to get data from db / other source
        // for dummy data only:
        // return _.find(books, { id: args.id });
        return Book.findById(args.id)
      },
    },
    author: {
      type: AuthorType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        // for dummy data only:
        // return _.find(authors, { id: args.id });
        return Author.findById(args.id)
      },
    },
    books: {
      type: new GraphQLList(BookType),
      resolve(parent, args) {
        // we return the whole array,
        // graphQL will take care of returning specific data
        // for dummy data only:
        // return books;
        return Book.find({})
      },
    },
    authors: {
      type: new GraphQLList(AuthorType),
      resolve(parent, args) {
        // for dummy data only:
        // return authors;
        return Author.find({})
      },
    },
  },
});


const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addAuthor: {
            type: AuthorType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) }
            },
            resolve(parent, args){
                // Author is a mongoDB model
                // args are input typed in when adding author
                let author = new Author({
                    name: args.name,
                    age: args.age
                });
                // author.save() <- mongoose is saving our record
                // return <- mongoose is giving back the record that it just created
                // author will be "plurarised" and stored in a collection named "authors" 
                return author.save();
            }
        },
        addBook: {
            type: BookType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString)  },
                genre: { type: new GraphQLNonNull(GraphQLString)  },
                authorId: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args){
                let book = new Book({
                    name: args.name,
                    genre: args.genre,
                    authorId: args.authorId
                });
                return book.save();
            }
        }
    }
});


module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
