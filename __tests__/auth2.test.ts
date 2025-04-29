// __tests__/auth.test.ts

// Mocks
jest.mock("next/headers", () => ({ cookies: jest.fn() }));
jest.mock("cookie", () => ({ serialize: jest.fn((name, val, opts) => `${name}=${val}; Max-Age=${opts.maxAge}; Path=${opts.path}; HttpOnly; SameSite=${opts.sameSite}${opts.secure ? '; Secure' : ''}`) }));
jest.mock("@/db/connectDB", () => jest.fn());
jest.mock("@/models/User", () => ({ findOne: jest.fn() }));
jest.mock("jsonwebtoken", () => ({ verify: jest.fn() }));

import { POST as logout } from "@/app/api/users/auth/logout/route";
import { GET as getMe } from "@/app/api/users/auth/me/route";
import { cookies } from "next/headers";
import { serialize } from "cookie";
import connectDB from "@/db/connectDB";
import User from "@/models/User";
import { verify } from "jsonwebtoken";
import { COOKIE_NAME } from "@/constants";
import { NextResponse } from "next/server";

// Silence console.error and console.log during tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/users/auth/logout", () => {
    it("returns 400 if already logged out", async () => {
      const cookieStore = { get: jest.fn().mockReturnValue(undefined) };
      (cookies as jest.Mock).mockReturnValue(cookieStore);

      const res = await logout();
      expect(cookies).toHaveBeenCalled();
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toBe("Already logged out.");
    });

    it("clears cookie and returns 200 when logged in", async () => {
      const tokenObj = { name: COOKIE_NAME, value: "token123" };
      const cookieStore = { get: jest.fn().mockReturnValue(tokenObj) };
      (cookies as jest.Mock).mockReturnValue(cookieStore);

      const res = await logout();
      expect(cookies).toHaveBeenCalled();
      expect(serialize).toHaveBeenCalledWith(COOKIE_NAME, "", expect.objectContaining({ maxAge: -1, path: "/" }));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.message).toBe("Logged out successfully");
      expect(res.headers.get("Set-Cookie")).toContain(`${COOKIE_NAME}=`);
    });

    it("handles errors with 500", async () => {
      (cookies as jest.Mock).mockImplementation(() => { throw new Error("fail"); });

      const res = await logout();
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe("An unknown error occurred. Please try again later.");
    });
  });

  describe("GET /api/users/auth/me", () => {
    it("returns 401 if no token", async () => {
      const cookieStore = { get: jest.fn().mockReturnValue(undefined) };
      (cookies as jest.Mock).mockReturnValue(cookieStore);

      const res = await getMe();
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.message).toBe("Not authorized.");
    });

    it("returns 401 if token invalid", async () => {
      const tokenObj = { name: COOKIE_NAME, value: "badtoken" };
      const cookieStore = { get: jest.fn().mockReturnValue(tokenObj) };
      (cookies as jest.Mock).mockReturnValue(cookieStore);
      (verify as jest.Mock).mockImplementation(() => { throw new Error("invalid"); });

      const res = await getMe();
      expect(verify).toHaveBeenCalledWith("badtoken", expect.any(String));
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.message).toBe("Not authenticated.");
    });

    it("returns 404 if user not found", async () => {
      const tokenObj = { name: COOKIE_NAME, value: "goodtoken" };
      const cookieStore = { get: jest.fn().mockReturnValue(tokenObj) };
      (cookies as jest.Mock).mockReturnValue(cookieStore);
      (verify as jest.Mock).mockReturnValue({ email: "x@example.com" });
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const res = await getMe();
      expect(connectDB).toHaveBeenCalled();
      expect(User.findOne).toHaveBeenCalledWith({ email: "x@example.com" });
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.message).toBe("User not found.");
    });

    it("returns 200 and user data when authenticated", async () => {
      const tokenObj = { name: COOKIE_NAME, value: "goodtoken" };
      const cookieStore = { get: jest.fn().mockReturnValue(tokenObj) };
      (cookies as jest.Mock).mockReturnValue(cookieStore);
      (verify as jest.Mock).mockReturnValue({ email: "u@example.com" });
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      const dbUser = { _id: { toString: () => "id1" }, name: "User", email: "u@example.com", phoneNumber: "123", role: "user" };
      (User.findOne as jest.Mock).mockResolvedValue(dbUser);

      const res = await getMe();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.message).toBe("Authenticated.");
      expect(data.user).toEqual({ _id: "id1", name: "User", email: "u@example.com", phoneNumber: "123", role: "user" });
    });

    it("handles internal errors with 500", async () => {
      (cookies as jest.Mock).mockImplementation(() => { throw new Error("boom"); });

      const res = await getMe();
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.message).toBe("Server error.");
    });
  });
});
