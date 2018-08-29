const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

blogSchema.statics.format = function (blog) {
  return {
    id: blog._id,
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes === undefined ? 0 : blog.likes
  }
}

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog