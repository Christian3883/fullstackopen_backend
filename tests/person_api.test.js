const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Person = require('../models/person')

beforeEach(async () => {
  await Person.deleteMany({})
  let personObject = new Person(helper.initialPerson[0])
  await personObject.save()
  personObject = new Person(helper.initialPerson[1])
  await personObject.save()
})

test('persons are returned as json', async () => {
  await api
    .get('/api/persons')
    .expect(200)
})

test('there are two persons', async () => {
  const response = await api.get('/api/persons')
  expect(response.body).toHaveLength(2)
})

test('all persons are returned', async () => {
  const response = await api.get('/api/persons')

  expect(response.body).toHaveLength(helper.initialPerson.length)
})

test('a specific person is within the returned persons', async () => {
  const response = await api.get('/api/persons')

  const names = response.body.map(r => r.name)
  expect(names).toContain(
    'Persona 1'
  )
})

test('a valid Persons can be added', async () => {
  const newPerson = {
    name: 'Valid Person',
    number: '12345678'
  }

  await api
    .post('/api/persons')
    .send(newPerson)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const personsAtEnd = await helper.personsInDb()
  expect(personsAtEnd).toHaveLength(helper.initialPerson.length + 1)

  const names = personsAtEnd.map(n => n.name)
  expect(names).toContain('Valid Person')
})

test('person without content is not added', async () => {
  const newPerson = {
  }

  await api
    .post('/api/persons')
    .send(newPerson)
    .expect(400)

  const notesAtEnd = await helper.personsInDb()
  expect(notesAtEnd).toHaveLength(helper.initialPerson.length)
})

test('a specific person can be viewed', async () => {
  const personsAtStart = await helper.personsInDb()

  const personToView = personsAtStart[0]

  const resultPerson = await api
    .get(`/api/persons/${personToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const processedPersonToView = JSON.parse(JSON.stringify(personToView))

  expect(resultPerson.body).toEqual(processedPersonToView)
})

test('a person can be deleted', async () => {
  const personsAtStart = await helper.personsInDb()
  const personToDelete = personsAtStart[0]

  await api
    .delete(`/api/persons/${personToDelete.id}`)
    .expect(204)

  const personsAtEnd = await helper.personsInDb()

  expect(personsAtEnd).toHaveLength(
    helper.initialPerson.length - 1
  )

  const names = personsAtEnd.map(r => r.name)

  expect(names).not.toContain(personToDelete.name)
})

afterAll(() => {
  mongoose.connection.close()
})
