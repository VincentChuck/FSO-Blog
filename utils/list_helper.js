const totalLikes = (blogs) => {
    return blogs.reduce( (sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    const maxLike = Math.max(...blogs.map(o => o.likes))
    const favBlog = blogs.find(o => o.likes === maxLike)
    const {__v, _id, url, ...output} = favBlog
    return output
}

module.exports = {
    totalLikes,
    favoriteBlog
}