import React from 'react';
import { Home, Phone } from 'lucide-react';

const AddressCard = ({ address, onSelect }) => (
  <div
    onClick={() => onSelect(address)}
    className="bg-white rounded-xl p-5 cursor-pointer hover:shadow-md border border-gray-200 hover:border-blue-400 transition-all"
  >
    <div className="flex items-start gap-4">
      <Home className="w-5 h-5 text-blue-600 mt-1" />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-800">{address.name}</h3>
          {address.is_default && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              Default
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-2">
          {address.building}, {address.street}, {address.city}, {address.state} - {address.pincode}
        </p>
        <div className="flex items-center text-xs text-gray-600">
          <Phone className="w-3 h-3 mr-1" />
          {address.mobile}
        </div>
      </div>
    </div>
  </div>
);

export default AddressCard;
