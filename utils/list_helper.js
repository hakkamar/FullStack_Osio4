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

const favoriteBlog =(blogs) => {
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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}