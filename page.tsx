import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import PokemonCard from "./pokemon-card"

export default function HuddlePage() {
  const cards = [
    { id: "001", name: "Card 1", image: "/placeholder.svg?height=120&width=120" },
    { id: "002", name: "Card 2", image: "/placeholder.svg?height=120&width=120" },
    { id: "003", name: "Card 3", image: "/placeholder.svg?height=120&width=120" },
    { id: "004", name: "Card 4", image: "/placeholder.svg?height=120&width=120" },
    { id: "005", name: "Card 5", image: "/placeholder.svg?height=120&width=120" },
    { id: "006", name: "Card 6", image: "/placeholder.svg?height=120&width=120" },
    { id: "007", name: "Card 7", image: "/placeholder.svg?height=120&width=120" },
    { id: "008", name: "Card 8", image: "/placeholder.svg?height=120&width=120" },
    { id: "009", name: "Card 9", image: "/placeholder.svg?height=120&width=120" },
    { id: "010", name: "Card 10", image: "/placeholder.svg?height=120&width=120" },
  ]

  return (
    <div className="min-h-screen bg-[#4A90E2]">
      {/* Banner */}
      <div className="bg-[#1a1a1a] text-white overflow-hidden">
        <div className="animate-scroll flex whitespace-nowrap py-2">
          {Array(7).fill("$PENGU NOW LIVE").map((text, i) => (
            <span key={i} className="mx-4 text-lg font-bold">{text}</span>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <button className="bg-[#8BB8F8] px-8 py-2 rounded-lg text-white font-bold border-2 border-black">
          MENU
        </button>
        <div className="w-16 h-16">
          <img 
            src="/placeholder.svg?height=64&width=64" 
            alt="Igloo Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <button className="bg-[#8BB8F8] px-8 py-2 rounded-lg text-white font-bold border-2 border-black">
          BUY $PENGU
        </button>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-6xl font-bold text-white text-center mb-8 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          THE HUDDLE
        </h1>
        
        <p className="text-white text-center mb-12 text-xl max-w-3xl mx-auto drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
          PUDGY PENGUINS IS A GLOBAL IP FOCUSED ON PROLIFERATING THE PENGUIN, MEMETIC CULTURE, AND GOOD VIBES.
        </p>

        {/* Search Bar */}
        <div className="relative w-full max-w-md mx-auto mb-12">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            className="w-full bg-white/90 pl-9 placeholder:text-gray-500 border-2 border-black"
            placeholder="Search by Card Name..."
          />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {cards.map((card) => (
            <PokemonCard key={card.id} {...card} />
          ))}
        </div>
      </main>
    </div>
  )
}

