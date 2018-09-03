const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const { initialBlogs, format, nonExistingId, blogsInDb } = require('../utils/blog_api_helper')

describe('First tests about Blogs', () => {

  beforeAll(async () => {
    await Blog.remove({})

    for ( let blog of initialBlogs ) {
      let noteObject = new Blog(blog)
      await noteObject.save()
    }
  })
  test('all blogs are returned as json by GET /api/blogs', async () => {
    const blogsInDatabase = await blogsInDb()

    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.length).toBe(blogsInDatabase.length)

    const returnedTitles = response.body.map(n => n.title)
    blogsInDatabase.forEach(blog => {
      expect(returnedTitles).toContain(blog.title)
    })
  })
  test('a specific blog returned as json by GET /api/blogs/:id', async () => {

    const blogsInDatabase = await blogsInDb()
    const aBlog = blogsInDatabase[0]

    const response = await api
      .get(`/api/blogs/${aBlog.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.title).toEqual(aBlog.title)
  })
  test('404 returned by GET /api/blogs/:id with nonexisting valid id', async () => {
    const validNonexistingId = await nonExistingId()

    const response = await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })
  test('400 is returned by GET /api/blogs/:id with invalid id', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    const response = await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
  })
})

describe('Second tests about Blogs', () => {

  beforeAll(async () => {
    await Blog.remove({})

    for ( let blog of initialBlogs ) {
      let noteObject = new Blog(blog)
      await noteObject.save()
    }
  })

  test('a valid blog can be added by POST /api/blogs ', async () => {
    const blogsAtStart = await blogsInDb()

    const newBlog = {
      title: 'Lisätty testi Blogi',
      author: 'Testi Henkilö',
      url: 'www.testi.fi',
      likes: 2
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfterOperation = await blogsInDb()

    expect(blogsAfterOperation.length).toBe(blogsAtStart.length + 1)
    const titles = blogsAfterOperation.map(r => r.title)
    expect(titles).toContain('Lisätty testi Blogi')
  })
  test('a blog without content is NOT added by POST /api/blogs', async () => {
    const blogsAtStart = await blogsInDb()

    const newBlog = {
      likes: 2
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAfterOperation = await blogsInDb()

    expect(blogsAfterOperation.length).toBe(blogsAtStart.length)
  })
  test('a blog withtout likes can be added by POST /api/blogs', async () => {
    const blogsAtStart = await blogsInDb()

    const newBlog = {
      title: 'Lisätty Osa 3 testi Blogi',
      author: 'Testi Henkilö 3',
      url: 'www.testia.fi'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfterOperation = await blogsInDb()
    const titles = blogsAfterOperation.map(r => r.title)

    expect(blogsAfterOperation.length).toBe(blogsAtStart.length + 1)
    expect(titles).toContain('Lisätty Osa 3 testi Blogi')
  })
  test('a blog withtout title can NOT be added by POST /api/blogs', async () => {
    const blogsAtStart = await blogsInDb()

    const newBlog = {
      author: 'Testi Henkilö 4',
      url: 'www.testia4.fi',
      likes: 1
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const blogsAfterOperation = await blogsInDb()
    const authors = blogsAfterOperation.map(r => r.author)

    expect(blogsAfterOperation.length).toBe(blogsAtStart.length)
    expect(authors).not.toContain('Testi Henkilö 4')
  })
  test('a blog withtout url can NOT be added by POST /api/blogs', async () => {
    const blogsAtStart = await blogsInDb()

    const newBlog = {
      title: 'Yritetään lisätä Osa 4 testi Blogi',
      author: 'Testi Henkilö 5',
      likes: 1
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const blogsAfterOperation = await blogsInDb()
    const authors = blogsAfterOperation.map(r => r.author)

    expect(blogsAfterOperation.length).toBe(blogsAtStart.length)
    expect(authors).not.toContain('Testi Henkilö 5')
  })
})
describe('Third tests about Blogs', () => {
  beforeEach(async () => {
    await Blog.remove({})

    for ( let blog of initialBlogs ) {
      let noteObject = new Blog(blog)
      await noteObject.save()
    }
  })
  test('DELETE /api/blogs/:id succeeds with proper statuscode', async () => {
    const newBlog = {
      title: 'HTTP DELETE poistaa resurssin',
      author: 'Herra TestiHenkilö',
      url: 'www.XXXtesti.fi',
      likes: 0
    }
    const addedBlog = await api
      .post('/api/blogs')
      .send(newBlog)

    const blogsAtStart = await blogsInDb()
    const titlesBefore = blogsAtStart.map(r => r.title)

    await api
      .delete(`/api/blogs/${addedBlog.body.id}`)
      .expect(204)

    const blogsAfterOperation = await blogsInDb()
    const titlesAfter = blogsAfterOperation.map(r => r.title)

    expect(titlesBefore).toContain(addedBlog.body.title)
    expect(titlesAfter).not.toContain(addedBlog.body.title)
    expect(blogsAfterOperation.length).toBe(blogsAtStart.length - 1)
  })
})

afterAll(() => {
  server.close()
})