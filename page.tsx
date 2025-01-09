'use client'

import { useState } from 'react'
import { Search, Share } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PokemonCard from "./pokemon-card"
import { Card, CheckType } from './types/card'
import { cards } from '@/components/cards'
import Header from '@/components/header'

export default function HuddlePage() {
  const [cardData, setCardData] = useState<Card[]>(cards)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const filteredCards = cardData.filter(card => 
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (activeTab === 'all' || 
     (activeTab === 'collected' && Object.values(card.checks).some(Boolean)) || 
     (activeTab === 'needed' && Object.values(card.checks).some(check => !check)))
  )

  const toggleCardCheck = (id: string, checkType: CheckType) => {
    setCardData(cardData.map(card => 
      card.id === id 
        ? { ...card, checks: { ...card.checks, [checkType]: !card.checks[checkType] } } 
        : card
    ))
  }

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-2xl mx-auto relative">
          <Share className="absolute top-4 right-4 cursor-pointer" />
          
          <div className="pb-4 flex items-center">
            <img 
              src="https://pbs.twimg.com/profile_images/1876724785264345088/W2F8RoP__400x400.jpg" 
              alt="Profile" 
              className="w-24 h-24 rounded-full mb-4 mr-4"
            />
            <div>
              <h2 className="text-xl font-bold">Akhil</h2>
              <p className="text-gray-500">@akhil_bvs</p>
              <p className="text-gray-400">0xb80d...df95</p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="sticky top-0 bg-white p-4">
            <Tabs defaultValue="all" className="w-full mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" onClick={() => setActiveTab('all')}>All</TabsTrigger>
                <TabsTrigger value="collected" onClick={() => setActiveTab('collected')}>Collected</TabsTrigger>
                <TabsTrigger value="needed" onClick={() => setActiveTab('needed')}>Needed</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="mb-4">
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Search cards..." 
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            {filteredCards.map((card) => (
              <PokemonCard 
                key={card.id} 
                {...card} 
                onToggle={toggleCardCheck}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

