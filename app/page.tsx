"use client"

import { useEffect, useRef } from 'react';
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import ProductCarousel from '@/components/carousel';
import Footer from '@/components/footer';
import GamePlay from '@/components/game-play';
import Glance from '@/components/glance';
import Hero from '@/components/hero';
import Navbar from '@/components/navbar';
import { CurrencyProvider } from '@/contexts/CurrencyProvider';
import PricingSection from './pages/pricing/page';
import FooterHero from '@/components/footer-hero';

export default function Home() {
  const backgroundRef = useRef(null);

  useGSAP(() => {
    if (backgroundRef.current) {
      gsap.to(backgroundRef.current, {
        backgroundPosition: "40px 40px",
        duration: 4,
        repeat: -1,
        ease: "linear",
      });
    }
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      const sectionId = window.location.hash.slice(1);
      const element = document.getElementById(sectionId);
      if (element) {
        const offsetTop = element.offsetTop - 72;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    }
  }, []);

  return (
    <div className="bg-black relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div
        ref={backgroundRef}
        className="fixed inset-0 opacity-60 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <Hero />

        <div id="carousel" className="scroll-mt-[72px]">
          <ProductCarousel />
        </div>

        <div id="about" className="scroll-mt-[72px]">
          <Glance />
        </div>

        <div id="gameplay" className="scroll-mt-[72px]">
          <GamePlay />
        </div>

        <div className="scroll-mt-[72px]" id="pricing">
          <CurrencyProvider>
            <PricingSection />
          </CurrencyProvider>
        </div>

        {/* <FooterHero /> */}
        <div id="contact" className="scroll-mt-[72px]">
          <Footer />
        </div>
      </div>
    </div>
  );
}