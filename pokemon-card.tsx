'use client'

import * as React from 'react'
import { Card, CheckType } from './types/card'

interface CardProps extends Card {
  onToggle: (id: string, checkType: CheckType) => void
}

export default function PokemonCard({ id, name, checks, onToggle }: CardProps) {
  const checkTypes = [
    { type: 'nonfoil' as const, className: 'bg-white' },
    { type: 'foil' as const, className: 'bg-gradient-to-br from-yellow-50 to-yellow-100' },
    { type: 'sketch' as const, className: 'bg-gradient-to-br from-blue-50 to-blue-100' }
  ]

  return (
    <div className="group relative">
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-[#E5F0FF] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between py-3 px-4 rounded-lg">
        <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-0">
          <span className="text-xs sm:text-sm text-gray-500 font-medium select-none">#{id}</span>
          <span className="text-sm sm:text-base text-gray-900 font-medium select-none">{name}</span>
        </div>

        <div className="flex items-center gap-2">
          {checkTypes.map(({ type, className }) => (
            <button
              key={type}
              onClick={() => onToggle(id, type)}
              className={`
                w-5 h-5 rounded-sm border border-gray-300 transition-all
                ${checks[type] ? 'border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20' : 'hover:border-gray-400'}
                ${className}
              `}
            >
              {checks[type] && (
                <svg className="w-full h-full text-[#1E3A8A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

