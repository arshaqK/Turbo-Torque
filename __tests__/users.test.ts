// __tests__/users.test.ts

// — Mocks —
jest.mock("@/db/connectDB", () => jest.fn());
jest.mock("@/models/User", () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));
jest.mock("@/middlewares/admin", () => ({
  adminMiddleware: jest.fn(),
}));

// Silence console.error to keep test output clean
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

type NextRequestMock = any;

import connectDB from "@/db/connectDB";
import User from "@/models/User";
import { adminMiddleware } from "@/middlewares/admin";
import { GET as getAllUsers } from "@/app/api/users/route";
import { DELETE as deleteUser } from "@/app/api/users/[id]/route";
import { NextResponse } from "next/server";

describe("Users API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/users", () => {
    it("returns 403 if not admin", async () => {
      (adminMiddleware as jest.Mock).mockResolvedValue(
        NextResponse.json({ message: "Forbidden" }, { status: 403 })
      );

      const res = await getAllUsers({} as NextRequestMock);
      expect(adminMiddleware).toHaveBeenCalled();
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.message).toBe("Forbidden");
    });

    it("returns filtered users for admin", async () => {
      (adminMiddleware as jest.Mock).mockResolvedValue(
        NextResponse.json({}, { status: 200 })
      );
      const fakeUsers = [
        { _id: '1', name: 'Alice', email: 'a@example.com', phoneNumber: '111', role: 'user' },
        { _id: '2', name: 'Bob', email: 'b@example.com', phoneNumber: '222', role: 'admin' },
      ];
      (User.find as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(fakeUsers) });

      const res = await getAllUsers({} as NextRequestMock);
      expect(connectDB).toHaveBeenCalled();
      expect(User.find).toHaveBeenCalled();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.users).toEqual([
        { _id: '1', name: 'Alice', email: 'a@example.com', phoneNumber: '111' }
      ]);
    });

    it("handles database errors with 500", async () => {
      (adminMiddleware as jest.Mock).mockResolvedValue(
        NextResponse.json({}, { status: 200 })
      );
      (connectDB as jest.Mock).mockRejectedValue(new Error("DB fail"));

      const res = await getAllUsers({} as NextRequestMock);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.message).toBe("An error occurred.");
    });
  });

  describe("DELETE /api/users/:id", () => {
    const mockReq = (email?: string) => ({ headers: { get: () => email } }) as NextRequestMock;

    it("returns 401 if no x-user-email header", async () => {
      const res = await deleteUser(mockReq(undefined), { params: { id: '123' } });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.message).toBe("User not found or unauthorized.");
    });

    it("returns 404 if user not found", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (User.findById as jest.Mock).mockResolvedValue(null);

      const res = await deleteUser(mockReq('a@example.com'), { params: { id: '123' } });
      expect(connectDB).toHaveBeenCalled();
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.message).toBe("User not found.");
    });

    it("returns 401 if email mismatch or not admin", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (User.findById as jest.Mock).mockResolvedValue({
        _id: '123', email: 'x@example.com', role: 'user'
      });

      const res = await deleteUser(mockReq('a@example.com'), { params: { id: '123' } });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.message).toBe("Not authorized.");
    });

    it("deletes and returns user when authorized", async () => {
      const target = { _id: '123', email: 'admin@example.com', role: 'admin', name: 'Admin' };
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (User.findById as jest.Mock).mockResolvedValue(target);
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(target);

      const res = await deleteUser(mockReq('admin@example.com'), { params: { id: '123' } });
      expect(connectDB).toHaveBeenCalled();
      expect(User.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.message).toBe("User deleted.");
      expect(data.user).toEqual(target);
    });

    it("handles errors with 500", async () => {
      (connectDB as jest.Mock).mockRejectedValue(new Error("fail"));
      const res = await deleteUser(mockReq('admin@example.com'), { params: { id: '123' } });
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.message).toBe("An error occurred.");
    });
  });
});
