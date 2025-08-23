import { describe, test, after, beforeEach } from "node:test";
import mongoose from "mongoose";
import supertest from "supertest";
import app from "../app.js";
import assert from "assert";
import Blog from "../models/blog.js";
import { initialBlogs, blogsInDb, userInDb } from "../utils/list_helper.js";
import bcrypt from "bcrypt";
import { User } from "../models/user.js";

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
      const resultBlog = await api
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

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const userAtStart = await userInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const userAtEnd = await userInDb();
    assert.strictEqual(userAtEnd.length, userAtStart.length + 1);

    const usernames = userAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test("creation fails with proper status code and message if username already taken", async () => {
    const usersAtStart = await userInDb();

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "salainen",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("content-Type", /application\/json/);

    const usersAtEnd = await userInDb();
    assert(
      result.body.console.error.includes("expected `username` to be unique")
    );

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });
});

after(async () => {
  await mongoose.connection.close();
});
