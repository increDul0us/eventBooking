const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp = require('express-graphql')
const mongoose = require('mongoose')
const path = require('path')
const cors = require('cors')

const graphQlSchema = require('./graphql/schema/index')
const graphQlResolvers = require('./graphql/resolvers/index')
const isAuth = require('./middleware/is-auth')

const app = express()
app.use(cors())

app.use(bodyParser.json())

app.use(isAuth)

app.use(
  '/graphql',
  graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
  })
)

mongoose
  .connect(
    'mongodb+srv://incredulous:incredulous@cluster0-jz2yt.mongodb.net/test?retryWrites=true&w=majority'
  )
  .then(() => {
    console.log('MongoDB Connected')
  })
  .catch(err => {
    console.log(err)
  })

// var mongoDB = 'mongodb://localhost/eventBooking'
// mongoose.connect(mongoDB, {
//   useNewUrlParser: true
// })
// var db = mongoose.connection
// db.on('error', console.error.bind(console, 'MongoDB connection error:'))
// db.once('open', function () {
//   console.log('connected')
// })

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('frontend/build'))
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  })
}

app.listen(process.env.PORT || 8000, function () {
  console.log('Server is running on Port:  %d in %s mode', this.address().port, app.settings.env)
})
