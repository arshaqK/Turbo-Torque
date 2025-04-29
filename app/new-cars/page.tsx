"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BrandType } from "@/types";
import Image from "next/image";

interface CarType {
  id: string;
  name: string;
  image: string;
  price: string;
}

const placeholderCars: CarType[] = [
  {
    id: "1",
    name: "H6 HEV",
    image: "/haval.png",
    price: "Rs. 12,500,000",
  },
  {
    id: "2",
    name: "H6 HEV",
    image: "/haval.png",
    price: "Rs. 12,500,000",
  },
  {
    id: "3",
    name: "H6 HEV",
    image: "/haval.png",
    price: "Rs. 12,500,000",
  },
];

const NewCarsPage = () => {
  const [brands, setBrands] = useState<Array<BrandType>>([]);
  const [selectedBrand, setSelectedBrand] = useState<BrandType | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [newCars, setNewCars] = useState<Array<CarType>>([]);

  useEffect(() => {
    fetchBrands();
    fetchNewCars();
  }, []);

  const fetchBrands = async () => {
    try {
      const data = await axios.get("/api/brands");
      setBrands(data.data.brands);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const fetchNewCars = async () => {
    try {
      const data = await axios.get("/api/cars"); // API endpoint to fetch new cars
      setNewCars(data.data.cars); // Set the dynamic car data
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching cars");
    }
  };

  const handleBrandClick = (brand: BrandType) => {
    setSelectedBrand(brand);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedBrand(null);
  };

  return (
    <div className="flex flex-col gap-6 px-6 py-10 items-center min-h-screen justify-center">
      <h1 className="mt-[7rem] text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-900 to-cyan-800">New Cars</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-6 w-full max-w-6xl">
        {brands.map((brand) => (
          <div key={brand._id} onClick={() => handleBrandClick(brand)} className="cursor-pointer bg-white rounded-xl shadow-md border border-gray-200 p-4 flex flex-col items-center hover:shadow-lg transition duration-300">
            <div className="w-20 h-20 mb-2 relative">
              <Image src={brand.logo} alt={brand.name} width={100} height={100} className="object-contain" />
            </div>
            <p className="text-lg font-medium text-gray-700 text-center">{brand.name}</p>
          </div>
        ))}
      </div>

      {showPopup && selectedBrand && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl relative">
            <button onClick={closePopup} className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-2xl font-bold">
              &times;
            </button>

            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Cars by {selectedBrand.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {placeholderCars.map((car) => (
                <div key={car.id} className="bg-white rounded-xl shadow border p-4 w-full h-full flex flex-col items-center text-center">
                  <Image src={car.image} alt={car.name} width={500} height={200} className="mb-3" />
                  <h3 className="text-xl font-semibold text-gray-800">{car.name}</h3>
                  <p className="text-gray-600 text-lg">{car.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Render Newly Fetched Cars Below the Popup */}
      <div className="mt-10 w-full max-w-6xl">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Explore New Cars</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {newCars.length > 0 ? (
            newCars.map((car, index) => (
              <div key={index} onClick={() => handleBrandClick(brands[0])} className="bg-white rounded-xl shadow-md border p-4 flex flex-col items-center hover:shadow-lg transition duration-300">
                <div className="w-44 h-44 relative">
                  <Image src={"/haval.png"} alt={"asd"} width={500} height={500} className="object-contain" />
                </div>
                <p className="text-lg font-medium text-gray-700 text-center">{car.title}</p>
                <p className="text-gray-600 text-center">Rs. {car.price}</p>
              </div>
            ))
          ) : (
            <div className="w-full text-center text-gray-600">No cars available at the moment.</div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mt-16 text-center text-gray-700">
        <h3 className="text-2xl font-semibold mb-4">Explore the Latest Innovations</h3>
        <p className="mb-4">Discover a range of premium vehicles that combine luxury, performance, and cutting-edge technology. Our brand partners deliver some of the most impressive models in the automotive world.</p>
        <p className="mb-4">Whether you&#39;re looking for efficiency, comfort, or sheer power, our curated selection of new cars has something to match your lifestyle. Choose a brand to get started and explore what’s new in the world of driving.</p>
        <p>Stay tuned as we update our listings with the latest arrivals and offers from our trusted brand partners.</p>
      </div>
    </div>
  );
};

export default NewCarsPage;
