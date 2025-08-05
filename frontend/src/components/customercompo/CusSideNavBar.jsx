import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logout from "../basics/Logout";

const navItems = [
  { name: "Profile", path: "/customer-profile" },
  { name: "Booking History", path: "/booking-history" },
  { name: "My Addresses", path: "/my-addresses" },
  { name: "Wallet", path: "/customer-wallet" },
  { name: "My Complaints", path: "/customer/complaints" },
];

const CusSideNavBar = () => {
  return (
    <div className="h-full w-72 bg-gradient-to-b from-purple-100 to-white shadow-xl p-6 pr-4 border-r border-gray-200 overflow-y-auto">
      <h2 className="pt-10 text-3xl font-extrabold mb-8 text-purple-700 drop-shadow-sm tracking-wide">
        My Account
      </h2>

      <nav className="flex flex-col gap-4">
        {navItems.map((item, index) => (
          <motion.div
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            key={index}
          >
            <Link
              to={item.path}
              className="block px-4 py-2 text-gray-700 hover:text-white hover:bg-purple-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {item.name}
            </Link>
          </motion.div>
        ))}

        <motion.div
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="px-4 py-2 text-gray-700 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
        >
          <Logout />
        </motion.div>
      </nav>
    </div>
  );
};

export default CusSideNavBar;
