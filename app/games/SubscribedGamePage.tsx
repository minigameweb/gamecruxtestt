"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"
import MaxWidthWrapper from "@/components/MaxWidth"
import { Game, games } from "@/constants/constants"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const GameSection = ({
  title,
  games,
}: {
  title: string
  games: Game[]
  showAll: boolean
}) => {
  const currentGames = games

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎮</span>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {currentGames.map((game, index) => (
          <Link
            scroll={true}
            key={index}
            href={game.href}
            className="group relative transition-all duration-200 hover:brightness-110 hover:shadow-lg"
          >
            <Card className="border border-white/10 bg-black/50 hover:bg-black/70 transition-colors overflow-hidden rounded-xl p-3">
              <div className="flex flex-col">
          <div className="relative aspect-[4/4]">
            <Image src={game.image || "/placeholder.svg"} alt={game.title} fill className="rounded-md object-cover" />
          </div>
          <div className="mt-3">
            <h3 className="text-lg font-bold text-white mb-1">{game.title}</h3>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              {/* <p className="text-xs text-gray-300">{game.players}</p> */}
            </div>
          </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

const BannerSection = () => {
  return (
    <div className="grid md:grid-cols-2 gap-4 mt-8">
      {/* First Banner */}
      <Card className="bg-orange-700 overflow-hidden relative hover:brightness-110 hover:shadow-lg transition-all duration-200">
        <CardContent className="p-6">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-sm font-medium">
                🎮 Game Library
              </span>
            </div>
            <div>
              <p className="text-white/80 text-lg font-medium mb-2">
              Can&apos;t find your favorite game?
              </p>
              <h2 className="text-4xl font-bold mb-3 leading-tight">Suggest a Game</h2>
              <p className="text-white/70 text-lg mb-6">
              Tell us what game you&apos;d like to play.

              </p>
                <Dialog>
                <DialogTrigger asChild>
                  <Button
                  className="bg-yellow-400 text-black hover:bg-yellow-500 font-semibold px-8 py-6 text-lg"
                  >
                  <div className="flex items-center gap-2">
                    Suggest a Game
                    <ChevronRight className="h-5 w-5" />
                  </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] bg-black border border-gray-700 text-white">
                  <DialogHeader>
                  <DialogTitle className="text-2xl font-semibold text-white">Suggest a Game</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="game-name" className="text-gray-300">Game Name*</Label>
                    <Input id="game-name" placeholder="Enter your game name" className="w-full bg-gray-300 text-black border-gray-600" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="game-url" className="text-gray-300">Game URL*</Label>
                    <Input id="game-url" placeholder="Enter your game url" className="w-full bg-gray-300 text-black border-gray-600" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="game-description" className="text-gray-300">Game Description*</Label>
                    <Textarea
                    id="game-description"
                    placeholder="Describe the gameplay, objectives, or mechanics."
                    className="h-24 bg-gray-300 text-black border-gray-600"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="game-reason" className="text-gray-300">Why is this a great addition?*</Label>
                    <Textarea
                    id="game-reason"
                    placeholder="Explain why this game would be fun or unique."
                    className="h-24 bg-gray-300 text-black border-gray-600"
                    />
                  </div>
                  </div>
                  <DialogFooter className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 italic">✨ Your idea could be the next big hit!</p>
                  <div className="flex gap-2">
                    <DialogTrigger asChild>
                    <Button variant="outline" className="bg-black text-white hover:bg-gray-800">
                      Cancel
                    </Button>
                    </DialogTrigger>
                    <Button type="submit" className="bg-[#6C5CE7] text-white hover:bg-[#5B4EE7]">
                    Submit
                    </Button>
                  </div>
                  </DialogFooter>
                </DialogContent>
                </Dialog>
            </div>
          </div>
          <Image
            src="/banner-left.png"
            alt="Casino elements"
            width={450}
            height={400}
            className="absolute right-0 top-1/2 lg:-mr-28 -translate-y-1/2 hidden lg:block"
          />
        </CardContent>
      </Card>

      {/* Second Banner */}
      <Card className="bg-gradient-to-r from-red-900 to-red-800 overflow-hidden relative">
        <CardContent className="p-6">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-sm font-medium">
                ⭐ Premium Features
              </span>
            </div>
            <div>
              <p className="text-white/80 text-lg font-medium mb-2">
                Upgrade Your Experience
              </p>
              <h2 className="text-4xl font-bold mb-3 leading-tight">
                Go{" "}
                <span className="text-yellow-400 relative">
                  Executive
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-yellow-400/30 rounded-full"></span>
                </span>
              </h2>
              <p className="text-white/70 text-lg mb-6">
                Unlock exclusive games and features
              </p>
              <div className="flex gap-4">
                <Button
                  asChild
                  className="bg-yellow-400 text-black hover:bg-yellow-500 font-semibold px-8 py-6 text-lg"
                >
                  <Link href="/upgrade" className="flex items-center gap-2">
                    Upgrade Now
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <Image
            src="/banner1.png"
            alt="Premium Features"
            width={450}
            height={400}
            className="absolute right-0 top-1/2 mt-2 -mr-24 -translate-y-1/2 hidden lg:block"
          />
        </CardContent>
      </Card>
    </div>
  )
}


export default function SubscribedGamePage() {
  return (
    <MaxWidthWrapper maxWidth="xl">
      <div className="min-h-screen text-white p-4 space-y-8 mb-32">
        <BannerSection />
        <GameSection title="All Games" games={games} showAll={true} />
      </div>
    </MaxWidthWrapper>
  )
}

