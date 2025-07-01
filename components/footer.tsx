import Image from "next/image";
import Link from "next/link"
import { AiOutlineDiscord, AiOutlineMail } from "react-icons/ai";

export default function GameCruxLandingPage() {
  return (
    <div>
      {/* Footer Section */}
      <footer className="mt-24 text-white font-popin bg-black">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="space-y-2">
              <div>
                <Image
                  width={800}
                  height={800}
                  src="/gc-logo.png"
                  alt="GameCrux Logo"
                  className="w-16 h-16"
                />
              </div>
              <div className="font-bold text-xl tracking-wider">
                GameCrux
              </div>
              <div className="text-gray-300">gamecrux3005@gmail.com</div>
            </div>

            {/* Middle Column */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-6">About us</h3>
              <nav className="flex flex-col space-y-3">
                <Link href="https://checkout.tebex.io/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
                <Link href="https://checkout.tebex.io/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/pages/refund" className="text-gray-300 hover:text-white transition-colors">
                  Refund Policy
                </Link>
                <Link href="/pages/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact us
                </Link>
              </nav>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-6">Contact us</h3>
              <p className="text-gray-300 max-w-sm">
              Reach out to us for any questions, support, or inquiries. We&apos;re here to help!
              </p>
              <p className="text-gray-300">+9315126696</p>

              {/* Social Icons */}
              <div className="flex flex-wrap gap-4 mt-6">
                <Link href="https://discord.gg/gd5cymQaSj" className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors">
                  <AiOutlineDiscord size={20} />
                  <span className="sr-only">Discord</span>
                </Link>
                <Link href="mailto:gamecrux3005@gmail.com" className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors">
                  <AiOutlineMail size={20} />
                  <span className="sr-only">Email</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800">
            <div className="container mx-auto px-4 py-4">
            <p className="text-center text-gray-400 text-sm">Copyright © 2025 gamecrux All rights Reserved</p>
            <p className="text-center text-gray-400 text-sm mt-1">Powered by Tebex</p>
            </div>
        </div>
      </footer>
    </div>
  )
}