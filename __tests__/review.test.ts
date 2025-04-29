// __tests__/review.test.ts

// Mocks
jest.mock("@/db/connectDB", () => jest.fn());
jest.mock("@/models/Review", () => ({ find: jest.fn(), create: jest.fn() }));
jest.mock("@/models/RentalRequest", () => ({ findById: jest.fn() }));

import connectDB from "@/db/connectDB";
import Review from "@/models/Review";
import RentalRequest from "@/models/RentalRequest";
import { GET as getCarReviews } from "@/app/api/review/car/[carId]/route";
import { GET as getRenterReviews } from "@/app/api/review/renter/[renterId]/route";
import { POST as addReview } from "@/app/api/review/route";

// Silence console during tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

type Params = { params: { carId?: string; renterId?: string } };

const mockPopulate = (value: any) => jest.fn().mockResolvedValue(value);

describe("Reviews API (mocked)", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("GET /api/review/car/[carId]", () => {
    const carId = 'car123';
    const req = new Request(`http://test/review/car/${carId}`);
    const params: Params = { params: { carId } };

    it("returns 200 and empty array when no reviews", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Review.find as jest.Mock).mockReturnValue({ populate: mockPopulate([]) });

      const res = await getCarReviews(req, params);
      expect(connectDB).toHaveBeenCalled();
      expect(Review.find).toHaveBeenCalledWith({ carId, reviewType: "car" });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.reviews)).toBe(true);
      expect(data.reviews).toHaveLength(0);
    });

    it("returns 404 when reviews is null", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Review.find as jest.Mock).mockReturnValue({ populate: mockPopulate(null) });

      const res = await getCarReviews(req, params);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.message).toBe("reviews not found");
    });

    it("returns 500 on DB connect error", async () => {
      (connectDB as jest.Mock).mockRejectedValue(new Error("connFail"));

      const res = await getCarReviews(req, params);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.message).toBe("Error fetching car reviews.");
    });

    it("returns 500 on populate error", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Review.find as jest.Mock).mockReturnValue({ populate: jest.fn().mockRejectedValue(new Error("popFail")) });

      const res = await getCarReviews(req, params);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.message).toBe("Error fetching car reviews.");
    });

    it("returns populated reviews", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      const fake = { _id: 'r1', reviewerId: { name: 'John' }, rating: 5, comment: 'Great' };
      (Review.find as jest.Mock).mockReturnValue({ populate: mockPopulate([fake]) });

      const res = await getCarReviews(req, params);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.reviews).toHaveLength(1);
      expect(data.reviews[0]).toMatchObject(fake);
    });
  });

  describe("GET /api/review/renter/[renterId]", () => {
    const renterId = 'user123';
    const req = new Request(`http://test/review/renter/${renterId}`);
    const params: Params = { params: { renterId } };

    it("returns 200 and empty array when no reviews", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Review.find as jest.Mock).mockReturnValue({ populate: mockPopulate([]) });

      const res = await getRenterReviews(req, params);
      expect(connectDB).toHaveBeenCalled();
      expect(Review.find).toHaveBeenCalledWith({ reviewedId: renterId, reviewType: "renter" });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.reviews)).toBe(true);
      expect(data.reviews).toHaveLength(0);
    });

    it("returns 404 when reviews is null", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Review.find as jest.Mock).mockReturnValue({ populate: mockPopulate(null) });

      const res = await getRenterReviews(req, params);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.message).toBe("reviews not found");
    });

    it("returns 500 on DB connect error", async () => {
      (connectDB as jest.Mock).mockRejectedValue(new Error("connFail"));

      const res = await getRenterReviews(req, params);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.message).toBe("Error fetching car reviews.");
    });

    it("returns 500 on populate error", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Review.find as jest.Mock).mockReturnValue({ populate: jest.fn().mockRejectedValue(new Error("popFail")) });

      const res = await getRenterReviews(req, params);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.message).toBe("Error fetching car reviews.");
    });

    it("returns populated reviews", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      const fake = { _id: 'r2', reviewerId: { name: 'Alice' }, rating: 4, comment: 'Good' };
      (Review.find as jest.Mock).mockReturnValue({ populate: mockPopulate([fake]) });

      const res = await getRenterReviews(req, params);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.reviews).toHaveLength(1);
      expect(data.reviews[0]).toMatchObject(fake);
    });
  });

  describe("POST /api/review", () => {
    const valid = {
      reviewerId: 'renter1',
      reviewedId: 'owner1',
      carId: 'car1',
      rentalId: 'rent1',
      rating: 4,
      comment: 'Good',
      reviewType: 'car',
    };

    it("returns 400 when fields missing", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      const req = { json: jest.fn().mockResolvedValue({}) } as any;
      const res = await addReview(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toBe("Missing required fields.");
    });

    it("returns 400 when rating out of range", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      const req = { json: jest.fn().mockResolvedValue({ ...valid, rating: 6 }) } as any;
      const res = await addReview(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toBe("Rating must be between 1 and 5.");
    });

    it("returns 404 when rental not found", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (RentalRequest.findById as jest.Mock).mockResolvedValue(null);
      const req = { json: jest.fn().mockResolvedValue(valid) } as any;
      const res = await addReview(req);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.message).toBe("Rental not found.");
    });

    it("returns 403 when renter not match for car review", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (RentalRequest.findById as jest.Mock).mockResolvedValue({ renterId: 'other', ownerId: 'owner1' });
      const req = { json: jest.fn().mockResolvedValue(valid) } as any;
      const res = await addReview(req);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.message).toBe("Only renters can review cars.");
    });

    it("returns 403 when owner not match for renter review", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      const payload = { ...valid, reviewType: 'renter' };
      (RentalRequest.findById as jest.Mock).mockResolvedValue({ renterId: 'renter1', ownerId: 'other' });
      const req = { json: jest.fn().mockResolvedValue(payload) } as any;
      const res = await addReview(req);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.message).toBe("Only owners can review renters.");
    });

    it("creates and returns new review", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (RentalRequest.findById as jest.Mock).mockResolvedValue({ renterId: 'renter1', ownerId: 'owner1' });
      const newReview = { _id: 'new1', ...valid };
      (Review.create as jest.Mock).mockResolvedValue(newReview);
      const req = { json: jest.fn().mockResolvedValue(valid) } as any;
      const res = await addReview(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.review).toEqual(newReview);
      expect(data.message).toBe("Review added successfully");
    });

    it("returns 500 on unexpected error", async () => {
      (connectDB as jest.Mock).mockRejectedValue(new Error("fail"));
      const req = { json: jest.fn().mockResolvedValue(valid) } as any;
      const res = await addReview(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.message).toBe("Error adding review.");
    });
  });
});