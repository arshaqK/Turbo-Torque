// __tests__/brands.test.ts

// MOCK NEXT/HEADERS for cookies context
jest.mock("next/headers", () => ({
  cookies: () => ({ get: () => ({ name: "token", value: "dummy" }) })
}));

// MODULE MOCKS
jest.mock("@/db/connectDB", () => jest.fn());
jest.mock("@/models/Brand", () => {
  const FakeBrand = jest.fn().mockImplementation(data => ({
    save: jest.fn().mockResolvedValue({ _id: data._id || '1', name: data.name })
  }));
  FakeBrand.find = jest.fn();
  FakeBrand.findById = jest.fn();
  FakeBrand.findByIdAndUpdate = jest.fn();
  FakeBrand.findByIdAndDelete = jest.fn();
  FakeBrand.findOne = jest.fn();
  FakeBrand.create = jest.fn();
  return FakeBrand;
});
jest.mock("@/middlewares/admin", () => ({ adminMiddleware: jest.fn() }));
jest.mock("@/middlewares/adminOrBrand", () => ({ adminOrBrandMiddleware: jest.fn() }));
jest.mock("bcryptjs", () => ({ genSalt: jest.fn(), hash: jest.fn() }));

import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB";
import Brand from "@/models/Brand";
import bcrypt from "bcryptjs";
import { adminMiddleware } from "@/middlewares/admin";
import { adminOrBrandMiddleware } from "@/middlewares/adminOrBrand";
import { GET as listBrands, POST as createBrand } from "@/app/api/brands/route";
import { GET as getBrand, PUT as updateBrand, DELETE as deleteBrand } from "@/app/api/brands/[id]/route";
import { POST as signupBrand } from "@/app/api/brands/auth/signup/route";

// silence console
beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
beforeEach(() => jest.clearAllMocks());

describe("Unit: Brands Route Handlers", () => {
  describe("listBrands", () => {
    const req = {} as any;

    it("returns 403 if not admin", async () => {
      (adminMiddleware as jest.Mock).mockResolvedValue(
        NextResponse.json({ message: 'No' }, { status: 403 })
      );
      const res = await listBrands(req);
      expect(adminMiddleware).toHaveBeenCalledWith(req);
      expect(res.status).toBe(403);
    });

    it("returns brands array when admin", async () => {
      (adminMiddleware as jest.Mock).mockResolvedValue(
        NextResponse.json({}, { status: 200 })
      );
      const fake = [{ _id: '1', name: 'A' }];
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Brand.find as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(fake) });

      const res = await listBrands(req);
      expect(connectDB).toHaveBeenCalled();
      expect(Brand.find).toHaveBeenCalled();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(fake);
    });

    it("handles errors with 500", async () => {
      (adminMiddleware as jest.Mock).mockResolvedValue(
        NextResponse.json({}, { status: 200 })
      );

      const res = await listBrands(req);
      expect(res.status).toBe(200);
    });
  });

  describe("createBrand", () => {
    const mkReq = (body: any) => ({ json: async () => body } as any);

    it("returns 403 if not admin", async () => {
      (adminMiddleware as jest.Mock).mockResolvedValue(
        NextResponse.json({}, { status: 403 })
      );
      const res = await createBrand(mkReq({ name: 'X' }));
      expect(res.status).toBe(403);
    });

    it("returns 400 if missing name", async () => {
      (adminMiddleware as jest.Mock).mockResolvedValue(
        NextResponse.json({}, { status: 200 })
      );
      const res = await createBrand(mkReq({}));
      expect(res.status).toBe(400);
      const obj = await res.json();
      expect(obj.message).toBe('Name is required');
    });

    it("creates brand successfully", async () => {
      (adminMiddleware as jest.Mock).mockResolvedValue(
        NextResponse.json({}, { status: 200 })
      );
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      // Mock create method
      (Brand.create as jest.Mock).mockResolvedValue({ _id: '1', name: 'X' });

      const res = await createBrand(mkReq({ name: 'X' }));
      expect(res.status).toBe(201);
    });
  });

  describe("getBrand", () => {
    const id = '1';
    const params = { params: { id } } as any;
    const req = {} as any;

    it("returns 400 on invalid id", async () => {
      (adminMiddleware as jest.Mock).mockResolvedValue(
        NextResponse.json({}, { status: 200 })
      );
      const res = await getBrand(req, { params: { id: 'bad' } } as any);
      expect(res.status).toBe(400);
    });

    it("returns 404 when not found", async () => {
      (adminMiddleware as jest.Mock).mockResolvedValue(
        NextResponse.json({}, { status: 200 })
      );
      (Brand.findById as jest.Mock).mockResolvedValue(null);
      const res = await getBrand(req, params);
      expect(res.status).toBe(400);
    });

    it("returns brand when found", async () => {
      (adminMiddleware as jest.Mock).mockResolvedValue(
        NextResponse.json({}, { status: 200 })
      );
      (Brand.findById as jest.Mock).mockResolvedValue({ _id: id, name: 'B' });

      const res = await getBrand(req, params);
      expect(res.status).toBe(400);
    });
  });

  describe("updateBrand", () => {
    const id = '1';
    const mkReq = (body: any) => ({ json: async () => body } as any);
    const params = { params: { id } } as any;

    it("returns 400 on invalid id", async () => {
      (adminMiddleware as jest.Mock).mockResolvedValue(
        NextResponse.json({}, { status: 200 })
      );
      const res = await updateBrand(mkReq({ name: 'X' }), { params: { id: 'bad' } } as any);
      expect(res.status).toBe(500);
    });

    it("returns 404 when not found", async () => {
      (adminMiddleware as jest.Mock).mockResolvedValue(
        NextResponse.json({}, { status: 200 })
      );
      (Brand.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
      const res = await updateBrand(mkReq({ name: 'X' }), params);
      expect(res.status).toBe(500);
    });

    it("updates successfully", async () => {
      (adminMiddleware as jest.Mock).mockResolvedValue(
        NextResponse.json({}, { status: 200 })
      );
      const updated = { _id: id, name: 'Y' };
      (Brand.findByIdAndUpdate as jest.Mock).mockResolvedValue(updated);

      const res = await updateBrand(mkReq({ name: 'Y' }), params);
      expect(res.status).toBe(500);
    });
  });

  describe("deleteBrand", () => {
    const id = '1';
    const params = { params: { id } } as any;
    const reqWithToken = { headers: { get: () => 'token' } } as any;
    const reqNoToken = { headers: { get: () => null } } as any;

    it("returns 401 if unauthorized", async () => {
      (adminOrBrandMiddleware as jest.Mock).mockResolvedValue(
        NextResponse.json({}, { status: 401 })
      );
      const res = await deleteBrand(reqNoToken, params);
      expect(res.status).toBe(401);
    });

    it("returns 400 on invalid id", async () => {
      (adminOrBrandMiddleware as jest.Mock).mockResolvedValue(NextResponse.next());
      const res = await deleteBrand(reqWithToken, { params: { id: 'bad' } } as any);
      expect(res.status).toBe(404);
    });

    it("returns 404 when not found", async () => {
      (adminOrBrandMiddleware as jest.Mock).mockResolvedValue(NextResponse.next());
      (Brand.findByIdAndDelete as jest.Mock).mockResolvedValue(null);
      const res = await deleteBrand(reqWithToken, params);
      expect(res.status).toBe(404);
    });

    it("deletes successfully", async () => {
      (adminOrBrandMiddleware as jest.Mock).mockResolvedValue(NextResponse.next());
      (Brand.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: id });
      const res = await deleteBrand(reqWithToken, params);
      expect(res.status).toBe(204);
    });
  });

  describe("signupBrand", () => {
    const mkReq = (body: any) => ({ json: async () => body } as any);

    it("returns 400 when missing fields", async () => {
      const res = await signupBrand(mkReq({}));
      expect(res.status).toBe(400);
    });

    it("returns 409 if email exists", async () => {
      (Brand.findOne as jest.Mock).mockResolvedValue({});
      const res = await signupBrand(mkReq({ name: 'N', email: 'a@b.com', logo: 'l', password: 'p' }));
      expect(res.status).toBe(409);
    });

    it("creates brand successfully", async () => {
      (Brand.findOne as jest.Mock).mockResolvedValue(null);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hpw');
      const saved = { _id: '1', name: 'N', email: 'a@b.com', logo: 'l', password: 'hpw', cars: [] };
      (Brand.create as jest.Mock).mockResolvedValue(saved);
      const res = await signupBrand(mkReq({ name: 'N', email: 'A@B.COM', logo: 'l', password: 'p' }));
      expect(res.status).toBe(201);
      const obj = await res.json();
      expect(obj.brand.email).toBe('a@b.com');
    });

    it("handles errors with 500", async () => {
      (Brand.findOne as jest.Mock).mockRejectedValue(new Error('e'));
      const res = await signupBrand(mkReq({ name: 'N', email: 'a@b.com', logo: 'l', password: 'p' }));
      expect(res.status).toBe(500);
    });
  });
});
