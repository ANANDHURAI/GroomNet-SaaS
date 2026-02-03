import React, { useEffect, useState } from 'react';

const NotificationBadge = ({ count }) => {
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (count > 0) {
      // Trigger a 'pop' animation whenever count changes
      setBump(true);
      const timer = setTimeout(() => setBump(false), 300);
      return () => clearTimeout(timer);
    }
  }, [count]);

  if (!count || count === 0) return null;

  return (
    <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center z-50">
      {/* 1. Animated Ripple Effect (Behind) */}
      <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping"></span>
      
      {/* 2. The Badge Itself */}
      <span
        className={`
          relative inline-flex items-center justify-center
          min-w-[18px] h-[18px] px-1
          text-[10px] font-bold text-white leading-none
          bg-gradient-to-r from-red-500 via-rose-500 to-pink-600
          border border-white/50 shadow-md rounded-full
          transform transition-all duration-300 ease-out
          ${bump ? 'scale-125' : 'scale-100'}
        `}
      >
        {count > 99 ? '99+' : count}
      </span>
    </div>
  );
};

export default NotificationBadge;