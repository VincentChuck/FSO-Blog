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

describe('when there is initially some notes saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('unique identifier prop is id instead of _id', async () => {
    let response = await api.get('/api/blogs')
    let blogs = response.body
    blogs.forEach(blog => {
      expect(blog._id).not.toBeDefined()
      expect(blog.id).toBeDefined()
    })
  })
})

describe('viewing a specific note', () => {
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
})

describe('addition of a new note', () => {
  test('likes property defaults to 0 if missing', async () => {
    const newBlog = {
      title: 'blog with no likes prop',
      author: 'VC',
      url: 'https://github.com/VincentChuck/FSO-Blog'
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)

    const addedBlog = await Blog.findById(response.body.id)
    expect(addedBlog.likes).toBeDefined()

  })

  test('blogs without title or url are not added', async () => {
    const blogWithoutTitle = {
      author: 'VC',
      url: 'https://github.com/VincentChuck/FSO-Blog'
    }
    const blogWithoutUrl = {
      title: 'blog with no likes prop',
      author: 'VC'
    }

    await api
      .post('/api/blogs')
      .send(blogWithoutTitle)
      .expect(400)

    await api
      .post('/api/blogs')
      .send(blogWithoutUrl)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  }, 10000)
})

describe('deleting a specific note', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)

    expect(blogsAtEnd).not.toContainEqual(blogToDelete)
  })

})

describe('updating a specific note', () => {
  test('note is updated with status code 200', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const updatedLikes = blogToUpdate.likes + Math.floor(Math.random() *100)

    const returnedNote = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ 'likes': updatedLikes })
      .expect(200)

    expect(returnedNote.body.likes).toBe(updatedLikes)

    const updatedNoteInDb = await Blog.findById(blogToUpdate.id)
    expect(updatedNoteInDb.likes).toBe(updatedLikes)
  })
})

afterAll(() => {
  mongoose.connection.close()
})