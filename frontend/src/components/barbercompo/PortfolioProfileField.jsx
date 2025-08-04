import React from 'react';

function PortfolioProfileField({ label, icon: Icon, children }) {
    return (
        <div className="flex items-start space-x-4">
            {Icon && (
                <div className="text-gray-500 mt-1">
                    <Icon className="w-5 h-5" />
                </div>
            )}
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                {children}
            </div>
        </div>
    );
}

export default PortfolioProfileField;
