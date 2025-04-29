import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

import { POST as signupHandler } from "../app/api/users/auth/signup/route";

jest.mock("../db/connectDB", () => jest.fn(async () => {}));

describe("User Signup API", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it("returns 400 if required fields are missing", async () => {
    const req = new Request("http://localhost/api/users/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
      }),
    });

    const res = await signupHandler(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data).toEqual({ message: "Please fill in all the required fields." });
  });

  it("creates a new user successfully", async () => {
    const req = new Request("http://localhost/api/users/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        name: "Test User",
        email: "testuser@example.com",
        phoneNumber: "1234567890",
        password: "testpassword",
      }),
    });

    const res = await signupHandler(req);
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.message).toBe("User created successfully");
    expect(data.user).toMatchObject({
      email: "testuser@example.com",
      name: "Test User",
      phoneNumber: "1234567890",
    });
  });

  it("rejects a duplicate email or phone number", async () => {
    const req = new Request("http://localhost/api/users/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        name: "Another User",
        email: "testuser@example.com",
        phoneNumber: "1234567890",
        password: "anotherpass",
      }),
    });

    const res = await signupHandler(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.message).toMatch(/Existing (email|phone number)\./);
  });
});
