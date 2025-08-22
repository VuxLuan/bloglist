import { describe, test, after, beforeEach } from "node:test";
import mongoose from "mongoose";
import supertest from "supertest";
import app from "../app.js";
import assert from "assert";
import Blog from "../models/blog.js";
import { initialBlogs, blogsInDb } from "../utils/list_helper.js";

const api = supertest(app);

describe("when there is initially some blogs saved", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    await Blog.insertMany(initialBlogs);
  });

  test("bloglist are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs");
    assert.strictEqual(response.body.length, initialBlogs.length);
  });

  test("a specific blog is within the returned blogs", async () => {
    const response = await api.get("/api/blogs");
    const authors = response.body.map((e) => e.author);
    assert.strictEqual(authors.includes("Edsger W. Dijkstra"), true);
  });

  describe("viewing specific blog", () => {
    test("a specific blog can be viewed", async () => {
      const blogsAtStart = await blogsInDb();
      const blogToView = blogsAtStart[0];
      const resultBlog = await api // Use blogToView._id instead of blogToView.id
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      assert.deepStrictEqual(resultBlog.body, blogToView);
    });
  });

  describe("addition of a new blog", () => {
    test("a valid blog can be added", async () => {
      const newBlog = {
        title: "You-Dont-Know-JS",
        author: "Kyle Simpson",
        url: "https://github.com/getify/You-Dont-Know-JS",
        likes: 2,
      };

      await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);
      const blogsAtEnd = await blogsInDb();
      assert.strictEqual(blogsAtEnd.length, initialBlogs.length + 1);
      const titles = blogsAtEnd.map((b) => b.title);
      assert(titles.includes("You-Dont-Know-JS"));
    });

    test("blog with no author can not be added", async () => {
      const newBlog = {
        title: "You-Dont-Know-JS v2",
        url: "https://github.com/getify/You-Dont-Know-JS",
        likes: 2,
      };

      await api.post("/api/blogs").send(newBlog).expect(400);

      const blogsAtEnd = await blogsInDb();
      assert.strictEqual(blogsAtEnd.length, initialBlogs.length);
    });
  });

  describe("deltetion of blog", () => {
    test("a blog can be deleted", async () => {
      const blogsAtStart = await blogsInDb();
      const blogToDelete = blogsAtStart[0];
      await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);
      const blogsAtEnd = await blogsInDb();
      const authors = blogsAtEnd.map((b) => b.author);
      assert(!authors.includes(blogToDelete.author));

      assert.strictEqual(blogsAtEnd.length, initialBlogs.length - 1);
    });
  });
});


after(async () => {
  await mongoose.connection.close();
});
