import { test, after, beforeEach } from "node/test";
import mongoose from "mongoose";
import supertest from "supertest";
import app from "../app.js";
import assert from "node/assert";
import blog from "../models/blog.js";

const api = supertest(app);

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
  },
  {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
  },
  {
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
  },
  {
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
  },
  {
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
  },
];

beforeEach(async () => {
  await blog.deleteMany({});
  for (let b of initialBlogs) {
    const blogObject = new blog(b);
    await blogObject.save();
  }
});

test("bloglist are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

after(async () => {
  await mongoose.connection.close();
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
  const res = await api.get("/api/blogs");
  const titles = res.body.map((b) => b.title);
  assert.strictEqual(res.body.length, initialBlogs.length + 1);
  assert(titles.includes("You-Dont-Know-JS"));
});

test("blog with no author can not be added", async () => {
  const newBlog = {
    title: "You-Dont-Know-JS v2",
    url: "https://github.com/getify/You-Dont-Know-JS",
    likes: 2,
  };

  await api.post("/api/blogs").send(newBlog).expect(400);

  const res = await api.get("/api/blogs");
});
