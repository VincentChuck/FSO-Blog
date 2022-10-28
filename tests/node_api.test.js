const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('unique identifier prop is id instead of _id', async () => {
  let response = await api.get('/api/blogs')
  let blogs = response.body
  console.dir(blogs)
  blogs.forEach(blog => {
    expect(blog._id).not.toBeDefined()
    expect(blog.id).toBeDefined()
  })
})

test('a valid blog can be added', async () => {
  jest.setTimeout(10000)

  const newBlog = {
    title: 'third blog',
    author: 'FSO',
    url: 'https://github.com/fullstack-hy2020/',
    likes: 999
  }

  //verify POST request creates a new blog post
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  //verify # of blogs increase by 1
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  //content is saved correctly to database
  expect(blogsAtEnd).toContainEqual(expect.objectContaining(newBlog))
})

afterAll(() => {
  mongoose.connection.close()
})