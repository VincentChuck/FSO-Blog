const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

describe('when there is initially some blogs saved', () => {
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

let token
const login = async () => {
  token = null
  await User.deleteMany({})

  for (let user of helper.initialUsers) {
    await api
      .post('/api/users')
      .send(user)
  }

  const loginRes = await api
    .post('/api/login')
    .send(helper.initialUsers[0])
  token = loginRes.body.token
}

const newBlog = {
  title: 'third blog',
  author: 'FSO',
  url: 'https://github.com/fullstack-hy2020/',
  likes: 999
}

describe('addition of a new blog', () => {
  beforeEach(login)

  test('succeeds with valid data', async () => {
    //verify POST request creates a new blog post
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    //verify # of blogs increase by 1
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    //content is saved correctly to database
    expect(blogsAtEnd).toContainEqual(expect.objectContaining(newBlog))
  })

  test('likes property defaults to 0 if missing', async () => {
    const newBlog = {
      title: 'blog with no likes prop',
      author: 'VC',
      url: 'https://github.com/VincentChuck/FSO-Blog'
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)

    const addedBlog = await Blog.findById(response.body.id)
    expect(addedBlog.likes).toBeDefined()

  })

  test('fails with status code 400 if missing title or url', async () => {
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
      .set('Authorization', `bearer ${token}`)
      .send(blogWithoutTitle)
      .expect(400)

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(blogWithoutUrl)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  }, 10000)

  test('fails with status code 401 if token not provided', async () => {

    //verify POST request creates a new blog post
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    //verify # of blogs remains the same
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

    //content was not saved
    expect(blogsAtEnd).not.toContainEqual(expect.objectContaining(newBlog))
  })
})

describe('deleting a specific blog', () => {
  beforeEach(login)

  test('succeeds with status code 204 if id valid', async () => {
    let newBlogRes = await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `bearer ${token}`)

    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = newBlogRes.body
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)

    expect(blogsAtEnd).not.toContainEqual(expect.objectContaining(blogToDelete))
  })

  test('fails with status code 401 if token missing', async () => {
    let newBlogRes = await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `bearer ${token}`)

    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = newBlogRes.body
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
    expect(blogsAtEnd).toContainEqual(expect.objectContaining(newBlog))
  })

})

describe('updating a specific blog', () => {
  test('likes can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const updatedLikes = blogToUpdate.likes + Math.floor(Math.random() *100)

    const returnedBlog = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ 'likes': updatedLikes })
      .expect(200)

    expect(returnedBlog.body.likes).toBe(updatedLikes)

    const updatedBlogInDb = await Blog.findById(blogToUpdate.id)
    expect(updatedBlogInDb.likes).toBe(updatedLikes)
  })
})

afterAll(() => {
  mongoose.connection.close()
})