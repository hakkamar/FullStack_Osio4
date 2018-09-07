const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  likes: Number,
  author: String,
  title: String,
  url: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

blogSchema.statics.format = function (blog) {
  return {
    id: blog._id,
    user: blog.user,
    likes: blog.likes === undefined ? 0 : blog.likes,
    author: blog.author,
    title: blog.title,
    url: blog.url
  }
}

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog