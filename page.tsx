"use client";

import { useState, useEffect } from "react";
import { Search, Share2, Copy, Check, ShareIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PokemonCard from "./pokemon-card";
import { Card, CheckType } from "./types/card";
import { cardData } from "@/components/cards";
import { toast } from "sonner";
import { supabase, getUserCards, upsertUserCard } from "@/lib/supabase";
import posthog from 'posthog-js'
import { usePrivy } from "@privy-io/react-auth";

posthog.init('phc_wHuq0EMrqRGENQpgUNEKaprlxctlU6S5bqbefaGHuDl',
    {
        api_host: 'https://us.i.posthog.com',
        person_profiles: 'identified_only' // or 'always' to create profiles for anonymous users as well
    }
)

export default function HuddlePage() {
  const [cards, setCards] = useState<Card[]>(cardData);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [copied, setCopied] = useState(false);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [isAnyCardChecked, setIsAnyCardChecked] = useState(false);
  const [toggledCards, setToggledCards] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isTwitterLogin, setIsTwitterLogin] = useState(false);
  const [twitterUsername, setTwitterUsername] = useState("");
  const [twitterImage, setTwitterImage] = useState("");
  const { user, login, logout } = usePrivy();

  useEffect(() => {
    if (user) {
      setIsTwitterLogin(true);
      setTwitterUsername(user.twitter?.username || "");
      setTwitterImage(formatTwitterImage(user.twitter?.profilePictureUrl || ""));
    }
  }, [user])

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

  // Load user's collection when they connect
  useEffect(() => {
    const loadUserCollection = async () => {
      if (!twitterUsername) return;
      setIsLoadingCards(true);

      try {
        const userCards = await getUserCards(twitterUsername);

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
  }, [twitterUsername]);

  const toggleCardCheck = (id: string, checkType: CheckType) => {
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
          card.checks &&
          Object.values(card.checks).some(Boolean)) ||
        (activeTab === "needed" &&
          card.checks &&
          Object.values(card.checks).some((check) => !check)))
  );

  const collectedCount = cards.filter(
    (card) => card.checks && Object.values(card.checks).some(Boolean)
  ).length;

  const neededCount = cards.filter(
    (card) => card.checks && Object.values(card.checks).some((check) => !check)
  ).length;

  const saveCollection = async () => {
    if (!twitterUsername) return;

    setIsSaving(true); // Start loading

    try {
      // Create an array to hold promises for the upsert operations
      const upsertPromises: Promise<any>[] = [];

      // Iterate over the toggled cards
      for (const [id, isToggled] of Object.entries(toggledCards)) {
        const card = cards.find((c) => c.id === id);
        if (card) {
          // Determine the check type based on the toggled state
          const checkType = card.checks.nonfoil
            ? "regular"
            : card.checks.foil
            ? "foil"
            : "sketch";

          Object.keys(card.checks).forEach((key) => {
            let cardKey: "regular" | "foil" | "sketch" = key as
              | "regular"
              | "foil"
              | "sketch";
            if (key === "nonfoil") {
              cardKey = "regular";
              upsertPromises.push(
                upsertUserCard(
                  twitterUsername,
                  card.id,
                  cardKey,
                  card.checks.nonfoil
                )
              );
            } else if (key === "foil") {
              cardKey = "foil";
              upsertPromises.push(
                upsertUserCard(
                  twitterUsername,
                  card.id,
                  cardKey,
                  card.checks.foil
                )
              );
            } else if (key === "sketch") {
              cardKey = "sketch";
              upsertPromises.push(
                upsertUserCard(
                  twitterUsername,
                  card.id,
                  cardKey,
                  card.checks.sketch
                )
              );
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

  const formatTwitterImage = (image: string) => {

    if (!image) return "";

    if (image.includes("_normal")) {
      return image.replace("_normal", "_400x400");
    } else if (image.includes("_bigger")) {
      return image.replace("_bigger", "_400x400");
    } else if (image.includes("_mini")) {
      return image.replace("_mini", "_400x400");
    } else if (image.includes("_reasonably_small")) {
      return image.replace("_reasonably_small", "_400x400");
    }
    return image;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E5F0FF] to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <img
            src="/pudgydex.svg"
            alt="PudgyDex Logo"
            className="text-lg font-black text-center sm:text-left"
          />
          <div className="flex gap-2">
            <a
              href="https://www.vibes.game/where-to-buy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="secondary"
                className="font-medium text-sm bg-[#f2f2f2] hover:bg-[#e2e2e2] rounded-lg"
              >
                Buy Vibes
              </Button>
            </a>
            {isTwitterLogin ? (
              <Button
                onClick={() => {
                  logout();
                  setIsTwitterLogin(false);
                  setTwitterUsername("");
                  setTwitterImage("");
                }}
                variant="secondary"
                className="font-medium text-sm bg-[#f2f2f2] rounded-lg"
              >
                Logout
              </Button>
            ) : (
              <Button
                className="font-medium text-sm bg-[#5989c1] hover:bg-[#5989c1] rounded-lg"
                onClick={login}
              >
                Login with X
              </Button>
            )}
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {!isTwitterLogin && (
          <div className="flex justify-between mb-4 bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="text-left">
              <h2 className="text-xl font-bold mb-2">
                Scrapebook for your Vibes Collection
              </h2>
              <p className="text-gray-600">
                Collect Pudgy to start marking your collection onchain.
              </p>
            </div>
          </div>
        )}

        {/* Profile - Only visible when wallet is connected AND has NFT */}
        {isTwitterLogin && twitterUsername && (
          <div className="flex items-center justify-between mb-4 bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-xl relative">
                {twitterImage && (
                  <img
                    src={twitterImage}
                    alt="NFT"
                    className="absolute inset-0 w-full h-full object-cover rounded-xl"
                  />
                )}
                <AvatarImage src="https://pbs.twimg.com/profile_images/1876724785264345088/W2F8RoP__400x400.jpg" />
                <AvatarFallback>AP</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-gray-500 font-medium">{`${twitterUsername}`}</p>
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
                  await navigator.clipboard.writeText(
                    "https://www.pudgydex.xyz/"
                  );
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
          <div className="bg-white border-b sticky top-0">
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
                    placeholder="Search Card Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Card Types Legend - Simplified */}
              <div className="px-6 pb-4 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-4">
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
                    <span className="text-gray-600">Sketch-Foil</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card List */}
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTab === "collected" && collectedCount === 0 ? (
              <div className="text-center text-gray-500 col-span-3">
                No cards collected yet. Start marking your cards to appear here.
              </div>
            ) : (
              filteredCards.map((card) => (
                <PokemonCard
                  key={card.id}
                  {...card}
                  onToggle={toggleCardCheck}
                  imageUrl={card.imageUrl}
                />
              ))
            )}
          </div>
        </div>

        {isAnyCardChecked &&
          (isTwitterLogin ? (
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
              <Button
                className="bg-[#5989c1] font-bold text-white px-4 py-2 rounded-xl flex items-center"
                onClick={login}
              >
                Save your Collection
              </Button>
            </div>
          ))}

        {/* Footer */}
        <footer className="py-8 text-center text-sm text-gray-500">
          <a href="https://x.com/akhil_bvs" target="_blank" rel="noopener noreferrer" className="no-underline">
            Built by @akhil_bvs
          </a>
        </footer>
      </div>
    </div>
  );
}
