import React, { useEffect, useState } from 'react';

function Message({ message }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`transition-opacity duration-700 ease-in-out fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <h4 className="font-medium">{message}</h4>
    </div>
  );
}

export default Message;
