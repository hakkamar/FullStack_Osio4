const dummy = (blogs) => {
  // ...
  return 1
}

const totalLikes = (blogs) => {
  let likesTotal = blogs.reduce(function(sum, blog) {
    return sum + blog.likes
  }, 0)
  return likesTotal
}

const formatBlog = (blog) => {
  return {
    title: blog.title,
    author: blog.author,
    likes: blog.likes
  }
}

const favoriteBlog = (blogs) => {
  if ( blogs.length === 0 ) {
    return null
  }

  let suurin = 0
  let i = 0
  for (let index = 0; index < blogs.length; index++) {
    if (blogs[index].likes > suurin) {
      suurin = blogs[index].likes
      i = index
    }
  }
  return formatBlog(blogs[i])
}

const mostBlogs = (blogs) => {
  if ( blogs.length === 0 ) {
    return null
  }

  // haetaan pohjat
  var taulukko = []
  for (let i = 0; i < blogs.length; i++) {
    taulukko.push(blogs[i].author)
  }
  taulukko.sort

  // eka hlö pois ja käsittelyn pohjaksi
  var kirjailija = taulukko.shift()
  let kpl = 1
  for (let i = 0; i < taulukko.length; i++) {
    if (kirjailija === taulukko[i]) {
      kpl++
    }
  }

  // Käydään taulukko läpi...
  for (let i = 0; i < taulukko.length; i++) {
    var kasittelyssa = taulukko[i]
    if (kasittelyssa !== kirjailija) {
      var kpl2 = 0
      for (let i = 0; i < taulukko.length; i++) {
        if (kasittelyssa === taulukko[i]) {
          kpl2++
        }
      }
      if (kpl2 > kpl) {
        kpl = kpl2
        kirjailija = kasittelyssa
      }
    }
  }
  return { author: kirjailija, blogs: kpl }
}

const mostLikes = (blogs) => {
  if ( blogs.length === 0 ) {
    return null
  }

  // haetaan eka hlö käsittelyn pohjaksi
  var kirjailija = blogs[0].author
  let liket = blogs[0].likes
  for (let i = 1; i < blogs.length; i++) {
    if (kirjailija === blogs[i].author) {
      liket += blogs[i].likes
    }
  }

  // Käydään taulukko läpi...
  for (let i = 1; i < blogs.length; i++) {
    var kasittelyssa = blogs[i].author
    if (kasittelyssa !== kirjailija) {
      var liket2 = 0
      for (let j = 0; j < blogs.length; j++) {
        if (kasittelyssa === blogs[j].author) {
          liket2+= blogs[j].likes
        }
      }
      if (liket2 > liket) {
        liket = liket2
        kirjailija = kasittelyssa
      }
    }
  }

  return  { author: kirjailija, likes: liket }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}