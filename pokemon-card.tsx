interface CardProps {
  id: string
  name: string
  image: string
}

export default function PokemonCard({ id, name, image }: CardProps) {
  return (
    <div className="bg-white/90 rounded-lg p-4 border-2 border-black hover:transform hover:scale-105 transition-transform cursor-pointer">
      <div className="aspect-square flex items-center justify-center mb-4">
        <img
          src={image}
          alt={name}
          className="w-24 h-24 object-contain"
          width={96}
          height={96}
        />
      </div>
      <div className="text-center">
        <h2 className="text-black text-lg font-bold">{name}</h2>
        <p className="text-gray-600">#{id}</p>
      </div>
    </div>
  )
}

