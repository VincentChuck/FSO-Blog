const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const { userExtractor } = require('../utils/middleware');

const findBlog = async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  if (!blog) {
    return response.status(404).json({ error: 'blog not found' });
  }
  return blog;
};

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.post('/:id/comments', async (request, response) => {
  const blog = await findBlog(request, response);
  const updatedComments = blog.comments
    ? [
        ...blog.comments,
        { id: blog.comments.length, comment: request.body.comment },
      ]
    : [{ id: 0, comment: request.body.comment }];
  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { comments: updatedComments },
    { new: true }
  ).populate('user', { username: 1, name: 1 });
  response.status(201).json(updatedBlog);
});

blogsRouter.post('/', userExtractor, async (request, response) => {
  const body = request.body;

  const user = request.user;
  const blog = new Blog(body);

  blog.likes = blog.likes || 0;
  blog.user = user._id;

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  const savedBlogPopulated = await savedBlog.populate('user', {
    username: 1,
    name: 1,
  });

  response.status(201).json(savedBlogPopulated);
});

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user;
  const blog = await findBlog(request, response);

  if (blog.user.toString() === user.id.toString()) {
    await Blog.findByIdAndRemove(request.params.id);
    return response.status(204).end();
  }

  return response
    .status(401)
    .json({ error: 'user is unauthorized to delete this blog' });
});

blogsRouter.put('/:id', async (request, response) => {
  const updatedLikes = { likes: request.body.likes };
  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    updatedLikes,
    { new: true }
  ).populate('user', { username: 1, name: 1 });
  response.status(200).json(updatedBlog);
});

module.exports = blogsRouter;
