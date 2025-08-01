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
  const renderInput = () => {
    if (options) {
      return (
        <select
          name={name}
          value={value || ''}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (multiline) {
      return (
        <textarea
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
        />
      );
    }

    return (
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    );
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>
      {isEditing ? (
        renderInput()
      ) : (
        <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 min-h-[48px] flex items-center">
          {value || <span className="text-gray-400">Not provided</span>}
        </div>
      )}
    </div>
  );
};

export default ProfileField;