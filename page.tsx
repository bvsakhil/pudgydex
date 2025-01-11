"use client";

import { useState, useEffect } from "react";
import { Search, Share2, Copy, Check, ShareIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PokemonCard from "./pokemon-card";
import { Card, CheckType } from "./types/card";
import { cardData } from "@/components/cards";
import { ethers } from "ethers";
import { toast } from "sonner";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { supabase, getUserCards, upsertUserCard } from "@/lib/supabase";

export default function HuddlePage() {
  const [cards, setCards] = useState<Card[]>(cardData);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [copied, setCopied] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [nftImage, setNftImage] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const [hasNFT, setHasNFT] = useState(false);
  const [isLoadingNFT, setIsLoadingNFT] = useState(true);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [isAnyCardChecked, setIsAnyCardChecked] = useState(false);
  const [toggledCards, setToggledCards] = useState<{ [key: string]: boolean }>({});
  const [isSaving, setIsSaving] = useState(false);

  interface NFTContract {
    address: string;
  }

  interface NFTImage {
    cachedUrl: string;
  }

  interface NFT {
    contract: NFTContract;
    image: NFTImage;
  }

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address) return;
      setIsLoadingNFT(true);

      try {
        const response = await fetch(
          `https://eth-mainnet.g.alchemy.com/nft/v3/oSKPlspVUOJoF8l-8xwICsAq2R4WC0f-/getNFTsForOwner?owner=${address}&contractAddresses[]=0xbd3531da5cf5857e7cfaa92426877b022e612cf8&contractAddresses[]=0x524cab2ec69124574082676e6f654a18df49a048&withMetadata=true&pageSize=100`,
          {
            headers: {
              accept: "application/json",
            },
          }
        );

        const data = await response.json();

        if (data.ownedNfts && data.ownedNfts.length > 0) {
          setHasNFT(true);
          // First try to find a Pudgy Penguin NFT
          const pudgyPenguin = data.ownedNfts.find(
            (nft: NFT) =>
              nft.contract.address ===
              "0xbd3531da5cf5857e7cfaa92426877b022e612cf8"
          );

          // If no Pudgy Penguin, use Lil Pudgy
          const lilPudgy = data.ownedNfts.find(
            (nft: NFT) =>
              nft.contract.address ===
              "0x524cab2ec69124574082676e6f654a18df49a048"
          );

          if (pudgyPenguin) {
            setNftImage(pudgyPenguin.image.cachedUrl);
          } else if (lilPudgy) {
            setNftImage(lilPudgy.image.cachedUrl);
          }
        } else {
          setHasNFT(false);
        }
      } catch (error) {
        console.error("Error fetching NFTs:", error);
        setHasNFT(false);
      } finally {
        setIsLoadingNFT(false);
      }
    };

    if (address) {
      fetchNFTs();
    } else {
      setIsLoadingNFT(false);
    }
  }, [address]);

  // Load user's collection when they connect
  useEffect(() => {
    const loadUserCollection = async () => {
      if (!address) return;
      setIsLoadingCards(true);

      try {
        const userCards = await getUserCards(address);

        if (userCards.length > 0) {
          setCards((prevCards) =>
            prevCards.map((card) => {
              const savedCard = userCards.find((uc) => uc.card_id === card.id);
              if (savedCard) {
                return {
                  ...card,
                  checks: {
                    nonfoil: savedCard.regular,
                    foil: savedCard.foil,
                    sketch: savedCard.sketch,
                  },
                };
              }
              return card;
            })
          );
        }
      } catch (error) {
        console.error("Error loading collection:", error);
        toast.error("Failed to load collection");
      } finally {
        setIsLoadingCards(false);
      }
    };

    loadUserCollection();
  }, [address]);

  const toggleCardCheck = (id: string, checkType: CheckType) => {
    if (!address) return;

    setIsAnyCardChecked(true);

    const card = cards.find((c) => c.id === id);
    if (!card) return;

    const newValue = !card.checks[checkType];

    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id
          ? {
              ...card,
              checks: { ...card.checks, [checkType]: newValue },
            }
          : card
      )
    );

    // Update toggled cards state
    setToggledCards((prev) => ({
      ...prev,
      [id]: newValue,
    }));
  };

  const filteredCards = cards.filter(
    (card) =>
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (activeTab === "all" ||
        (activeTab === "collected" &&
          Object.values(card.checks).some(Boolean)) ||
        (activeTab === "needed" &&
          Object.values(card.checks).some((check) => !check)))
  );

  const collectedCount = cards.filter((card) =>
    Object.values(card.checks).some(Boolean)
  ).length;

  const neededCount = cards.filter(
    (card) => !Object.values(card.checks).some(Boolean)
  ).length;

  const copyToClipboard = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveCollection = async () => {
    if (!address) return;

    setIsSaving(true); // Start loading

    try {
      // Create an array to hold promises for the upsert operations
      const upsertPromises: Promise<any>[] = [];

      // Iterate over the toggled cards
      for (const [id, isToggled] of Object.entries(toggledCards)) {
        const card = cards.find((c) => c.id === id);
        if (card) {
          console.log("card", card);
          // Determine the check type based on the toggled state
          const checkType = card.checks.nonfoil ? "regular" : card.checks.foil ? "foil" : "sketch";
          console.log("checkType", checkType);

          Object.keys(card.checks).forEach(key => {
            let cardKey : "regular" | "foil" | "sketch" = key as "regular" | "foil" | "sketch";
            if (key === "nonfoil") {
              cardKey = "regular";
              upsertPromises.push(upsertUserCard(address, card.id, cardKey, card.checks.nonfoil));
            } else if (key === "foil") {
              cardKey = "foil";
              upsertPromises.push(upsertUserCard(address, card.id, cardKey, card.checks.foil));
            } else if (key === "sketch") {
              cardKey = "sketch";
              upsertPromises.push(upsertUserCard(address, card.id, cardKey, card.checks.sketch));
            }
          });
        }
      }
      // Wait for all upsert operations to complete
      await Promise.all(upsertPromises);

      // Reset toggled cards state
      setToggledCards({});
      setIsAnyCardChecked(false); // Reset checked state
      toast.success("Collection saved successfully!");
    } catch (error) {
      console.error("Error saving collection:", error);
      toast.error("Failed to save collection");
    } finally {
      setIsSaving(false); // Stop loading
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E5F0FF] to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-black text-center sm:text-left">
            PudgyDex
          </h1>
          <div className="flex gap-2">
            <a
              href="https://www.vibes.game/where-to-buy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="font-medium text-sm">
                Buy Vibes
              </Button>
            </a>
            <ConnectButton
              chainStatus="none"
              showBalance={false}
              accountStatus="avatar"
            />
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {!isConnected && (
          <div className="flex justify-between mb-4 bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="text-left">
              <h2 className="text-xl font-bold mb-2">
                Build your Vibes TCG Scrapebook
              </h2>
              <p className="text-gray-600">
                Connect your Pengu wallet to start marking your collection
                onchain.
              </p>
            </div>
          </div>
        )}

        {isConnected && isLoadingNFT && (
          <div className="flex justify-center items-center h-[80vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Checking your PENGU ownership...</p>
            </div>
          </div>
        )}

        {isConnected && !isLoadingNFT && !hasNFT && (
          <div className="flex justify-center items-center h-[50vh]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                You don't own any PENGU
              </h2>
              <p className="text-gray-600">
                Purchase a Pudgy Penguin or Lil Pudgy to access the dashboard.
              </p>
            </div>
          </div>
        )}

        {/* Profile - Only visible when wallet is connected AND has NFT */}
        {isConnected && hasNFT && (
          <div className="flex items-center justify-between mb-4 bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-xl relative">
                {nftImage && (
                  <img
                    src={nftImage}
                    alt="NFT"
                    className="absolute inset-0 w-full h-full object-cover rounded-xl"
                  />
                )}
                <AvatarImage src="https://pbs.twimg.com/profile_images/1876724785264345088/W2F8RoP__400x400.jpg" />
                <AvatarFallback>AP</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-gray-500 font-medium">{`${address?.substring(
                  0,
                  4
                )}...${address?.substring(address.length - 4)}`}</p>
                {walletAddress && (
                  <p className="text-gray-400 text-sm font-mono">{`${walletAddress?.substring(
                    0,
                    4
                  )}...${walletAddress?.substring(
                    walletAddress.length - 4
                  )}`}</p>
                )}
                <div className="flex items-center gap-2">
                  <p className="text-gray-400 text-sm font-mono">{address}</p>
                  <button
                    onClick={async () => {
                      try {
                        copyToClipboard();
                        toast.success("Link copied!"); // Toast message
                      } catch (err) {
                        console.error("Failed to copy: ", err);
                      }
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-[#1E3A8A] font-medium text-sm mt-2">
                  Vibes Collected: {collectedCount}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              onClick={async () => {
                try {
                  copyToClipboard();
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000); // Toast duration
                  toast.success("Link copied!"); // Toast message
                } catch (err) {
                  console.error("Failed to copy: ", err);
                }
              }}
            >
              {copied ? (
                <Check className="h-5 w-5" />
              ) : (
                <Share2 className="h-5 w-5" />
              )}
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
                    activeTab === "all" ? "text-[#1E3A8A]" : "text-gray-400"
                  }`}
                  onClick={() => setActiveTab("all")}
                >
                  All ({cards.length})
                  {activeTab === "all" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E3A8A]" />
                  )}
                </button>
                <button
                  className={`px-2 sm:px-4 py-3 text-sm font-medium relative ${
                    activeTab === "collected"
                      ? "text-[#1E3A8A]"
                      : "text-gray-400"
                  }`}
                  onClick={() => setActiveTab("collected")}
                >
                  Collected ({collectedCount})
                  {activeTab === "collected" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E3A8A]" />
                  )}
                </button>
                <button
                  className={`px-2 sm:px-4 py-3 text-sm font-medium relative ${
                    activeTab === "needed" ? "text-[#1E3A8A]" : "text-gray-400"
                  }`}
                  onClick={() => setActiveTab("needed")}
                >
                  Needed ({neededCount})
                  {activeTab === "needed" && (
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
                  <span className="text-gray-600">Non-Foil</span>
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
              {isLoadingCards ? (
                <div className="flex justify-center py-8">
                  <div className="text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto mb-2" />
                    <p className="text-gray-500">Loading your collection...</p>
                  </div>
                </div>
              ) : activeTab === "collected" && collectedCount === 0 ? (
                <div className="text-center text-gray-500">
                  No cards collected yet. Start marking your cards to appear
                  here.
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

        {isAnyCardChecked &&
          (isConnected ? (
            <div className="fixed bottom-4 right-4">
              <button
                onClick={saveCollection}
                className="bg-[#1E3A8A] font-bold text-white px-4 py-2 rounded-xl flex items-center"
                disabled={isSaving} // Disable button while saving
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save your collection"
                )}
              </button>
            </div>
          ) : (
            <div className="fixed bottom-4 right-4">
              <ConnectButton label="Connect your wallet to save your collection" />
            </div>
          ))}

        {/* Footer */}
        <footer className="w-full py-8 text-center text-sm text-gray-500 flex justify-center">
          Built by{" "}
          <a
            href="https://x.com/akhil_bvs"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 font-semibold text-blue-600 hover:underline"
          >
            @akhil_bvs
          </a>
        </footer>
      </div>
    </div>
  );
}
