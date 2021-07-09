const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const homeRouter = require('./controllers/home')
const personsRouter = require('./controllers/persons')
const middleware = require('./utils/middleware')
const middlewareSentry = require('./utils/middlewareSentry')
const logger = require('./utils/logger')
const morgan = require('morgan')
const mongoose = require('mongoose')

middlewareSentry.setHeadersHandlers()

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(result => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan('combined'))
app.use(middleware.requestLogger)

app.use('/', homeRouter)
app.use('/api/persons', personsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)
middlewareSentry.setErrorHandler()

module.exports = app
