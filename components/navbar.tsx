"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import MaxWidthWrapper from "./MaxWidth"
import { HoveredLink, Menu, MenuItem, ProductItem } from "@/components/ui/navbar-menu"
import { cn } from "@/lib/utils"
import { ArrowRight, Loader2 } from "lucide-react"
import UserMenu from "./user-menu"
import { SuggestDialog } from "./suggest-dialog"
import Image from "next/image"

export default function Navbar() {
  const [active, setActive] = useState<string | null>(null)
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm">
      <MaxWidthWrapper maxWidth="2xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-2">
              <Image width={800} height={800} src="/gc-logo.png" alt="Gamecrux Logo" className="h-32 w-32" />
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Menu setActive={setActive}>
                <MenuItem
                  setActive={setActive}
                  active={active}
                  item="Home"
                  href="/"
                  className={cn(
                    isActive("/") && "underline decoration-4 underline-offset-8 decoration-[#FFD12E] text-[#FFD12E]",
                  )}
                />
                {/* <MenuItem
                  setActive={setActive}
                  active={active}
                  item="About"
                  href="/#about"
                  className={cn(
                    isActive("/#about") && "underline decoration-4 underline-offset-8 decoration-[#FFD12E] text-[#FFD12E]",
                  )}
                /> */}
                 <MenuItem
                  setActive={setActive}
                  active={active}
                  item="Games"
                  href="/games"
                  className={cn(
                    isActive("/games") && "underline decoration-4 underline-offset-8 decoration-[#FFD12E] text-[#FFD12E]",
                  )}
                />
                {/* <MenuItem
                  setActive={setActive}
                  active={active}
                  item="Games"
                  className={cn(
                  isActive("/features") &&
                    "underline decoration-4 underline-offset-8 decoration-[#FFD12E] text-[#FFD12E]",
                  )}
                >
                  <div className="text-sm grid grid-cols-2 gap-10 p-4">
                  <ProductItem
                    title="Algochurn"
                    href="https://algochurn.com"
                    src="https://assets.aceternity.com/demos/algochurn.webp"
                    description="Prepare for tech interviews like never before."
                  />
                  <ProductItem
                    title="Tailwind Master Kit"
                    href="https://tailwindmasterkit.com"
                    src="https://assets.aceternity.com/demos/tailwindmasterkit.webp"
                    description="Production ready Tailwind css components for your next project"
                  />
                  <ProductItem
                    title="Moonbeam"
                    href="https://gomoonbeam.com"
                    src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.51.31%E2%80%AFPM.png"
                    description="Never write from scratch again. Go from idea to blog in minutes."
                  />
                  <ProductItem
                    title="Rogue"
                    href="https://userogue.com"
                    src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.47.07%E2%80%AFPM.png"
                    description="Respond to government RFPs, RFIs and RFQs 10x faster using AI"
                  />
                  <div className="col-span-2 flex items-center justify-center">
                    <Link href="/games" className="flex items-center gap-2 text-[#FFD12E] text-sm font-medium hover:underline">
                    See all games
                    <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  </div>
                </MenuItem> */}
                <MenuItem
                  setActive={setActive}
                  active={active}
                  item="Pricing"
                  href="/#pricing"
                  className={cn(
                    isActive("/#pricing") && "underline decoration-4 underline-offset-8 decoration-[#FFD12E] text-[#FFD12E]",
                  )}
                >
                </MenuItem>
              </Menu>
            </div>
            {/* Login Button or User Menu */}
            {status === "loading" ? (
              <Button
                disabled
                className="bg-[#FFD12E] text-black hover:bg-[#FFD12E]/90 rounded-md px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD12E] focus:ring-offset-2 focus:ring-offset-black transition-colors"
              >
                Loading
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />

              </Button>
            ) : session ? (
              <div className="flex items-center gap-4">
                {session.user.id && <SuggestDialog userId={session.user.id}/>}
                <UserMenu user={session.user} model="Free" />
              </div>
            ) : (
              <Button
                asChild
                className="bg-[#FFD12E] text-black hover:bg-[#FFD12E]/90 rounded-md px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD12E] focus:ring-offset-2 focus:ring-offset-black transition-colors"
              >
                <Link href="/sign-in">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  )
}
