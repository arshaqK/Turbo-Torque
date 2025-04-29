import type { Metadata } from "next";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Contexts
import { AuthProvider } from "@/context/AuthContext";

// Dependancies
import { Slide, ToastContainer } from "react-toastify";

// Styles
import "./globals.css";

export const metadata: Metadata = {
  title: "Pak Wheels",
  description: "Users can buy, sell & rent cars on Pak Wheels",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" transition={Slide} />
          <Navbar />

          {children}

          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
