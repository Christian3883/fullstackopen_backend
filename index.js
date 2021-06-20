
require('dotenv').config()

const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const requestLogger = require('./middleware/requestLogger.js')
const unknownEndpoint = require('./middleware/unknownEndpoint.js')
const errorHandler = require('./middleware/errorHandler.js')
const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const Person = require('./models/person')

Sentry.init({
  dsn: process.env.SENTRY_URI,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app })
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
})

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler())
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler())

app.use(express.json())
app.use(express.static('build'))
app.use(morgan('combined'))
app.use(cors())
app.use(requestLogger)

app.get('/', (request, response) => {
  console.log('Phonebook - App')
})

app.get('/info', (request, response, next) => {
  Person.find({})
    .then(persons => {
      const msj = `Phonebook has info of ${persons.length} `
      response.send(`<p>${msj}</p><p>${new Date()}</p>`)
    })
    .catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  Person.findById(id)
    .then(person => {
      if (person) {
        response.status(200).json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  Person.findByIdAndRemove(id)
    .then(person => {
      console.log('Deleted : ', person)
      if (person) {
        return response.status(204).end()
      } else {
        return response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons/', (request, response, next) => {
  const body = request.body

  Person.find({ name: body.name })
    .then(person => {
      if (person.length > 0) {
        return response.status(400).json({
          error: 'name must be unique'
        })
      } else {
        const person = new Person({
          name: body.name,
          number: body.number
        })

        person
          .save()
          .then(savePerson => { return savePerson.toJSON() })
          .then(savedAndFormattedNote => response.status(201).json(savedAndFormattedNote))
          .catch(error => next(error))
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)

app.use(Sentry.Handlers.errorHandler())
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
