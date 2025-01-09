import { Checkbox } from "@/components/ui/checkbox"
import { Square, CircleSlash, Pencil } from 'lucide-react'
import { Card, CheckType } from './types/card'

interface CardProps extends Card {
  onToggle: (id: string, checkType: CheckType) => void
}

export default function PokemonCard({ id, name, checks, onToggle }: CardProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-500">#{id}</span>
        <span className="text-lg font-medium text-gray-800">{name}</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          <Square className="h-4 w-4 mr-1" />
          <Checkbox 
            checked={checks.nonfoil}
            onCheckedChange={() => onToggle(id, 'nonfoil')}
          />
        </div>
        <div className="flex items-center">
          <CircleSlash className="h-4 w-4 mr-1" />
          <Checkbox 
            checked={checks.foil}
            onCheckedChange={() => onToggle(id, 'foil')}
          />
        </div>
        <div className="flex items-center">
          <Pencil className="h-4 w-4 mr-1" />
          <Checkbox 
            checked={checks.sketch}
            onCheckedChange={() => onToggle(id, 'sketch')}
          />
        </div>
      </div>
    </div>
  )
}

