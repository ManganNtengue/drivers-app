import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 bg-gray-100 p-6 overflow-auto">{children}</main>
      </div>

      <Footer />
    </div>
  );
};

export default Layout;
