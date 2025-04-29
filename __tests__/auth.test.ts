import { POST as signupRoute } from "@/app/api/users/auth/signup/route";
import { POST as loginRoute } from "@/app/api/users/auth/login/route";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

// Mock DB connection
jest.mock("@/db/connectDB", () => jest.fn(async () => {}));

jest.mock("next/headers", () => {
    const mockCookies = {
      set: jest.fn(),
      get: jest.fn(() => undefined),
      delete: jest.fn(),
    };
  
    return {
      cookies: () => mockCookies,
    };
  });


// Mock env variable
process.env.JWT_SECRET = "testsecretkey123";

describe("Auth API", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  const user = {
    name: "Test User",
    email: "test@example.com",
    phoneNumber: "1234567890",
    password: "password123",
  };

  it("signup → 201, then login → set cookie + 200", async () => {
    const signupReq = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify(user),
      headers: { "Content-Type": "application/json" },
    });

    const signupRes = await signupRoute(signupReq);
    expect(signupRes.status).toBe(201);

    const loginReq = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ email: user.email, password: user.password }),
      headers: { "Content-Type": "application/json" },
    });

    const loginRes = await loginRoute(loginReq);
    expect(loginRes.status).toBe(200);

    const json = await loginRes.json();
    expect(json.message).toBe("User logged in successfully");
    expect(json.user.email).toBe(user.email);
  });

  it("login → 401 with wrong credentials", async () => {
    // First create a user
    const signupReq = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify(user),
      headers: { "Content-Type": "application/json" },
    });
    await signupRoute(signupReq);

    // Now try to login with wrong password
    const badLoginReq = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ email: user.email, password: "wrongpassword" }),
      headers: { "Content-Type": "application/json" },
    });

    const badLoginRes = await loginRoute(badLoginReq);
    expect(badLoginRes.status).toBe(401);

    const err = await badLoginRes.json();
    expect(err.message).toMatch(/Invalid credentials/i);
  });
});
