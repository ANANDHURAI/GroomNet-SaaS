import React from 'react';
import { Dot } from 'lucide-react';

function NotificationIndicator({ count = 0 }) {
  return (
    <div className="relative inline-block">
      {count > 0 && (
        <>
          <Dot className="w-6 h-6 text-red-500 animate-pulse" />
          <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        </>
      )}
    </div>
  );
}

export default NotificationIndicator;