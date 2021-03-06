const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { initialBlogs, nonExistingId, blogsInDb, usersInDb  } = require('../utils/blog_api_helper')
//const jwt = require('jsonwebtoken')
//const loginRouter = require('./controllers/login')
//app.use('/api/login', loginRouter)

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

    await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })
  test('400 is returned by GET /api/blogs/:id with invalid id', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
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
  test('PUT /api/blogs/:id succeeds with proper statuscode', async () => {
    const blogsInDatabase = await blogsInDb()
    const aBlog = blogsInDatabase[0]
    const updatedLikes = aBlog.likes + 2
    const updatedBlog = {
      id: aBlog.id,
      title: aBlog.title,
      author: aBlog.author,
      url: aBlog.url,
      likes: updatedLikes
    }

    const response = await api
      .put(`/api/blogs/${aBlog.id}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.likes).toEqual(updatedLikes)
  })
  test('PUT /api/blogs/:id fails with proper statuscode if likes < 0', async () => {
    const blogsInDatabase = await blogsInDb()
    const aBlog = blogsInDatabase[0]
    const updatedLikes = -5
    const updatedBlog = {
      id: aBlog.id,
      title: aBlog.title,
      author: aBlog.author,
      url: aBlog.url,
      likes: updatedLikes
    }

    await api
      .put(`/api/blogs/${aBlog.id}`)
      .send(updatedBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const aBlogAfter = blogsInDatabase[0]
    expect(aBlogAfter.likes).not.toEqual(updatedLikes)
    expect(aBlogAfter.likes).toBe(aBlog.likes)
  })
  test('PUT /api/blogs/:id fails with proper statuscode if nonExistingId', async () => {
    const blogsInDatabaseBefore = await blogsInDb()
    const validNonexistingId = await nonExistingId()
    const updatedBlog = {
      likes: 100
    }

    await api
      .put(`/api/blogs/${validNonexistingId}`)
      .send(updatedBlog)
      .expect(404)

    const blogsInDatabaseAfter = await blogsInDb()
    expect(blogsInDatabaseBefore.length).toBe(blogsInDatabaseAfter.length)
  })
  test('PUT /api/blogs/:id fails with proper statuscode if id=XXXXXXXXXXXXX', async () => {
    const blogsInDatabaseBefore = await blogsInDb()
    const validNonexistingId = 'XXXXXXXXXXXXX'
    const updatedBlog = {
      likes: 100
    }

    await api
      .put(`/api/blogs/${validNonexistingId}`)
      .send(updatedBlog)
      .expect(400)

    const blogsInDatabaseAfter = await blogsInDb()
    expect(blogsInDatabaseBefore.length).toBe(blogsInDatabaseAfter.length)
  })
})
describe.only('when there is initially one user at db', async () => {
  beforeAll(async () => {
    await User.remove({})
    const user = new User({ username: 'root', name: 'testi henkilö', password: 'sekret', adult: false })
    await user.save()
  })

  test('POST /api/users succeeds with a fresh username', async () => {
    const usersBeforeOperation = await usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
      adult: true
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length + 1)
    const usernames = usersAfterOperation.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })
  test('POST /api/users succeeds with a fresh username and password without adult boolean', async () => {
    const usersBeforeOperation = await usersInDb()

    const newUser = {
      username: 'hakkaraine2m',
      name: 'Marko Hakkarainen',
      password: 'salasana'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length + 1)
    const usernames = usersAfterOperation.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })
  test('POST /api/users fails with proper statuscode and message if username already taken', async () => {
    const usersBeforeOperation = await usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual({ error: 'username must be unique' })

    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
  })
  test('POST /api/users fails with proper statuscode and message if password < 3 characters', async () => {
    const usersBeforeOperation = await usersInDb()

    const newUser = {
      username: 'hakkamar',
      name: 'Hakkis',
      password: 'sa'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual({ error: 'password must be atleast 3 characters long' })

    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
  })
  test('POST /api/users succeeds XXXXXXXXXXXXXXXXXXXXX', async () => {
    const usersBeforeOperation = await usersInDb()

    const newUser = {
      username: 'hakkamar',
      name: 'Hakkis',
      password: 'salainen',
      adult: true
    }

    // luodaan uusi käyttäjä
    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length + 1)
    const uudenKayttajanIidee = usersAfterOperation[usersAfterOperation.length-1].id
    // loggaudutaan uudella käyttäjällä

    const response = await api
      .post('/api/login')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token = response.body.token
    const tokeni = 'berer' + token

    // lisätään käyttäjälle blog
    const blogsAtStart = await blogsInDb()

    const config = {
      headers: { 'Authorization': tokeni }
    }

    const newBlog = {
      title: 'Lisätty testi Blogi käyttäjälle',
      author: 'Hakkis Testaa',
      url: 'http://www.testi.fi',
      likes: 2,
      userId: uudenKayttajanIidee
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfterOperation = await blogsInDb()

    expect(blogsAfterOperation.length).toBe(blogsAtStart.length + 1)
    const titles = blogsAfterOperation.map(r => r.title)
    expect(titles).toContain('Lisätty testi Blogi käyttäjälle')

  })

})

afterAll(() => {
  server.close()
})