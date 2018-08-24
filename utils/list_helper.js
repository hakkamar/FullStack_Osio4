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

module.exports = {
  dummy,
  totalLikes
}