const Person = require('../models/person')

const initialPerson = [
  {
    name: 'Persona 1',
    number: '11223344'
  },
  {
    name: 'Persona 2',
    number: '44332211'
  }
]

const nonExistingId = async () => {
  const person = new Person({ name: 'willremovethissoon', number: '87654321' })
  await person.save()
  await person.remove()

  return person._id.toString()
}

const personsInDb = async () => {
  const persons = await Person.find({})
  return persons.map(persons => persons.toJSON())
}

module.exports = {
  initialPerson, nonExistingId, personsInDb
}
