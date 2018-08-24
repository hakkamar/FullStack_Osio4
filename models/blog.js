const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

blogSchema.statics.format = function (blog) {
  return {
    name: blog.title,
    number: blog.author,
    url: blog.url,
    likes: blog.likes,
    id: blog._id
  }
}

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog