import React from 'react';
import Navbar from '../basics/Navbar';
import CusSideNavBar from './CusSideNavBar';

const CustomerLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-row flex-1 min-h-[calc(100vh-80px)]">
        {/* Sidebar (fixed) */}
        <div className="fixed top-[80px] left-0 h-[calc(100vh-80px)] w-72 z-30">
          <CusSideNavBar />
        </div>

        {/* Main content with left margin and spacing */}
        <main className="ml-80 w-full p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
