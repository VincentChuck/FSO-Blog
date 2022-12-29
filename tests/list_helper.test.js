const listHelper = require('../utils/list_helper');
const { listWithOneBlog, listWithFiveBlogs } = require('./lists');

describe('total likes', () => {
  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog);
    expect(result).toBe(5);
  });

  test('when list has five blogs, equals the sum of likes', () => {
    const result = listHelper.totalLikes(listWithFiveBlogs);
    expect(result).toBe(7 + 5 + 12 + 10 + 2);
  });
});
describe('favorite blog', () => {
  test('when list has only one blog, equals the only blog', () => {
    const result = listHelper.favoriteBlog(listWithOneBlog);
    expect(result).toEqual({
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      likes: 5,
    });
  });

  test('when list has five blogs, equals the blog with most likes', () => {
    const result = listHelper.favoriteBlog(listWithFiveBlogs);
    expect(result).toEqual({
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 12,
    });
  });
});

describe('most blogs', () => {
  test('when list has only one blog, equals the author of that blog', () => {
    const result = listHelper.mostBlogs(listWithOneBlog);
    expect(result).toEqual({
      author: 'Edsger W. Dijkstra',
      blogs: 1,
    });
  });

  test('when list has five blogs, equals author with most blogs', () => {
    const result = listHelper.mostBlogs(listWithFiveBlogs);
    expect(result).toEqual({
      author: 'Robert C. Martin',
      blogs: 3,
    });
  });
});

describe('most likes', () => {
  test('when list has only one blog, equals the author of that blog', () => {
    const result = listHelper.mostLikes(listWithOneBlog);
    expect(result).toEqual({
      author: 'Edsger W. Dijkstra',
      likes: 5,
    });
  });

  test('when list has five blogs, equals author with most likes', () => {
    const result = listHelper.mostLikes(listWithFiveBlogs);
    expect(result).toEqual({
      author: 'Edsger W. Dijkstra',
      likes: 17,
    });
  });
});
