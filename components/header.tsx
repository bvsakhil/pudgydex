import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="container mx-auto px-4 py-6 flex justify-between items-center">
    <div className="w-12 h-12">
      {/* <img 
        src="/placeholder.svg?height=48&width=48" 
        alt="Igloo Logo"
        className="w-full h-full object-contain"
      /> */}
      <span>PudgyDex</span>
    </div>
    
    <nav className="flex items-center">
      
      <button className="bg-[#8BB8F8] px-6 py-1 rounded-lg text-white font-bold border-2 border-black">
        Connect Pengu
      </button>
    </nav>
  </header>
  );
};

export default Header;
