// __tests__/cars.test.ts

// 1) MOCK DB CONNECT & COOKIES
jest.mock("@/db/connectDB", () => jest.fn(async () => {}));
jest.mock("next/headers", () => ({
  cookies: () => ({ get: () => ({ name: "token", value: "t" }) }),
}));

// 2) MOCK AUTH MIDDLEWARES (if you protect these endpoints)
jest.mock("@/middlewares/admin", () => ({
  adminMiddleware: jest.fn(async () => ({ status: 200 })),
}));
jest.mock("@/middlewares/adminOrBrand", () => ({
  adminOrBrandMiddleware: jest.fn(async () => ({ status: 200 })),
}));

// 3) IMPORT DEPENDENCIES
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

// Models (to seed an owner)
import User from "@/models/User";

// Route handlers
import { GET as listCars, POST as createCar } from "@/app/api/cars/route";
import {
  GET as getCar,
  PUT as updateCar,
  DELETE as deleteCar,
} from "@/app/api/cars/[id]/route";

describe("Cars API", () => {
  let mongod: MongoMemoryServer;
  let ownerId: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());

    // Seed a dummy owner
    const owner = await User.create({
      name: "Owner",
      email: "owner@example.com",
      phoneNumber: "555-0000",
      password: "hashed", // assume schema requires these
    });
    ownerId = owner._id.toString();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  afterEach(async () => {
    // Clear cars collection between tests
    await mongoose.connection.db.collection("cars").deleteMany({});
  });

  it("GET /api/cars → returns empty cars array", async () => {
    const res = await listCars(new Request("http://test/cars"));
    expect(res.status).toBe(200);

    const data = await res.json();
    // route returns { cars: [...] }
    expect(Array.isArray(data.cars)).toBe(true);
    expect(data.cars.length).toBe(0);
  });

  it("POST /api/cars → 201 create", async () => {
    const payload = {
      ownerId,
      title: "My Car",
      location: "Test City",
      images: ["img1.jpg"],
    };

    const res = await createCar(
      new Request("http://test/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    );

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.message).toBe("Car listed successfully");
    expect(json.car).toHaveProperty("_id");
    expect(json.car.title).toBe(payload.title);
  });

  it("POST /api/cars → 400 missing required fields", async () => {
    const res = await createCar(
      new Request("http://test/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "", ownerId, images: [] }),
      })
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toBe("Please provide all required fields.");
  });

  it("GET /api/cars/[id] → 200 + car", async () => {
    // First create
    const createRes = await createCar(
      new Request("http://test/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId,
          title: "FetchMe",
          location: "City",
          images: ["i.jpg"],
        }),
      })
    );
    const { car } = await createRes.json();
    const id = car._id;

    // Then fetch
    const getRes = await getCar(
      new Request(`http://test/cars/${id}`),
      { params: { id } } as any
    );
    expect(getRes.status).toBe(200);
    const fetched = await getRes.json();
    expect(fetched.title).toBe("FetchMe");
  });

  it("GET /api/cars/[id] → 404 not found", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await getCar(
      new Request(`http://test/cars/${fakeId}`),
      { params: { id: fakeId } } as any
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.message).toBe("Car not found");
  });

  it("PUT /api/cars/[id] → 200 update fields", async () => {
    // seed
    const createRes = await createCar(
      new Request("http://test/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId,
          title: "Old",
          location: "Loc",
          images: ["a.jpg"],
        }),
      })
    );
    const { car } = await createRes.json();
    const id = car._id;

    // update
    const putRes = await updateCar(
      new Request(`http://test/cars/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Updated" }),
      }),
      { params: { id } } as any
    );
    expect(putRes.status).toBe(200);
    const json = await putRes.json();
    expect(json.car.title).toBe("Updated");
  });

  it("PUT /api/cars/[id] → 400 invalid update payload", async () => {
    // seed same as above
    const createRes = await createCar(
      new Request("http://test/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId,
          title: "Alpha",
          location: "L",
          images: ["a.jpg"],
        }),
      })
    );
    const { car } = await createRes.json();
    const id = car._id;

    // invalid title
    const res = await updateCar(
      new Request(`http://test/cars/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "" }),
      }),
      { params: { id } } as any
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toBe("Title cannot be empty.");
  });

  it("DELETE /api/cars/[id] → 200 delete", async () => {
    // seed
    const createRes = await createCar(
      new Request("http://test/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId,
          title: "ToDelete",
          location: "L",
          images: ["a.jpg"],
        }),
      })
    );
    const { car } = await createRes.json();
    const id = car._id;

    const delRes = await deleteCar(
      new Request(`http://test/cars/${id}`),
      { params: { id } } as any
    );
    expect(delRes.status).toBe(200);
    const json = await delRes.json();
    expect(json.message).toBe("Car deleted successfully");
  });

  it("DELETE /api/cars/[id] → 404 not found", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await deleteCar(
      new Request(`http://test/cars/${fakeId}`),
      { params: { id: fakeId } } as any
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.message).toBe("Car not found");
  });
});
