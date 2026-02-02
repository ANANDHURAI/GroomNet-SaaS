import React from 'react';

const ProfileField = ({ 
  label, 
  value, 
  isEditing, 
  onChange, 
  name, 
  type = 'text',
  options = null,
  placeholder = '',
  multiline = false 
}) => {
  return (
    <div className="group">
      <label className="block text-sm font-medium text-gray-500 mb-1.5 ml-1">
        {label}
      </label>
      
      {isEditing ? (
        <div className="relative">
          {options ? (
            <select
              name={name}
              value={value || ''}
              onChange={onChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none"
            >
              <option value="">Select {label}</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : multiline ? (
            <textarea
              name={name}
              value={value || ''}
              onChange={onChange}
              placeholder={placeholder}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
            />
          ) : (
            <input
              type={type}
              name={name}
              value={value || ''}
              onChange={onChange}
              placeholder={placeholder}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            />
          )}
        </div>
      ) : (
        <div className="w-full px-4 py-3.5 bg-white border border-gray-100 rounded-xl text-gray-800 shadow-sm font-medium">
          {value ? (
            value
          ) : (
            <span className="text-gray-400 italic font-normal">Not provided</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileField;