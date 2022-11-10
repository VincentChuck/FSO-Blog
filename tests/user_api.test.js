const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')

const User = require('../models/user')

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('samplePassword', 10)
  const user = new User({ username: 'sampleUser', passwordHash })

  await user.save()
})

describe('adding a new user', () => {

  test('succeeds with status code 201 if valid user', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'newUser',
      name: 'New User',
      password: 'new password'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const userNames = usersAtEnd.map(user => user.username)
    expect(userNames).toContain(newUser.username)
  },10000)

  test('fails with status code 400 if invalid user', async () => {
    const errMissing = 'missing username or password'
    const errExist =  'username must be unique'
    const errShort =  'username and password must be at least 3 characters long'
    const testUsers = {
      noUsername: {
        body: {
          name: 'No Username',
          password: 'some password'
        },
        error: errMissing
      },
      noPassword: {
        body: {
          username: 'noPassword',
          name: 'No Password',
        },
        error: errMissing
      },
      existUsername: {
        body: {
          username: 'sampleUser',
          name: 'New User',
          password: 'new password'
        },
        error: errExist
      },
      shortUsername: {
        body: {
          username: 'aa',
          name: 'aaa',
          password: 'aaa'
        },
        error: errShort
      },
      shortPassword: {
        body: {
          username: 'bbb',
          name: 'bbb',
          password: 'bb'
        },
        error: errShort
      }
    }

    for (let key in testUsers) {
      var user = testUsers[key].body
      var error = testUsers[key].error
      var result = await api
        .post('/api/users')
        .send(user)
        .expect(400)
        .expect('Content-Type', /application\/json/)
      expect(result.body.error).toContain(error)
    }
  }, 10000)
})

afterAll(() => {
  mongoose.connection.close()
})