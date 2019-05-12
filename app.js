const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
var mongoose = require('mongoose');

//import graphql datas
const graphQlSchema = require('./graphql/schema/index');
const graphQlResolver = require('./graphql/resolver/index');

const app = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolver,
    graphiql: true
}));


//Set up default mongoose connection
var mongoDB = 'mongodb://localhost/eventBooking';
mongoose.connect(mongoDB, {
    useNewUrlParser: true
});

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//perform db function
db.once('open', function () {
    // we're connected!
    console.log('connected');
});

app.listen(3000);
