'use client'

import { useState, useEffect } from 'react'
import { Search, Share2, Copy, Check, ShareIcon } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import PokemonCard from "./pokemon-card"
import { Card, CheckType } from './types/card'
import { cardData } from "@/components/cards"
import { ethers } from 'ethers'
import { toast } from 'sonner'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi'



export default function HuddlePage() {
  const [cards, setCards] = useState<Card[]>(cardData)

  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [copied, setCopied] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [nftImage, setNftImage] = useState<string | null>(null)
  const { address, isConnected } = useAccount()

  const filteredCards = cards.filter(card => 
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (activeTab === 'all' || 
     (activeTab === 'collected' && Object.values(card.checks).some(Boolean)) || 
     (activeTab === 'needed' && Object.values(card.checks).some(check => !check)))
  )

  const collectedCount = cards.filter(card => Object.values(card.checks).some(Boolean)).length

  const neededCount = cards.filter(card => 
    !Object.values(card.checks).some(Boolean)
  ).length;

  const toggleCardCheck = (id: string, checkType: CheckType) => {
    setCards(prevCards => prevCards.map(card => 
      card.id === id 
        ? { ...card, checks: { ...card.checks, [checkType]: !card.checks[checkType] } } 
        : card
    ))
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText('0xb80d...df95')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  

  

  

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E5F0FF] to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-black text-center sm:text-left">
             PudgyDex
          </h1>
          <div className="flex gap-2">
            <a href="https://www.vibes.game/where-to-buy" target="_blank" rel="noopener noreferrer">
              <Button 
                variant="outline"
                className="font-medium text-sm"
              >
                Buy Vibes
              </Button>
            </a>
            <ConnectButton chainStatus="none" showBalance={false} accountStatus="avatar" />
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-3xl">

{!isConnected && (
  <div className="flex justify-between mb-4 bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
    <div className="text-left">
      <h2 className="text-xl font-bold mb-2">Build your Vibes TCG Scrapebook</h2>
      <p className="text-gray-600">Connect your Pengu wallet to start marking your collection onchain.</p>
    </div>
  </div>
)}


        {/* Profile - Only visible when wallet is connected */}
        {isConnected && (
        <div className="flex items-center justify-between mb-4 bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 rounded-xl relative">
              {nftImage && <img src={nftImage} alt="NFT" className="absolute inset-0 w-full h-full object-cover rounded-xl" />}
              <AvatarImage src="https://pbs.twimg.com/profile_images/1876724785264345088/W2F8RoP__400x400.jpg" />
              <AvatarFallback>AP</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-gray-500 font-medium">{`${address?.substring(0, 4)}...${address?.substring(address.length - 4)}`}</p>
              {walletAddress && <p className="text-gray-400 text-sm font-mono">{`${walletAddress?.substring(0, 4)}...${walletAddress?.substring(walletAddress.length - 4)}`}</p>}
              <div className="flex items-center gap-2">
                <p className="text-gray-400 text-sm font-mono">{address}</p>
                <button 
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText('https://www.youtube.com/watch?v=jaherz_GHoI') // Replace with your desired URL
                      toast.success('Link copied!'); // Toast message
                    } catch (err) {
                      console.error('Failed to copy: ', err);
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[#1E3A8A] font-medium text-sm mt-2">Vibes Collected: {collectedCount}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText('https://www.youtube.com/watch?v=jaherz_GHoI') // Replace with your desired URL
                setCopied(true);
                setTimeout(() => setCopied(false), 2000); // Toast duration
                toast.success('Link copied!'); // Toast message
              } catch (err) {
                console.error('Failed to copy: ', err);
              }
            }}
          >
            {copied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
          </Button>
        </div>
        )}

        {/* Main Content Box */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Sticky Header */}
          <div className="sticky top-0 bg-white border-b z-40">
            {/* Tabs and Search */}
            <div className="flex flex-col">
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  className={`px-2 sm:px-4 py-3 text-sm font-medium relative ${
                    activeTab === 'all' ? 'text-[#1E3A8A]' : 'text-gray-400'
                  }`}
                  onClick={() => setActiveTab('all')}
                >
                  All ({cards.length})
                  {activeTab === 'all' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E3A8A]" />
                  )}
                </button>
                <button
                  className={`px-2 sm:px-4 py-3 text-sm font-medium relative ${
                    activeTab === 'collected' ? 'text-[#1E3A8A]' : 'text-gray-400'
                  }`}
                  onClick={() => setActiveTab('collected')}
                >
                  Collected ({collectedCount})
                  {activeTab === 'collected' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E3A8A]" />
                  )}
                </button>
                <button
                  className={`px-2 sm:px-4 py-3 text-sm font-medium relative ${
                    activeTab === 'needed' ? 'text-[#1E3A8A]' : 'text-gray-400'
                  }`}
                  onClick={() => setActiveTab('needed')}
                >
                  Needed ({neededCount})
                  {activeTab === 'needed' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E3A8A]" />
                  )}
                </button>
              </div>

              {/* Search */}
              <div className="p-4 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    className="w-full pl-10 py-2 text-sm sm:text-base placeholder:text-gray-400 border rounded-xl"
                    placeholder="Search cards by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Card Types Legend - Simplified */}
            <div className="px-4 py-3 flex flex-wrap items-center gap-4 text-sm border-t">
              <span className="font-medium text-gray-600">Types:</span>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 border border-gray-300 rounded-sm bg-white"></div>
                  <span className="text-gray-600">Regular</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 border border-gray-300 rounded-sm bg-gradient-to-br from-yellow-50 to-yellow-100"></div>
                  <span className="text-gray-600">Foil</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 border border-gray-300 rounded-sm bg-gradient-to-br from-blue-50 to-blue-100"></div>
                  <span className="text-gray-600">Sketch</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Checklist */}
            <div className="space-y-1">
                {activeTab === 'collected' && collectedCount === 0 ? (
                    <div className="text-center text-gray-500">
                        No cards collected yet. Start marking your cards to appear here.
                    </div>
                ) : (
                    filteredCards.map((card) => (
                        <PokemonCard 
                            key={card.id} 
                            {...card} 
                            onToggle={toggleCardCheck}
                        />
                    ))
                )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 text-center text-sm text-gray-500">
          Built by <a href="https://x.com/akhil_bvs" target="_blank" rel="noopener noreferrer">@akhil_bvs</a>
        </footer>
      </div>
    </div>
  )
}

