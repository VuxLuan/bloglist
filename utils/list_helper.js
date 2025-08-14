import _ from "lodash";

export const dummy = () => {
  return 1;
};

export const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes;
  };
  return blogs.reduce(reducer, 0);
};

export const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return undefined;
  }

  const favorite = blogs.reduce((prev, current) => {
    return prev.likes > current.likes ? prev : current;
  });

  return favorite;
};

/**
 * Finds the author with the most blogs from an array of blog objects.
 *
 * @param {Array<Object>} blogs - An array of blog objects. Each object must have an 'author' property.
 * @returns {Object|null} An object with the top author and their blog count, or null if the input array is empty.
 * Example: { author: "Robert C. Martin", blogs: 3 }
 */
export const mostBlogs = (blogs) => {
  // Return null if the input array is empty or invalid
  if (!blogs || blogs.length === 0) {
    return null;
  }

  // Use an object to store the count of blogs for each author
  const authorCounts = {};

  // Iterate over the blogs to count posts by author
  blogs.forEach((blog) => {
    authorCounts[blog.author] = (authorCounts[blog.author] || 0) + 1;
  });

  // Find the author with the highest count
  let topAuthor = "";
  let maxBlogs = 0;

  for (const author in authorCounts) {
    if (authorCounts[author] > maxBlogs) {
      maxBlogs = authorCounts[author];
      topAuthor = author;
    }
  }

  // Return the result in the specified format
  return {
    author: topAuthor,
    blogs: maxBlogs,
  };
};

export const mostLikes = (blogs) => {
  if (!blogs || blogs.length === 0) {
    return null;
  }

  const authorCounts = {};

  blogs.forEach((blog) => {
    authorCounts[blog.likes] = (authorCounts[blog.likes] || 0) + 1;
  });

  let topAuthor = "";
  let totalLikes = 0;

  for (const author in authorCounts) {
    if (authorCounts[author.likes] > totalLikes) {
      totalLikes = authorCounts[author.likes];
      topAuthor = author;
    }
  }

  return {
    author: topAuthor,
    likes: totalLikes
  }
};
