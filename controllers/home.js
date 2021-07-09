const homeRouter = require('express').Router()
const Person = require('../models/person')

homeRouter.get('/', (request, response) => {
  console.log('Phonebook - App')
})

homeRouter.get('/info', (request, response, next) => {
  Person.find({})
    .then(persons => {
      const msj = `Phonebook has info of ${persons.length} `
      response.send(`<p>${msj}</p><p>${new Date()}</p>`)
    })
    .catch(error => next(error))
})

module.exports = homeRouter
