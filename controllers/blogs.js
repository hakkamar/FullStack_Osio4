const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

blogsRouter.get('/', async (request, response) => {
  try {
    const blogs = await Blog
      .find({})
      .populate('user', { username: 1, name: 1, adult: 1 })
    response.json(blogs.map(Blog.format))
  } catch ( exception ) {
    console.log(exception)
    response.status(500).json({ error: 'something went wrong...' })
  }
})

blogsRouter.get('/:id', async (request, response) => {
  try {
    const blog = await Blog.findById(request.params.id)
    if ( blog ) {
      response.json(Blog.format(blog))
    } else {
      response.status(404).end()
    }
  } catch ( exception ) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch ( exception ) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  try {
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    if (body.title === undefined || body.author === undefined || body.url === undefined) {
      return response.status(400).json({ error: 'title, author and/or url missing' })
    }

    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
      id: body.id,
      likes: body.likes === undefined ? 0 : body.likes,
      author: body.author,
      title: body.title,
      url: body.url,
      user: user._id
    })

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(Blog.format(savedBlog))
  } catch ( exception ) {
    if ( exception.name === 'JsonWebTokenError' ) {
      response.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      response.status(500).json({ error: 'something went wrong...' })
    }
  }
})

blogsRouter.put('/:id', async (request, response) => {
  try {
    const body = request.body
    if ( body.likes < 0 ) {
      return response.status(400).json({ error: 'nagative value' })
    }
    const blog = await Blog.findById(request.params.id)
    if ( blog ) {
      const updatedBlog = ({
        id: blog.id,
        title: blog.title,
        author: blog.author,
        url: blog.url,
        likes: body.likes
      })
      await Blog.findByIdAndUpdate(request.params.id, updatedBlog, { new: true })
      response.json(Blog.format(updatedBlog))
    } else {
      response.status(404).end()
    }
  } catch ( exception ) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }
})
module.exports = blogsRouter