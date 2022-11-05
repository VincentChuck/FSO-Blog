const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'first blog!',
    author: 'VC',
    url: 'https://github.com/VincentChuck/FSO-Blog',
    likes: 9
  },
  {
    title: 'second blog',
    author: 'RW',
    url: 'https://github.com/VincentChuck',
    likes: 99
  }
]

const nonExistingId = async () => {
  const blog = new Blog({ content: 'willremovethissoon', date: new Date() })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb
}