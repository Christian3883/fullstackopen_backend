const personsRouter = require('express').Router()
const Person = require('../models/person')

personsRouter.get('/', async (request, response, next) => {
  /*
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
    */
  try {
    const persons = await Person.find({})
    response.json(persons)
  } catch (error) {
    next(error)
  }
})

personsRouter.get('/:id', async (request, response, next) => {
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

  // const person = await Person.findById(id)
})

personsRouter.delete('/:id', (request, response, next) => {
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

personsRouter.post('/', async (request, response, next) => {
  const body = request.body

  /*
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
    */
  const personsInDb = await Person.find({ name: body.name })
  if (personsInDb.length > 0) {
    return response.status(400).json({ error: 'name must be unique' })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  try {
    const savedPerson = await person.save()
    response.status(201).json(savedPerson)
  } catch (error) {
    next(error)
  }
})

personsRouter.put('/:id', (request, response, next) => {
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

module.exports = personsRouter
