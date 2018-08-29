const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')

const initialBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0
  }
]

beforeAll(async () => {
  await Blog.remove({})

  for ( let blog of initialBlogs ) {
    let noteObject = new Blog(blog)
    await noteObject.save()
  }
})

test('Blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

describe('Tests about Blogs', () => {
  test('All Blogs are returned', async () => {
    const response = await api
      .get('/api/blogs')

    expect(response.body.length).toBe(initialBlogs.length)
  })
  test('a specific blog is within the returned Blogs', async () => {
    const response = await api
      .get('/api/blogs')

    const titles = response.body.map(r => r.title)
    expect(titles).toContainEqual('React patterns')
  })
  test('a valid blog can be added ', async () => {
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

    const response = await api
      .get('/api/blogs')

    const titles = response.body.map(r => r.title)

    expect(response.body.length).toBe(initialBlogs.length + 1)
    expect(titles).toContain('Lisätty testi Blogi')
  })
  test('Blog without content is not added ', async () => {
    const newBlog = {
      likes: 2
    }

    const intialBlogs = await api
      .get('/api/blogs')

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const response = await api
      .get('/api/blogs')

    expect(response.body.length).toBe(intialBlogs.body.length)
  })
  test('a specific blog can be viewed', async () => {
    const resultAll = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const aBlogFromAll = resultAll.body[0]

    const resultBlog = await api
      .get(`/api/blogs/${aBlogFromAll.id}`)

    const blogObject = resultBlog.body

    expect(blogObject).toEqual(aBlogFromAll)
  })
  test('a blog can be deleted', async () => {
    const newBlog = {
      title: 'HTTP DELETE poistaa resurssin',
      author: 'Testi Henkilö2',
      url: 'www.testi2.fi',
      likes: 0
    }

    const addedBlog = await api
      .post('/api/blogs')
      .send(newBlog)

    const blogsAtBeginningOfOperation = await api
      .get('/api/blogs')

    await api
      .delete(`/api/blogs/${addedBlog.body.id}`)
      .expect(204)

    const blogsAfterDelete = await api
      .get('/api/blogs')

    const titles = blogsAfterDelete.body.map(r => r.title)

    expect(titles).not.toContain('HTTP DELETE poistaa resurssin')
    expect(blogsAfterDelete.body.length).toBe(blogsAtBeginningOfOperation.body.length - 1)
  })
  test('a blog withtout likes can be added ', async () => {
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

    const response = await api
      .get('/api/blogs')

    const titles = response.body.map(r => r.title)

    // + 2 koska jo aikaisemmin lisättiin yksi.
    expect(response.body.length).toBe(initialBlogs.length + 2)
    expect(titles).toContain('Lisätty Osa 3 testi Blogi')
  })
  test('a blog withtout title can NOT be added ', async () => {
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

    const response = await api
      .get('/api/blogs')

    const authors = response.body.map(r => r.author)

    // + 2 koska jo aikaisemmin lisättiin kaksi onnistunutta.
    expect(response.body.length).toBe(initialBlogs.length + 2)
    expect(authors).not.toContain('Testi Henkilö 4')
  })
  test('a blog withtout url can NOT be added ', async () => {
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

    const response = await api
      .get('/api/blogs')

    const authors = response.body.map(r => r.author)

    // + 2 koska jo aikaisemmin lisättiin kaksi onnistunutta.
    expect(response.body.length).toBe(initialBlogs.length + 2)
    expect(authors).not.toContain('Testi Henkilö 5')
  })
})

afterAll(() => {
  server.close()
})