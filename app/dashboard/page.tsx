"use client";

import React, { useEffect, useState } from "react";
import Protected from "../components/Protected";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Calendar, MapPin, DollarSign, Car, Plus } from "lucide-react";
import AddRentalCarForm from "../components/AddRentalCarForm";
import Image from "next/image";

interface RentalRequest {
  _id: string;
  carId: {
    title: string;
    location: string;
    images: string[];
  };
  renterId: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: "pending" | "approved" | "rejected" | "cancelled" | "completed";
}

interface UsedCar {
  _id: string;
  name: string;
  price: string;
  city: string;
  images: string[];
}

interface RentalCar {
  _id: string;
  title: string;
  location: string;
  pricePerDay: number;
  images: string[];
  availability: boolean;
  ownerId: {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
}

interface SectionState {
  data: any[];
  loading: boolean;
  error: string | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [sections, setSections] = useState({
    myRentalRequests: { data: [], loading: true, error: null } as SectionState,
    receivedRentalRequests: { data: [], loading: true, error: null } as SectionState,
    myUsedCars: { data: [], loading: true, error: null } as SectionState,
    myRentalCars: { data: [], loading: true, error: null } as SectionState,
  });
  const [showAddRentalForm, setShowAddRentalForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const updateSection = (section: keyof typeof sections, updates: Partial<SectionState>) => {
    setSections(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  const fetchAllData = async () => {
    // Fetch my rental requests
    fetchData(
      'myRentalRequests',
      () => axios.get(`/api/rentals/${user?._id}`),
      data => data.rentals
    );

    // Fetch received rental requests
    fetchData(
      'receivedRentalRequests',
      () => axios.get(`/api/rentals/received/${user?._id}`),
      data => data.rentals
    );

    // Fetch my used cars
    fetchData(
      'myUsedCars',
      () => axios.get(`/api/ads/my-cars/${user?._id}`),
      data => data.cars
    );

    // Fetch my rental cars
    fetchData(
      'myRentalCars',
      () => axios.get(`/api/cars/rental-by-owner/${user?._id}`),
      data => data.cars
    );
  };

  const fetchData = async (
    section: keyof typeof sections,
    apiCall: () => Promise<any>,
    dataExtractor: (data: any) => any[]
  ) => {
    try {
      updateSection(section, { loading: true, error: null });
      const response = await apiCall();

      updateSection(section, {
        data: dataExtractor(response.data) || [],
        loading: false
      });
    } catch (error) {
      console.error(`Error fetching ${section}:`, error);
      updateSection(section, {
        error: `Failed to fetch ${section}. Please try again.`,
        loading: false
      });
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      await axios.put(`/api/rentals/${requestId}`, { status: newStatus });
      toast.success("Rental status updated successfully");
      fetchAllData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update rental status");
    }
  };

  const handleToggleAvailability = async (carId: string, currentAvailability: boolean) => {
    try {
      const newAvailability = !currentAvailability;

      // Send the update request to the backend
      const response = await axios.put(`/api/cars/update-availability/${carId}`, {
        availability: newAvailability
      });

      if (response.status === 200) {
        // Update the UI by fetching the updated data
        toast.success(`Car marked as ${newAvailability ? 'Available' : 'Unavailable'}`);
        fetchAllData(); // Re-fetch the data to show the updated availability
      } else {
        toast.error('Failed to update car availability');
      }
    } catch (error) {
      console.error("Error toggling availability", error);
      toast.error("Failed to toggle availability");
    }
  };


  const renderSection = (
    title: string,
    section: SectionState,
    emptyMessage: string,
    content: (data: any[]) => JSX.Element) => {
    if (section.loading) {
      return (
        <div className="bg-white rounded-xl p-6 shadow-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      );
    }

    if (section.error) {
      return (
        <div className="bg-white rounded-xl p-6 shadow-md text-center">
          <p className="text-red-600 mb-4">{section.error}</p>
          <button
            onClick={fetchAllData}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    if (section.data.length === 0) {
      return (
        <div className="bg-white rounded-xl p-6 shadow-md text-center">
          <Car className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      );
    }

    return content(section.data);
  };

  return (
    <Protected>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 px-6 py-10">
        <div className="mt-[7rem] max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">My Dashboard</h1>

          {/* My Rental Cars Section */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">My Rental Cars</h2>
              <button
                onClick={() => setShowAddRentalForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Car for Rent
              </button>
            </div>

            {renderSection(
              "My Rental Cars",
              sections.myRentalCars,
              "You haven't added any cars for rent yet.",
              (cars: RentalCar[]) => (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cars.map((car) => (
                    <div key={car._id} className="bg-white rounded-xl shadow-md overflow-hidden">
                      <div className="relative h-48">
                        <Image
                          src={/*car.images[0] ||*/ "/haval.png"}
                          alt={car.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-xl font-semibold mb-2">{car.title}</h3>
                        <p className="text-gray-600 mb-2">{car.location}</p>
                        <p className="text-teal-600 font-semibold">Rs. {car.pricePerDay}/day</p>
                        <p className={`mt-2 ${car.availability ? 'text-green-600' : 'text-red-600'}`}>
                          {car.availability ? 'Available' : 'Not Available'}
                        </p>

                        {/* Button to toggle availability */}
                        <button
                          onClick={() => handleToggleAvailability(car._id, car.availability)}
                          className={`mt-4 px-4 py-2 text-white rounded-lg ${car.availability ? 'bg-red-600' : 'bg-green-600'} hover:${car.availability ? 'bg-red-700' : 'bg-green-700'} transition-colors`}
                        >
                          {car.availability ? 'Mark as Unavailable' : 'Mark as Available'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </section>

          {/* Received Rental Requests Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Rental Requests Received</h2>
            {renderSection(
              "Received Rental Requests",
              sections.receivedRentalRequests,
              "No rental requests received yet.",
              (requests: RentalRequest[]) => (
                <div className="grid grid-cols-1 gap-6">
                  {requests.map((request) => (
                    <div key={request._id} className="bg-white rounded-xl shadow-md p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{request.carId?.title}</h3>
                          <p className="text-gray-600">Requested by: {request.renterId?.name}</p>
                          <p className="text-gray-600">Contact: {request.renterId?.phoneNumber}</p>
                          <div className="mt-2 space-y-1">
                            <p className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                            </p>
                            <p className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              Rs. {request.totalPrice}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${request.status === "approved" ? "bg-green-100 text-green-800" :
                            request.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                              request.status === "rejected" ? "bg-red-100 text-red-800" :
                                request.status === "cancelled" ? "bg-gray-100 text-gray-800" :
                                  "bg-blue-100 text-blue-800"
                          }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>

                      {request.status === "pending" && (
                        <div className="mt-4 flex gap-3">
                          <button
                            onClick={() => handleStatusUpdate(request._id, "approved")}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(request._id, "rejected")}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {request.status === "approved" && (
                        <button
                          onClick={() => handleStatusUpdate(request._id, "completed")}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}
          </section>

          {/* My Rental Requests Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Rental Requests</h2>
            {renderSection(
              "My Rental Requests",
              sections.myRentalRequests,
              "You haven't made any rental requests yet.",
              (requests: RentalRequest[]) => (
                <div className="grid grid-cols-1 gap-6">
                  {requests.map((request) => (
                    <div key={request._id} className="bg-white rounded-xl shadow-md p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{request.carId?.title}</h3>
                          <div className="mt-2 space-y-1">
                            <p className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {request.carId?.location}
                            </p>
                            <p className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                            </p>
                            <p className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              Rs. {request.totalPrice}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${request.status === "approved" ? "bg-green-100 text-green-800" :
                            request.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                              request.status === "rejected" ? "bg-red-100 text-red-800" :
                                request.status === "cancelled" ? "bg-gray-100 text-gray-800" :
                                  "bg-blue-100 text-blue-800"
                          }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>

                      {request.status === "pending" && (
                        <button
                          onClick={() => handleStatusUpdate(request._id, "cancelled")}
                          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}
          </section>

          {/* My Used Cars Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Used Cars For Sale</h2>
            {renderSection(
              "My Used Cars",
              sections.myUsedCars,
              "You haven't listed any cars for sale yet.",
              (cars: UsedCar[]) => (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cars.map((car) => (
                    <div key={car._id} className="bg-white rounded-xl shadow-md overflow-hidden">
                      <div className="relative h-48">
                        <Image
                          src={car.images[0] || "/haval.png"}
                          alt={car.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-xl font-semibold mb-2">{car.name}</h3>
                        <p className="text-gray-600 mb-2">{car.city}</p>
                        <p className="text-teal-600 font-semibold">Rs. {car.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </section>
        </div>
      </div>

      {showAddRentalForm && (
        <AddRentalCarForm
          setShowPopup={setShowAddRentalForm}
          onCarAdded={fetchAllData}
        />
      )}
    </Protected>
  );
};

export default Dashboard;