"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MapPin, Calendar, Gauge, Car, X, Phone, MessageSquare } from "lucide-react";

interface UsedCarType {
  id: string;
  name: string;
  images: string[];
  price: string;
  mileage: string;
  modelYear: number;
  city: string;
  phone: string;
  comments: string;
}

const parseNumber = (str: string) => parseInt(str.replace(/[^0-9]/g, "")) || 0;

const UsedCarsPage = () => {
  const [cars, setCars] = useState<UsedCarType[]>([]);
  const [filters, setFilters] = useState({
    city: "",
    modelYear: "",
    mileage: "",
    name: "",
  });
  const [sortKey, setSortKey] = useState<string>("");
  const [selectedCar, setSelectedCar] = useState<UsedCarType | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await fetch("/api/ads", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Failed to fetch cars");
        }
        const data = await res.json();
        setCars(data.cars);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while fetching cars.");
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredCars = cars.filter((car) => {
    return (filters.city === "" || car.city.toLowerCase().includes(filters.city.toLowerCase())) && (filters.modelYear === "" || car.modelYear === parseInt(filters.modelYear)) && (filters.name === "" || car.name.toLowerCase().includes(filters.name.toLowerCase()));
  });

  if (sortKey === "price") {
    filteredCars.sort((a, b) => parseNumber(a.price) - parseNumber(b.price));
  } else if (sortKey === "mileage") {
    filteredCars.sort((a, b) => parseNumber(a.mileage) - parseNumber(b.mileage));
  } else if (sortKey === "modelYear") {
    filteredCars.sort((a, b) => a.modelYear - b.modelYear);
  }

  const images = ["/haval.png", "/haval2.png", "/haval.png", "/haval2.png"];

  const nextImage = () => {
    setCarouselIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCarouselIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading cars...</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-10 min-h-screen bg-gradient-to-b from-white to-gray-100 relative">
      <h1 className="mt-[7rem] text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-800 to-cyan-600 mb-10">Used Cars</h1>

      <p className="font-light text-sm mb-4 ml-1 text-gray-600">
        Showing {filteredCars.length} results out of {cars.length}.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input type="text" name="name" placeholder="Search by name" value={filters.name} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg shadow-sm w-full sm:w-auto" />
        <input type="text" name="city" placeholder="Search by city" value={filters.city} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg shadow-sm w-full sm:w-auto" />
        <input type="number" name="modelYear" placeholder="Model Year" value={filters.modelYear} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg shadow-sm w-full sm:w-auto" />
      </div>

      {/* Sorting Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button onClick={() => setSortKey("price")} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm shadow">
          Sort by Price
        </button>
        <button onClick={() => setSortKey("mileage")} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm shadow">
          Sort by Mileage
        </button>
        <button onClick={() => setSortKey("modelYear")} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm shadow">
          Sort by Model Year
        </button>
      </div>

      {/* Car List */}
      <div className="flex flex-col gap-8">
        {filteredCars.map((car, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition cursor-pointer"
            onClick={() => {
              setSelectedCar(car);
              setCarouselIndex(0);
            }}
          >
            <Image src="/haval.png" alt={car.name} width={400} height={250} className="object-cover rounded-xl" />
            <div className="flex flex-col justify-between gap-2 text-gray-800">
              <h2 className="text-2xl font-semibold flex items-center gap-2 text-teal-700">
                <Car className="w-6 h-6" /> {car.name}
              </h2>
              <p className="text-lg font-medium text-cyan-700">Rs. {car.price}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Gauge className="w-4 h-4 text-gray-500" /> {car.mileage}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-500" /> {car.modelYear}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-500" /> {car.city}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Popup Modal */}
      {selectedCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl relative mt-[5rem]">
            <button onClick={() => setSelectedCar(null)} className="absolute top-4 right-4 text-gray-500 hover:text-red-600 z-50 ">
              <X className="w-6 h-6" />
            </button>

            {/* Image Carousel */}
            <div className="relative mb-6">
              <Image src={images[carouselIndex]} alt={selectedCar.name} width={600} height={350} className="object-cover rounded-lg w-full" />
              <button onClick={prevImage} className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow">
                {"<"}
              </button>
              <button onClick={nextImage} className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow">
                {">"}
              </button>
            </div>

            {/* Car Details */}
            <h2 className="text-3xl font-bold mb-2 text-teal-700">{selectedCar.name}</h2>
            <p className="text-lg font-semibold text-cyan-700 mb-4">Rs. {selectedCar.price}</p>

            <div className="flex flex-col gap-2 text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5" /> Mileage: {selectedCar.mileage}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Model Year: {selectedCar.modelYear}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" /> City: {selectedCar.city}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" /> Contact: {selectedCar.phone}
              </div>
              <div className="flex items-start gap-2">
                <MessageSquare className="w-5 h-5 mt-1" /> <span>{selectedCar.comments}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsedCarsPage;
