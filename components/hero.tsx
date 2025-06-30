"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import MaxWidthWrapper from "./MaxWidth"
import { useRef, useState } from "react"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"

export default function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const joystickRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [animationPlayed, setAnimationPlayed] = useState(false)

  useGSAP(() => {
    if (
      !animationPlayed &&
      titleRef.current &&
      descriptionRef.current &&
      joystickRef.current &&
      buttonRef.current
    ) {
      const tl = gsap.timeline()

      tl.from(titleRef.current.children, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.05,
        ease: "power3.out",
      })

      tl.from(
        descriptionRef.current,
        {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.3",
      )

      tl.from(
        joystickRef.current,
        {
          y: 200,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        },
        "-=0.5",
      )

      tl.from(
        buttonRef.current,
        {
          opacity: 0,
          y: 50,
          duration: 0.5,
          ease: "back.out(1.7)",
        },
        "-=0.2",
      )

      setAnimationPlayed(true)
    }
  }, [animationPlayed])

  return (
    <MaxWidthWrapper maxWidth="2xl">
      <div className="relative min-h-screen overflow-hidden">
        <div className="container mx-auto px-4 pt-16">
          <div className="relative z-10 flex flex-col items-center">
            <div className="max-w-6xl mx-auto text-center">
              <h1
                ref={titleRef}
                className="font-zentry text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem] leading-none font-bold text-white mb-8 tracking-wide"
              >
                {"MINIGAME MASTERY".split("").map((char, index) => (
                  <span key={index} className="inline-block">
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
                <br />
                {"PLATFORM".split("").map((char, index) => (
                  <span key={`verse-${index}`} className="inline-block">
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </h1>
            </div>

            <div
              ref={joystickRef}
              className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl -mt-16 sm:-mt-24 md:-mt-32 lg:-mt-48 xl:-mt-64 mx-auto mb-12"
            >
              <Image
                src="/Joystick.png"
                alt="Gaming Controller"
                width={1200}
                height={800}
                className="w-full h-auto"
                priority
              />
            </div>

            <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl mx-auto text-center -mt-8 sm:-mt-12 md:-mt-12 lg:-mt-16 xl:-mt-20">
              <p ref={descriptionRef} className="text-gray-300 text-base sm:text-lg md:text-xl font-general">
                Dive into the ultimate experience with our comprehensive games. Get started now!
              </p>
            </div>

            <Button
              ref={buttonRef}
              className="bg-[#51FF00] text-black -mt-4 sm:mt-2 md:mt-0 lg:-mt-2 xl:-mt-4 hover:bg-[#51FF00]/90 px-6 sm:px-8 py-3 sm:py-4 md:py-6 text-base sm:text-lg font-medium transition-transform duration-300 ease-in-out hover:scale-105"
              asChild
            >
              <a href="/games">Get Started</a>
            </Button>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  )
}