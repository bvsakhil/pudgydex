'use client'

import * as React from 'react'
import { Card, CheckType } from '@/types/card'

interface CardProps extends Card {
  onToggle: (id: string, checkType: CheckType) => void
  imageUrl: string;
}

export default function PokemonCard({ id, name, checks, onToggle, imageUrl }: CardProps) {
  const checkTypes = [
    { type: 'nonfoil' as const, className: 'bg-white', tooltip: 'Collect nonfoil' },
    { type: 'foil' as const, className: 'bg-gradient-to-br from-yellow-50 to-yellow-100', tooltip: 'Collect foil' },
    { type: 'sketch' as const, className: 'bg-gradient-to-br from-blue-50 to-blue-100', tooltip: 'Collect sketch' }
  ]

  const [rotation, setRotation] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 30; // Adjust multiplier for more/less rotation
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 30;
    setRotation({ x, y });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div className="group relative">
      <div className="relative flex flex-col py-2 px-4 rounded-lg transition-transform transform group-hover:scale-105">
        <div className="flex items-center gap-2 sm:gap-4 mb-1">
          <span className="text-xs sm:text-sm text-gray-500 font-medium select-none bg-[#f2f2f2] px-2 py-1 rounded-full">
            #{id}
          </span>
          <span 
            className="text-sm sm:text-base text-gray-900 font-medium select-none truncate" 
            style={{ maxWidth: 'calc(100% - 2rem)' }} // Adjust maxWidth to ensure it fits in one line
            title={name} // Tooltip to show full name on hover
          >
            {name}
          </span>
        </div>

        <div 
          className="flex justify-center mb-1"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            perspective: '1000px', // Add perspective for 3D effect
          }}
        >
          <img 
            src={imageUrl || 'path/to/fallback/image.png'}
            alt={name} 
            className="w-auto h-auto object-contain rounded-md"
            style={{
              transform: `rotateY(${rotation.x}deg) rotateX(${rotation.y}deg)`, // Apply rotation
              transition: 'transform 0.1s ease-out', // Smooth transition
            }}
          />
        </div>

        <div className="flex justify-center items-center gap-2 mb-1">
          {checkTypes.map(({ type, className, tooltip }) => (
            <div className="relative" key={type}>
              <button
                onClick={() => onToggle(id, type)}
                className={`
                  w-5 h-5 rounded-sm border border-gray-300 transition-all
                  ${checks && checks[type] ? 'border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20' : 'hover:border-gray-400'}
                  ${className}
                `}
                onMouseEnter={(e) => {
                  const tooltipElement = e.currentTarget.nextSibling as HTMLElement;
                  tooltipElement.style.display = 'block';
                }}
                onMouseLeave={(e) => {
                  const tooltipElement = e.currentTarget.nextSibling as HTMLElement;
                  tooltipElement.style.display = 'none';
                }}
              >
                {checks && checks[type] && (
                  <svg className="w-full h-full text-[#1E3A8A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
              <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-1 hidden bg-white text-black text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap">
                {tooltip}
              </div>
            </div>
          ))}
        </div>

        {id === "084" && (
          <div className="relative text-xs text-gray-500 text-center mt-1">
            <div className="inline-block bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md px-2 py-1">
              It's the Charizard card 🔥
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
