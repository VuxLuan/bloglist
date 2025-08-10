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

export const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return undefined;
  }

  const authorCounts = blogs.reduce((acc) => {});
};
