import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import { useAuth } from "@/context/AuthContext";

interface Props {
  setShowPopup: (value: boolean) => void;
  onCarAdded: () => void;
}

const AddRentalCarForm = ({ setShowPopup, onCarAdded }: Props) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    pricePerDay: "",
    images: [] as File[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user) {
        toast.error("User not found");
        return;
      }

      const newCar = {
        ownerId: user._id,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        price: 0,
        pricePerDay: parseFloat(formData.pricePerDay),
        images: ["/haval.png"],
        isForSale: false,
        isForRent: true,
      };

      await axios.post("/api/cars", newCar);
      toast.success("Car added successfully for rent!");
      onCarAdded();
      setShowPopup(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add car for rent");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-md relative">
        <button onClick={() => setShowPopup(false)} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
          <IoClose className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center">Add Car for Rent</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Car Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            rows={3}
          />

          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />

          <input
            type="number"
            name="pricePerDay"
            placeholder="Price per Day"
            value={formData.pricePerDay}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />

          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Add Car
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRentalCarForm;