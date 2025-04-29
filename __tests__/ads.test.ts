// __tests__/ads.test.ts

// — Mocks —
jest.mock("@/db/connectDB", () => jest.fn(async () => {}));
jest.mock("next/headers", () => ({
  cookies: () => ({ get: () => ({ name: "token", value: "t" }) }),
}));

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { GET as listAds, POST as createAd } from "@/app/api/ads/route";

describe("Ads API", () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  it("GET /api/ads → empty list", async () => {
    const res = await listAds(new Request("http://test/ads"));
    expect(res.status).toBe(200);

    const data = await res.json();
    // route returns { cars: [...] }
    expect(Array.isArray(data.cars)).toBe(true);
    expect(data.cars.length).toBe(0);
  });

  it("POST /api/ads → 201 create valid ad", async () => {
    const payload = {
      name: "SuperCar",
      images: ["http://example.com/img1.jpg"],
      price: 25000,
      mileage: 12000,
      modelYear: 2020,
      city: "Testville",
      sellerName: "Alice",
      sellerPhone: "555-1234",
      sellerComments: "Like new!"
    };

    const res = await createAd(
      new Request("http://test/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    );

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.message).toBe("Car ad created successfully.");
    expect(data.car).toHaveProperty("_id");
    expect(data.car.name).toBe(payload.name);
  });

  it("POST /api/ads → 400 missing required fields", async () => {
    const res = await createAd(
      new Request("http://test/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // completely empty
      })
    );

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBe("Missing required fields.");
  });
});
