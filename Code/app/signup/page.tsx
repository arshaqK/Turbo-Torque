"use client";

// React
import React, { useState, useRef, useEffect } from "react";

// Next JS
import Form from "next/form";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Dependencies
import { toast } from "react-toastify";
import axios from "axios";

// Contexts
import { useAuth } from "@/context/AuthContext";

// Icons
import { RiErrorWarningLine } from "react-icons/ri";
import { AiOutlineCloudUpload } from "react-icons/ai";

const SignUp = () => {
  // Types
  interface FormData {
    name: string;
    email: string;
    phoneNumber?: string;
    logo?: string;
    password: string;
    reenterPassword: string;
  }

  // Hooks
  const { user, setUser, isLoading } = useAuth();
  const router = useRouter();

  // Refs
  const formRef = useRef<HTMLFormElement>(null);

  // States
  const [isUser, setIsUser] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phoneNumber: "",
    logo: "",
    password: "",
    reenterPassword: "",
  });

  // Only activates once the form is submitted once
  const [isFormTriggered, setIsFormTriggered] = useState(false);
  const [samePasswords, setSamePasswords] = useState(true);

  const [isName, setIsName] = useState(true);
  const [isEmail, setIsEmail] = useState(true);
  const [isPhoneNumber, setIsPhoneNumber] = useState(true);
  const [isLogo, setIsLogo] = useState<boolean | null>(null);
  const [logoError, setLogoError] = useState("Please provide a logo.");
  const [isPassword, setIsPassword] = useState(true);
  const [isReenterPassword, setIsReenterPassword] = useState(true);

  const [existingEmail, setExistingEmail] = useState(false);
  const [existingPhoneNumber, setExistingPhoneNumber] = useState(false);

  // Effects
  useEffect(() => {
    // If the user is already logged in, redirect them to the home page
    if (user && !isLoading && typeof window !== "undefined" && window.location.pathname === "/signup") {
      router.push("/");
    }
  }, [user, isLoading, router]);

  // Functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Updates the specific field in the form data
    setFormData((prevState) => ({ ...prevState, [name]: value }));

    // Check if all the fields are present
    if (!isName && name === "name") setIsName(true);
    if (!isEmail && name === "email") setIsEmail(true);
    if (!isPhoneNumber && name === "phoneNumber") setIsPhoneNumber(true);
    if (!isPassword && name === "password") setIsPassword(true);
    if (!isReenterPassword && name === "reenterPassword") setIsReenterPassword(true);

    // Check if the passwords match
    if (isFormTriggered && (name === "password" || name === "reenterPassword")) {
      let arePasswordsSame = false;

      if (name === "password") arePasswordsSame = value === formData.reenterPassword;
      else if (name === "reenterPassword") arePasswordsSame = formData.password === value;

      setSamePasswords(arePasswordsSame);
    }

    // Check if the email or phone number were already existing
    if (existingEmail) setExistingEmail(false);
    if (existingPhoneNumber) setExistingPhoneNumber(false);
  };

  const handleFormSubmit = async () => {
    if (!formRef.current) return;
    setIsFormTriggered(true);

    // Check if all the fields are present
    if (!formData.name || !formData.email || !formData.password || !formData.reenterPassword || (!isUser && !formData.logo) || (isUser && !formData.phoneNumber)) {
      if (!formData.name) setIsName(false);
      else if (!formData.email) setIsEmail(false);
      else if (!formData.phoneNumber) setIsPhoneNumber(false);
      else if (!formData.password) setIsPassword(false);
      else if (!formData.reenterPassword) setIsReenterPassword(false);
      else if (!formData.logo) {
        setIsLogo(false);
        setLogoError("Please provide a logo.");
      }

      return;
    }

    // Check if the passwords match
    if (formData.password !== formData.reenterPassword) {
      setSamePasswords(false);
      return;
    }

    formRef.current.reset();

    // Clean up the form data
    if (isUser) delete formData.logo;
    else delete formData.phoneNumber;

    // Convert the logo to a base64 string (if required)
    // if (!isUser) {
    //   const logoFile = formData.logo;
    //   const reader = new FileReader();
    // }

    // Now, hit a backend request to sign up the user
    try {
      const endpoint = `/api/${isUser ? "users" : "brands"}/auth/signup`;
      const response = await axios.post(`/api/${endpoint}/auth/signup`, formData);

      if (isUser) setUser(response.data.user);

      router.push(isUser ? "/" : "/not-verified");
      toast.success("Account created successfully!");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data;

        if (errorData?.message === "Existing email.") setExistingEmail(true);
        else if (errorData?.message === "Existing phone number.") setExistingPhoneNumber(true);
      } else {
        console.error("Form Submission Error:", error instanceof Error ? error.message : error);
        toast.error("An unknown error occurred. Please try again later.");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Pass the dropped file to the existing handleLogoInput function
      const fakeEvent = {
        target: {
          files: e.dataTransfer.files,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      handleLogoInput(fakeEvent);
    }
  };

  const handleLogoInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes("image/webp")) {
      setLogoError("Please upload a WebP image file.");
      setIsLogo(false);
      return;
    }

    // Create a URL for the selected image
    const imageUrl = URL.createObjectURL(file);

    // Create an image element to check dimensions
    const img = document.createElement("img");

    img.onload = async () => {
      // Check if dimensions match requirements
      if (img.width !== 1080 || img.height !== 1080) {
        setLogoError("Image dimensions must be 1080 x 1080 pixels.");
        setIsLogo(false);
        URL.revokeObjectURL(imageUrl); // Avoid memory leaks
        return;
      }

      // Create FormData object
      const formData = new FormData();

      // Append the file to FormData
      formData.append("logo", file);

      try {
        // Send the file to the server using Axios
        const response = await axios.post("/api/brands/upload-logo", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // Handle the server response
        if (response.data.success) {
          setFormData((prevState) => ({
            ...prevState,
            logo: response.data.fileUrl, // Store the file URL returned by the server
          }));
          setIsLogo(true);
        } else {
          setLogoError("Failed to upload the logo.");
          setIsLogo(false);
        }
      } catch (error) {
        console.error("Error uploading logo:", error);
        setLogoError("There was an error uploading your logo.");
        setIsLogo(false);
      }

      URL.revokeObjectURL(imageUrl); // Avoid memory leaks
    };

    img.onerror = () => {
      toast.error("There was an error processing your image.");
      URL.revokeObjectURL(imageUrl);
    };

    img.src = imageUrl;
  };

  return (
    <div className="flex flex-col gap-[2rem] items-center justify-start min-h-[100vh]">
      <h1 className="text-4xl font-semibold text-neutral-800 mt-[8rem]">{isUser ? "User" : "Brand"} account</h1>

      <span className="flex flex-row gap-[0.5rem] -mt-[1.25rem] text-sm font-light">
        Not a {isUser ? "user" : "brand"}?
        <button onClick={() => setIsUser(!isUser)} className="text-[#10a37f] cursor-pointer">
          Switch to a {isUser ? "brand" : "user"} account
        </button>
      </span>

      <Form ref={formRef} action={handleFormSubmit} className="flex flex-col gap-[1rem] w-[25vw] justify-center items-center">
        {/* Name Input */}
        <input name="name" type="text" className={`rounded-md px-4 py-3 border-[1px] ${isName ? "border-neutral-300 focus:border-[#10a37f]" : "border-red-500"} focus:outline-none w-full`} placeholder={`${isUser ? "Full " : ""}Name`} value={formData.name} onChange={handleInputChange} />

        {!isName && (
          <span className="flex flex-row gap-1 justify-center items-center text-red-500 text-sm font-light">
            <RiErrorWarningLine className="text-lg" />
            Please provide a name.
          </span>
        )}

        {/* Email Input */}
        <input name="email" type="email" className={`rounded-md px-4 py-3 border-[1px] ${isEmail && !existingEmail ? "border-neutral-300 focus:border-[#10a37f]" : "border-red-500"} focus:outline-none w-full`} placeholder="Email Address" value={formData.email} onChange={handleInputChange} />

        {(!isEmail || existingEmail) && (
          <span className="flex flex-row gap-1 justify-center items-center text-red-500 text-sm font-light">
            <RiErrorWarningLine className="text-lg" />
            {!isEmail ? "Please provide an email." : "This email is already being used."}
          </span>
        )}

        {/* Phone Number Input */}
        {isUser && <input name="phoneNumber" type="text" className={`rounded-md px-4 py-3 border-[1px] ${isPhoneNumber && !existingPhoneNumber ? "border-neutral-300 focus:border-[#10a37f]" : "border-red-500"} focus:outline-none w-full`} placeholder="Phone Number" value={formData.phoneNumber} onChange={handleInputChange} />}

        {/* Logo */}
        {!isUser && (
          <>
            {!isLogo ? (
              <>
                <label htmlFor="dropzone-file" onDragOver={handleDragOver} onDrop={handleDrop} className={`relative flex flex-col items-center justify-center w-full h-fit min-h-[15rem] p-[3rem] border-[1px] ${isLogo === null || isLogo ? "border-neutral-300" : "border-red-500"} rounded-md cursor-pointer hover:bg-gray-100 transition duration-300`}>
                  <div className="flex flex-col items-center justify-center gap-[1rem] cursor-pointer">
                    <AiOutlineCloudUpload className="text-6xl text-gray-400" />

                    <div className="flex flex-col gap-1 justify-center items-center">
                      <p className="text-sm text-neutral-500">
                        <span className="font-semibold">Logo: </span>Click to upload or drag and drop
                      </p>

                      <p className="text-xs text-gray-500">WebP (1080 x 1080 px)</p>
                    </div>
                  </div>
                </label>
              </>
            ) : (
              <label htmlFor="dropzone-file" onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => document.getElementById("dropzone-file")?.click()} className={`relative flex flex-col items-center justify-center w-full h-fit min-h-[15rem] p-[3rem] border-[1px] border-neutral-300 rounded-md cursor-pointer hover:bg-gray-100 transition duration-300`}>
                <Image src="/logo.webp" alt="logo-image" priority fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-contain" />
              </label>
            )}

            <input id="dropzone-file" type="file" className="hidden" placeholder="Phone Number" onChange={handleLogoInput} />
          </>
        )}

        {(!isPhoneNumber || existingPhoneNumber || (isLogo !== null && !isLogo)) && (
          <span className="flex flex-row gap-1 justify-center items-center text-red-500 text-sm font-light">
            <RiErrorWarningLine className="text-lg" />
            {!isPhoneNumber ? "Please provide an phone number." : existingPhoneNumber ? "This number is already being used." : logoError}
          </span>
        )}

        {/* Password Input */}
        <input name="password" type="password" className={`rounded-md px-4 py-3 border-[1px] ${isPassword && samePasswords ? "border-neutral-300 focus:border-[#10a37f]" : "border-red-500"}  focus:outline-none w-full`} placeholder="Password" value={formData.password} onChange={handleInputChange} />

        {!isPassword && (
          <span className="flex flex-row gap-1 justify-center items-center text-red-500 text-sm font-light">
            <RiErrorWarningLine className="text-lg" />
            Please provide a password.
          </span>
        )}

        {/* Re-enter Password Input */}
        <input name="reenterPassword" type="password" className={`rounded-md px-4 py-3 border-[1px] ${isReenterPassword && samePasswords ? "border-neutral-300 focus:border-[#10a37f]" : "border-red-500"}  focus:outline-none w-full`} placeholder="Re-enter password" value={formData.reenterPassword} onChange={handleInputChange} />

        {(!samePasswords || !isReenterPassword) && (
          <span className="flex flex-row gap-1 justify-center items-center text-red-500 text-sm font-light">
            <RiErrorWarningLine className="text-lg" />
            {!samePasswords ? "Passwords do not match." : "Please re-enter your password."}
          </span>
        )}

        {/* Submit Button */}
        <button disabled={!samePasswords || !isName || !isEmail || !isPhoneNumber || !isPassword || !isReenterPassword || existingEmail || existingPhoneNumber} type="submit" className={`bg-[#10a37f] hover:bg-[#2e8d75] font-light px-4 py-3 m-[1rem] rounded-md transition duration-200 text-white w-full disabled:opacity-50 disabled:cursor-not-allowed`}>
          Continue
        </button>

        {/* Login Link */}
        <span className="flex flex-row gap-[0.5rem] -mt-[1rem] text-sm font-light">
          Already have an account?
          <Link href="/login" className="text-[#10a37f] cursor-pointer">
            Login
          </Link>
        </span>

        {/* OR Divider */}
        <div className="flex flex-row gap-[1rem] mt-[1rem] justify-center items-center w-full text-xs font-light">
          <div className="w-full h-[1px] bg-[#c2c8d0]"></div>
          <span>OR</span>
          <div className="w-full h-[1px] bg-[#c2c8d0]"></div>
        </div>

        {/* Google Login Button */}
        <button type="button" className="flex items-center bg-white border border-neutral-300 rounded-md w-full px-6 py-3 text-sm font-light hover:bg-gray-200">
          <svg className="h-6 w-6 mr-2" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="-0.5 0 48 48" version="1.1">
            <g id="Icons" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
              <g id="Color-" transform="translate(-401.000000, -860.000000)">
                <g id="Google" transform="translate(401.000000, 860.000000)">
                  <path d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24" id="Fill-1" fill="#FBBC05">
                    {" "}
                  </path>
                  <path d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333" id="Fill-2" fill="#EB4335">
                    {" "}
                  </path>
                  <path d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667" id="Fill-3" fill="#34A853">
                    {" "}
                  </path>
                  <path d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24" id="Fill-4" fill="#4285F4">
                    {" "}
                  </path>
                </g>
              </g>
            </g>
          </svg>

          <span>Continue with Google</span>
        </button>
      </Form>
    </div>
  );
};

export default SignUp;
