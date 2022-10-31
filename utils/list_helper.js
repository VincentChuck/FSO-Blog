const _ = require('lodash')
const totalLikes = (blogs) => {
  return blogs.reduce( (sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  const favBlog = _.maxBy(blogs, 'likes')
  // eslint-disable-next-line no-unused-vars
  const { __v, _id, url, ...output } = favBlog
  return output
}

const mostBlogs = (blogs) => {
  const output = _(blogs)
    .countBy('author')
    .entries()
    .maxBy(_.last)
  return { author: output[0], blogs: output[1] }
}

const mostLikes = (blogs) => {
  const likes = Object.create(null)

  blogs.forEach(blog => {
    likes[blog.author] = (likes[blog.author] || 0) + blog.likes
  })

  const mostLikes = _(likes)
    .entries()
    .maxBy(_.last)
  return { author: mostLikes[0], likes: mostLikes[1] }
}

module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}