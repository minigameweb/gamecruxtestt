"use client"

import { useState, useEffect, useCallback } from "react"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

type Position = {
  x: number
  y: number
}

type Direction = "up" | "down" | "left" | "right"

type GameState = {
  started: boolean
  ended: boolean
  success: boolean
  failReason?: "time" | "strikes"
  timeRemaining: number
  strikes: number
  startTime?: number
  strikePositions: Position[]
}

export default function PathGame() {
  const [gridSize, setGridSize] = useState(32)
  const [timeLimit, setTimeLimit] = useState(10000)
  const [path, setPath] = useState<Position[]>([])
  const [playerPosition, setPlayerPosition] = useState<Position & { lastMove: Direction | null }>({
    x: 0,
    y: 0,
    lastMove: null,
  })
  const [gameState, setGameState] = useState<GameState>({
    started: false,
    ended: false,
    success: false,
    timeRemaining: timeLimit,
    strikes: 0,
    strikePositions: []
  })
  const [maxStrikes, setMaxStrikes] = useState(3)
  const [offPathCount, setOffPathCount] = useState(0)

  const generatePath = useCallback((gridSize: number, maxMove = 3) => {
    const newPath: Position[] = []
    const currentCoords: Position & {
      up: () => void
      down: () => void
      left: () => void
      right: () => void
    } = {
      x: Math.floor(gridSize / 2),
      y: 0,
      up() {
        this.y++
      },
      down() {
        this.y--
      },
      left() {
        this.x--
      },
      right() {
        this.x++
      },
    }

    newPath.push({ x: currentCoords.x, y: currentCoords.y })

    let possibleDirections: Direction[] = ["up", "left", "right"]
    let availableDirection: Direction | null = null
    let lastDirection: Direction | null = null

    while (currentCoords.y < gridSize - 1) {
      const randomDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)] as Direction
      const moveAmt = Math.floor(Math.random() * maxMove) + 1

      if (randomDirection === "left" && currentCoords.x - moveAmt < 0) {
        if (possibleDirections.length === 1) {
          possibleDirections = ["up"]
        }
        continue
      }
      if (randomDirection === "right" && currentCoords.x + moveAmt >= gridSize) {
        if (possibleDirections.length === 1) {
          possibleDirections = ["up"]
        }
        continue
      }

      for (let i = 0; i < moveAmt; i++) {
        currentCoords[randomDirection]()
        newPath.push({ x: currentCoords.x, y: currentCoords.y })
      }

      if (randomDirection === "up" && moveAmt === 1) {
        availableDirection = lastDirection as Direction
      } else {
        availableDirection = null
      }

      lastDirection = randomDirection

      if (randomDirection === "left" || randomDirection === "right") {
        possibleDirections = ["up"]
      } else {
        possibleDirections = availableDirection ? [availableDirection] : ["left", "right"]
      }
    }

    setPath(newPath)
    setPlayerPosition({
      x: Math.floor(gridSize / 2),
      y: 0,
      lastMove: null,
    })
  }, [])

  const startGame = useCallback(() => {
    generatePath(gridSize)
    setGameState({
      started: true,
      ended: false,
      success: false,
      timeRemaining: timeLimit,
      strikes: 0,
      strikePositions: [],
      startTime: Date.now()
    })
    setOffPathCount(0)
  }, [generatePath, gridSize, timeLimit])

  const endGame = useCallback((success: boolean, reason?: "time" | "strikes") => {
    setGameState(prev => ({
      ...prev,
      started: false,
      ended: true,
      success,
      failReason: reason,
      timeRemaining: 0
    }))
  }, [])

  const isOnPath = useCallback(
    (pos: Position) => {
      return path.some((p) => p.x === pos.x && p.y === pos.y)
    },
    [path],
  )

  const movePlayer = useCallback(
    (direction: Direction) => {
      if (!gameState.started || gameState.ended) return

      setPlayerPosition((prev) => {
        const newPos = { ...prev }

        switch (direction) {
          case "down":
            if (prev.y < gridSize - 1) newPos.y++
            break
          case "up":
            if (prev.y > 0) newPos.y--
            break
          case "left":
            if (prev.x > 0) newPos.x--
            break
          case "right":
            if (prev.x < gridSize - 1) newPos.x++
            break
        }

        // Check if new position is off path and hasn't been marked before
        if (!isOnPath(newPos) &&
            !gameState.strikePositions.some(pos => pos.x === newPos.x && pos.y === newPos.y)) {
          const newStrikeCount = offPathCount + 1
          setOffPathCount(newStrikeCount)

          if (newStrikeCount >= maxStrikes) {
            endGame(false, "strikes")
          }

          setGameState(prev => ({
            ...prev,
            strikes: newStrikeCount,
            strikePositions: [...prev.strikePositions, { x: newPos.x, y: newPos.y }]
          }))
        } else if (newPos.y === gridSize - 1 && isOnPath(newPos)) {
          // Win condition: reach the end while on the path
          endGame(true)
        }

        newPos.lastMove = direction
        return newPos
      })
    },
    [gameState.started, gameState.ended, gridSize, isOnPath, endGame, maxStrikes, offPathCount, gameState.strikePositions],
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        startGame()
        return
      }

      switch (e.key) {
        case "ArrowUp":
        case "w":
          movePlayer("up")
          break
        case "ArrowDown":
        case "s":
          movePlayer("down")
          break
        case "ArrowLeft":
        case "a":
          movePlayer("left")
          break
        case "ArrowRight":
        case "d":
          movePlayer("right")
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [movePlayer, startGame])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const updateTimer = () => {
      if (gameState.started && !gameState.ended && gameState.startTime) {
        const currentTime = Date.now()
        const elapsed = currentTime - gameState.startTime
        const remaining = Math.max(0, timeLimit - elapsed)

        if (remaining <= 0) {
          endGame(false, "time")
        } else {
          setGameState(prev => ({
            ...prev,
            timeRemaining: remaining
          }))
          timeoutId = setTimeout(updateTimer, 50)
        }
      }
    }

    if (gameState.started && !gameState.ended) {
      updateTimer()
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [gameState.started, gameState.ended, gameState.startTime, timeLimit, endGame])

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="w-full max-w-[650px] p-4">
        <div className="flex flex-col gap-4">
          {!gameState.started && (
            <div className="flex flex-row w-full gap-4">
              <div className="space-y-2 w-full">
                <label className="text-sm text-white">Time: {timeLimit / 1000}s</label>
                <Slider
                  value={[timeLimit]}
                  onValueChange={(value) => setTimeLimit(value[0])}
                  min={5000}
                  max={30000}
                  step={1000}
                  className="w-full bg-gray-800"
                />
              </div>

              <div className="space-y-2 w-full">
                <label className="text-sm text-white">Grid Size: {gridSize}</label>
                <Slider
                  value={[gridSize]}
                  onValueChange={(value) => setGridSize(value[0])}
                  min={8}
                  max={50}
                  step={1}
                  className="w-full bg-gray-800"
                />
              </div>

              <div className="space-y-2 w-full">
                <label className="text-sm text-white">Max Strikes: {maxStrikes}</label>
                <Slider
                  value={[maxStrikes]}
                  onValueChange={(value) => setMaxStrikes(value[0])}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full bg-gray-800"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {gameState.started && (
        <div className="w-full max-w-[650px] flex items-center justify-between px-4 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-white">Strikes:</span>
            <div className="flex gap-1">
              {Array.from({ length: maxStrikes }).map((_, i) => (
                <X
                  key={i}
                  className={cn(
                    "w-6 h-6",
                    i < gameState.strikes ? "text-red-500" : "text-gray-600"
                  )}
                />
              ))}
            </div>
          </div>
          <div className="text-white">
            {maxStrikes - gameState.strikes} attempts remaining
          </div>
        </div>
      )}

      <div className="relative w-full max-w-[650px] bg-gray-800 p-2 pb-6 rounded-sm">
        <div
          className="grid gap-0.5 h-full"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, i) => {
            const x = i % gridSize
            const y = Math.floor(i / gridSize)
            const isPath = isOnPath({ x, y })
            const isPlayer = playerPosition.x === x && playerPosition.y === y
            const isStrike = gameState.strikePositions.some(pos => pos.x === x && pos.y === y)

            return (
              <div
                key={i}
                className={cn(
                  "relative aspect-square transition-colors",
                  isPath && "bg-blue-500/20",
                  isPlayer && (isPath ? "bg-green-500" : "bg-red-500"),
                  isStrike && !isPlayer && "bg-red-500/30",
                  !isPath && !isPlayer && !isStrike && "bg-gray-700",
                )}
              />
            )
          })}

          {gameState.started && (
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500"
                  style={{
                    width: `${(gameState.timeRemaining / timeLimit) * 100}%`
                  }}
                />
              </div>
            </div>
          )}

          {!gameState.started && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
              {gameState.ended ? (
                <>
                  <span className="text-2xl font-bold text-white mb-4">
                    {gameState.success
                      ? "Success!"
                      : gameState.failReason === "time"
                        ? "Time's up!"
                        : "Too many wrong moves!"}
                  </span>
                  <span className="text-sm text-white mb-4">Press spacebar to try again</span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold text-white mb-4">Path Game</span>
                  <span className="text-sm text-white mb-4">Press spacebar to start</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}