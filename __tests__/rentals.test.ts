// __tests__/rental.test.ts

// — Mocks —
jest.mock("@/db/connectDB", () => jest.fn(async () => {}));

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { GET as listCars, POST as createRental } from "@/app/api/rentals/route";
import { 
  GET as getRentalById,
  PUT as updateRental,
  DELETE as deleteRental,
} from "@/app/api/rentals/[id]/route";

import Car from "@/models/Car";
import User from "@/models/User";
import RentalRequest from "@/models/RentalRequest";

describe("Rentals API", () => {
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

  describe("GET /api/rentals", () => {
    it("should return empty list when no cars for rent", async () => {
      const res = await listCars();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.car)).toBe(true);
      expect(data.car.length).toBe(0);
    });

    it("should return cars marked for rent", async () => {
      const car = await Car.create({
        _id: new mongoose.Types.ObjectId(),
        ownerId: new mongoose.Types.ObjectId(),
        make: "TestMake",
        model: "TestModel",
        isForRent: true,
        title: "TestTitle",
        location: "TestLocation",
      });

      const res = await listCars();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.car)).toBe(true);
      expect(data.car.length).toBe(1);
      expect(data.car[0]._id).toBe(car._id.toString());
    });
  });

  describe("POST /api/rentals", () => {
    const validPayload = {
      renterId: new mongoose.Types.ObjectId().toString(),
      carId: new mongoose.Types.ObjectId().toString(),
      startDate: "2025-05-01",
      endDate: "2025-05-10",
      totalPrice: 500,
    };

    it("should return 400 when fields are missing", async () => {
      const res = await createRental(new Request("http://test/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }));
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toBe("All fields are required");
    });

    it("should return 400 on invalid date range", async () => {
      const payload = { ...validPayload, startDate: "2025-05-10", endDate: "2025-05-01" };
      const res = await createRental(new Request("http://test/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }));
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toBe("Invalid date range");
    });

    it("should return 404 if car not available for rent", async () => {
      const res = await createRental(new Request("http://test/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validPayload),
      }));
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.message).toBe("Car not available for rent");
    });

    it("should return 400 when overlapping approved rental exists", async () => {
      // Seed car and overlapping rental
      const carId = new mongoose.Types.ObjectId();
      await Car.create({ 
        _id: carId, 
        ownerId: new mongoose.Types.ObjectId(), 
        isForRent: true,
        title: "OverlapTest",
        location: "OverlapLocation"
      });
      await RentalRequest.create({
        renterId: new mongoose.Types.ObjectId(),
        carId,
        ownerId: new mongoose.Types.ObjectId(),
        startDate: "2025-05-01",
        endDate: "2025-05-10",
        totalPrice: 400,
        status: "approved",
      });

      const payload = { ...validPayload, carId: carId.toString() };
      const res = await createRental(new Request("http://test/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }));
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toBe("Car is already rented during the selected dates");
    });

    it("should return 404 when renter not found", async () => {
      const carId = new mongoose.Types.ObjectId();
      await Car.create({ 
        _id: carId, 
        ownerId: new mongoose.Types.ObjectId(), 
        isForRent: true,
        title: "NoRenterTest",
        location: "NoRenterLocation"
      });

      const payload = { ...validPayload, carId: carId.toString() };
      const res = await createRental(new Request("http://test/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }));
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.message).toBe("Renter not found");
    });

    it("should create rental request for valid input", async () => {
      // Seed car and renter
      const renter = await User.create({
        _id: new mongoose.Types.ObjectId(),
        name: "Bob",
        email: "bob@example.com",
        phoneNumber: "123-4567",
        password: "password123",
      });
      const owner = new mongoose.Types.ObjectId();
      const car = await Car.create({ 
        _id: new mongoose.Types.ObjectId(), 
        ownerId: owner, 
        isForRent: true,
        title: "ValidTest",
        location: "ValidLocation"
      });

      const payload = {
        renterId: renter._id.toString(),
        carId: car._id.toString(),
        startDate: "2025-06-01",
        endDate: "2025-06-05",
        totalPrice: 600,
      };
      const res = await createRental(new Request("http://test/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }));
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.message).toBe("Rental request created");
      expect(data.rentalRequest).toHaveProperty("_id");
      expect(data.rentalRequest.status).toBe("pending");
    });
  });

  describe("GET /api/rentals/[id]", () => {
    it("should fetch a specific rental with populated fields", async () => {
      const renter = await User.create({ name: "Alice", email: "a@example.com", phoneNumber: "555-0000", password: "alicepass" });
      const owner = await User.create({ name: "Owner", email: "o@example.com", phoneNumber: "555-1111", password: "ownerpass" });
      const car = await Car.create({ 
        ownerId: owner._id, 
        make: "X", 
        model: "Y", 
        isForRent: true,
        title: "FetchTest",
        location: "FetchLocation"
      });
      const rental = await RentalRequest.create({
        renterId: renter._id,
        ownerId: owner._id,
        carId: car._id,
        startDate: "2025-07-01",
        endDate: "2025-07-10",
        totalPrice: 800,
        status: "pending",
      });

      const res = await getRentalById(new Request("http://test/rentals/" + rental._id), { params: { id: rental._id.toString() } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.rentals._id).toBe(rental._id.toString());
      expect(data.rentals.renterId.name).toBe("Alice");
      expect(data.rentals.ownerId.name).toBe("Owner");
      expect(data.rentals.carId._id).toBe(car._id.toString());
    });
  });

  describe("PUT /api/rentals/[id]", () => {
    it("should update rental status", async () => {
      const rental = await RentalRequest.create({
        renterId: new mongoose.Types.ObjectId(),
        ownerId: new mongoose.Types.ObjectId(),
        carId: new mongoose.Types.ObjectId(),
        startDate: "2025-08-01",
        endDate: "2025-08-05",
        totalPrice: 300,
        status: "pending",
      });

      const res = await updateRental(
        new Request("http://test/rentals/" + rental._id, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "approved" }),
        }),
        { params: { id: rental._id.toString() } }
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.updatedRental.status).toBe("approved");
    });

    it("should return 400 for invalid status", async () => {
      const rental = await RentalRequest.create({
        renterId: new mongoose.Types.ObjectId(),
        ownerId: new mongoose.Types.ObjectId(),
        carId: new mongoose.Types.ObjectId(),
        startDate: "2025-08-01",
        endDate: "2025-08-05",
        totalPrice: 300,
        status: "pending",
      });

      const res = await updateRental(
        new Request("http://test/rentals/" + rental._id, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "unknown" }),
        }),
        { params: { id: rental._id.toString() } }
      );

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toBe("Invalid status");
    });

    it("should return 404 when rental not found", async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await updateRental(
        new Request("http://test/rentals/" + id, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "approved" }),
        }),
        { params: { id } }
      );
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.message).toBe("Rental request not found");
    });
  });

  describe("DELETE /api/rentals/[id]", () => {
    it("should delete a rental request", async () => {
      const rental = await RentalRequest.create({
        renterId: new mongoose.Types.ObjectId(),
        ownerId: new mongoose.Types.ObjectId(),
        carId: new mongoose.Types.ObjectId(),
        startDate: "2025-09-01",
        endDate: "2025-09-05",
        totalPrice: 450,
        status: "pending",
      });

      const res = await deleteRental(
        new Request("http://test/rentals/" + rental._id, { method: "DELETE" }),
        { params: { id: rental._id.toString() } }
      );
      expect(res.status).toBe(200);
      const data = await res.json();
    })
})
})