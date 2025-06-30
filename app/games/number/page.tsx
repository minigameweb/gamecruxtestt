'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

function Cell({ number, isClicked, onClick }: {
  number: number
  isClicked: boolean
  onClick: () => void
}) {
  return (
    <motion.div
      className={`
        relative flex h-14 w-14 items-center justify-center text-lg font-bold
        ${
          isClicked
            ? 'bg-[#1c1c1a06] text-[#ff2d95]/30'
            : 'bg-[#1c1c1a06] text-white/90 cursor-pointer hover:border hover:border-white/50'
        }
        backdrop-blur-sm
      `}
      onClick={onClick}
      whileTap={isClicked ? {} : { scale: 0.95 }}
      layout
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.2 }}
    >
      {number}
      {!isClicked && (
        <motion.div
          className="absolute inset-0 rounded-md"
          animate={{ opacity: [0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        />
      )}
    </motion.div>
  )
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-4 w-full rounded-full bg-[#020223]/50 border border-[#ff2d95]/20">
      <motion.div
        className="h-full rounded-full bg-green-500"
        initial={{ width: 0 }}
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  )
}

function WinMessage({
  gameStatus
}: {
  gameStatus: 'idle' | 'playing' | 'won' | 'lost'
  timeLeft: number
  gameTime: number
}) {
  if (gameStatus === 'playing' || gameStatus === 'idle') return null

  const message =
    gameStatus === 'won'
      ? `🎉 You won.`
      : '⏱️ Time\'s up!'

  return (
    <motion.div
      className="mt-4 text-center text-lg font-bold text-transparent bg-clip-text bg-yellow-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {message}
    </motion.div>
  )
}

function Game() {
  const [numbers, setNumbers] = useState<number[]>([])
  const [clickedNumbers, setClickedNumbers] = useState<{ [key: number]: boolean }>({})
  const [nextNumber, setNextNumber] = useState(1)
  const [timeLeft, setTimeLeft] = useState(20)
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle')
  const [gameTime, setGameTime] = useState(20)
  const [speed, setSpeed] = useState(2000)

  const generateNumbers = useCallback(() => {
    const newNumbers = Array.from({ length: 25 }, (_, i) => i + 1)
    newNumbers.sort(() => Math.random() - 0.5)
    setNumbers(newNumbers)
    setClickedNumbers({})
  }, [])

  const handleCellClick = useCallback((number: number) => {
    if (number === nextNumber) {
      setClickedNumbers(prev => ({ ...prev, [number]: true }))
      setNextNumber(prev => prev + 1)
      if (nextNumber === 25) {
        setGameStatus('won')
      }
    }
  }, [nextNumber])

  const startGame = useCallback(() => {
    generateNumbers()
    setNextNumber(1)
    setTimeLeft(gameTime)
    setGameStatus('playing')
  }, [generateNumbers, gameTime])

  const restartGame = useCallback(() => {
    setGameStatus('idle')
    generateNumbers()
  }, [generateNumbers])

  useEffect(() => {
    if (gameStatus !== 'playing') return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setGameStatus('lost')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStatus])

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameStatus === 'playing') {
        setNumbers(prev => [...prev].sort(() => Math.random() - 0.5))
      }
    }, speed)

    return () => clearInterval(interval)
  }, [gameStatus, speed])

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex-1 space-y-2">
          <Label className="text-[#FFFFFF]" htmlFor="game-time">
            Time: {gameTime} seconds
          </Label>
          <Slider
            id="game-time"
            min={10}
            max={30}
            step={1}
            value={[gameTime]}
            onValueChange={(value) => setGameTime(value[0])}
            disabled={gameStatus === "playing"}
            className="text-[#FFFFFF]"
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="speed" className="text-[#FFFFFF]">
            Speed: {speed / 1000} seconds
          </Label>
          <Slider
            id="speed"
            min={500}
            max={5000}
            step={500}
            value={[speed]}
            onValueChange={(value) => setSpeed(value[0])}
            disabled={gameStatus === "playing"}
            className="text-[#FFFFFF]"
          />
        </div>
      </div>
      <div className="w-full max-w-md backdrop-blur-sm p-6 rounded-xl border border-gray-600 bg-[#151515ad]">
        <motion.div
          className="grid grid-cols-5 gap-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence>
            {numbers.map((number) => (
              <Cell
                key={number}
                number={number}
                isClicked={clickedNumbers[number]}
                onClick={() => gameStatus === "playing" && handleCellClick(number)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
        <div className="mt-8">
          <ProgressBar progress={1 - timeLeft / gameTime} />
          {/* <Timer timeLeft={timeLeft} /> */}
        </div>
        <WinMessage gameStatus={gameStatus} timeLeft={timeLeft} gameTime={gameTime} />

      </div>
      <div className="mt-6 flex justify-center">
          {gameStatus === "idle" ? (
            <Button
            size="lg"
            onClick={startGame}
            className="rounded-md bg-blue-500 hover:bg-blue-600"
            >Start Game</Button>
          ) : (
            <Button
            size="lg"
            className="rounded-md bg-red-500 hover:bg-red-600"
            onClick={restartGame}>Restart Game</Button>
          )}
        </div>
    </div>
  )
}

export default function Home() {
  return (
    <main className="relative flex flex-col items-center overflow-hidden mt-24 bg-black">
      <Game />
    </main>
  )
}

