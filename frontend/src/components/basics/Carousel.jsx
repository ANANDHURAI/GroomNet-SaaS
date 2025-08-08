import React, { useState, useRef } from 'react';

const ArrowButton = ({ direction, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 transform
      ${disabled 
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
        : 'bg-white shadow-lg hover:shadow-xl text-gray-700 hover:text-purple-600 hover:scale-110 hover:bg-purple-50'
      }
      ${direction === 'left' ? 'mr-2' : 'ml-2'}
    `}
  >
    <svg 
      className="w-5 h-5" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d={direction === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} 
      />
    </svg>
  </button>
);

const Carousel = ({ children, title }) => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const containerRef = useRef(null);

  const checkScrollability = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount = 320;
      const currentScrollLeft = containerRef.current.scrollLeft;
      const newScrollLeft = direction === 'left' 
        ? currentScrollLeft - scrollAmount 
        : currentScrollLeft + scrollAmount;
      
      containerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      
      setTimeout(checkScrollability, 300);
    }
  };

  React.useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [children]);

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl lg:text-4xl font-black text-gray-800 mb-2">
            {title}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
        </div>
        
        <div className="flex items-center space-x-2">
          <ArrowButton 
            direction="left"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
          />
          <ArrowButton 
            direction="right"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
          />
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={checkScrollability}
      >
        {children}
      </div>
    </div>
  );
};

export default Carousel;
