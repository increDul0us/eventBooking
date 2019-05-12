const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const {
    buildSchema
} = require('graphql');
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

const app = express();

//Get Schemas
const Event = require('./models/event');
const User = require('./models/user');

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type Event{
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: User!
        }
        type User{
            _id: ID!
            email: String!
            password: String
            createdEvents: [Event!]
        }

        input EventInput{
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        input UserInput{
            email: String!
            password: String!
        }

        type RootQuery{
            getEvents: [Event!]!
        }

        type RootMutation{
            createEvent (eventInput: EventInput): Event
            createUser (userInput: UserInput): User
        }

        schema{
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        getEvents: () =>{
            return Event
                .find()
                .populate('creator')
                .then(getEvents => {
                    return getEvents.map(event =>{
                        return{...event._doc, _id: event.id, creator: {
                            ...event._doc.creator_doc, _id: event._doc.creator.id
                        }};
                    });
                })
                .catch(err =>{
                    throw err;
                });
        },
        createEvent: args =>{
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date),
                creator: '5cd6a1dee666b43cfc636896',
            });
            let createdEvent;
            return event
              .save()
              .then(result => {
                createdEvent = { ...result._doc, _id: result._doc._id.toString() };
                return User.findById('5cd6a1dee666b43cfc636896');
              })
              .then(user => {
                if (!user) {
                  throw new Error('User not found.');
                }
                user.createdEvents.push(event);
                return user.save();
              })
              .then(result => {
                return createdEvent;
              })
              .catch(err => {
                console.log(err);
                throw err;
              });
          },
        createUser: args =>{
            return User.findOne({email: args.userInput.email}).then(user =>{
              if(user){
                  throw new Error('User exists already.')
              }
              return bcrypt
              .hash(args.userInput.password, 12)
            })
            .then(hashedPassword =>{
                const user = new User({
                    email: args.userInput.email,
                    password: hashedPassword
                });
                return user
                .save()
                .then(result =>{                       console.log(result);
                    return{...result._doc, password: null, _id: result.id};
                })
                .catch(err =>{
                    throw err;
                    console.log(err);
                });
            })
        }
    },
    graphiql: true
}));


//Set up default mongoose connection
var mongoDB = 'mongodb://localhost/eventBooking';
mongoose.connect(mongoDB, { useNewUrlParser: true });

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//perform db function
db.once('open', function() {
  // we're connected!
    console.log('connected');
});

app.listen(3000);
