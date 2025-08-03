import React from 'react';

const NotificationBadge = ({ count, className = "" }) => {
  if (!count || count === 0) return null;

  return (
    <div className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ${className}`}>
      {count > 99 ? '99+' : count}
    </div>
  );
};

export default NotificationBadge;