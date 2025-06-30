"use client"

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Trophy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Define types for key game objects
type Dot = {
  x: number;
  y: number;
};

type Line = {
  start: number;
  end: number;
  intersecting: boolean;
};

type Intersection = {
  x: number;
  y: number;
};

const UntangleGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [bestTime, setBestTime] = useState<number>(99.999);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(10);
  const [dots, setDots] = useState<number>(7);
  const [showIntersections, setShowIntersections] = useState<boolean>(true);
  const [gameDotsState, setGameDotsState] = useState<Dot[]>([]);
  const [gameLinesState, setGameLinesState] = useState<Line[]>([]);
  const [selectedDot, setSelectedDot] = useState<number | null>(null);
  const [offset, setOffset] = useState<{x: number, y: number}>({ x: 0, y: 0 });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const random = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min)) + min;
  };

  const createDots = (): Dot[] => {
    const radius = 200;
    const centerX = 250;
    const centerY = 250;
    const newDots: Dot[] = [];

    for(let i = 0; i < dots; i++) {
      newDots.push({
        x: Math.floor(centerX + radius * Math.cos(2 * Math.PI * i / dots)),
        y: Math.floor(centerY + radius * Math.sin(2 * Math.PI * i / dots)),
      });
    }
    return newDots;
  };

  const createLines = (currentDots: Dot[]): Line[] => {
    const newLines: Line[] = [];
    let limit = new Array(currentDots.length).fill(0);
    const maxConnects = 4;
    let finish = false;
    let tries = 0;

    while (!finish && tries < 1000) {
      tries += 1;

      if(tries > 100) {
        limit = new Array(currentDots.length).fill(0);
        newLines.length = 0;
      }

      let from = random(0, currentDots.length);
      let to = random(0, currentDots.length);

      if (from === to ||
          limit[from] === maxConnects ||
          limit[to] === maxConnects ||
          newLines.some(line =>
            (line.start === from && line.end === to) ||
            (line.start === to && line.end === from)
          )) {
        continue;
      }

      limit[from] += 1;
      limit[to] += 1;

      newLines.push({ start: from, end: to, intersecting: false });

      finish = limit.every(num => num >= 2);
    }
    return newLines;
  };

  const getIntersection = (x1: number, y1: number, x2: number, y2: number,
                            x3: number, y3: number, x4: number, y4: number): Intersection | null => {
    const EPSILON = 0.000001;

    const det1 = (x1 - x2) * (y3 - y4);
    const det2 = (y1 - y2) * (x3 - x4);
    const det = det1 - det2;

    if (Math.abs(det) < EPSILON) return null;

    const x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / det;
    const y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / det;

    if (x < Math.min(x1, x2) - EPSILON || x > Math.max(x1, x2) + EPSILON ||
        y < Math.min(y1, y2) - EPSILON || y > Math.max(y1, y2) + EPSILON ||
        x < Math.min(x3, x4) - EPSILON || x > Math.max(x3, x4) + EPSILON ||
        y < Math.min(y3, y4) - EPSILON || y > Math.max(y3, y4) + EPSILON) {
        return null;
    }

    return { x, y };
  };

  const detectIntersections = (currentDots: Dot[], currentLines: Line[]):
  { intersections: Intersection[], updatedLines: Line[] } => {
    const updatedLines = currentLines.map(line => ({ ...line, intersecting: false }));
    const intersections: Intersection[] = [];

    for (let i = 0; i < updatedLines.length; i++) {
      for (let j = i + 1; j < updatedLines.length; j++) {
        const line1 = updatedLines[i];
        const line2 = updatedLines[j];

        if (line1.start === line2.start ||
            line1.start === line2.end ||
            line1.end === line2.start ||
            line1.end === line2.end) {
          continue;
        }

        const start1 = currentDots[line1.start];
        const end1 = currentDots[line1.end];
        const start2 = currentDots[line2.start];
        const end2 = currentDots[line2.end];

        const intersection = getIntersection(
          start1.x, start1.y, end1.x, end1.y,
          start2.x, start2.y, end2.x, end2.y
        );

        if (intersection) {
          intersections.push(intersection);
          updatedLines[i].intersecting = true;
          updatedLines[j].intersecting = true;
        }
      }
    }

    return { intersections, updatedLines };
  };

  const draw = (currentDots: Dot[] = gameDotsState, currentLines: Line[] = gameLinesState):
  { intersections: Intersection[], updatedLines: Line[] } => {
    const canvas = canvasRef.current;
    if (!canvas) return { intersections: [], updatedLines: currentLines };

    const ctx = canvas.getContext('2d');
    if (!ctx) return { intersections: [], updatedLines: currentLines };

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { intersections, updatedLines } = detectIntersections(currentDots, currentLines);

    updatedLines.forEach(line => {
      const start = currentDots[line.start];
      const end = currentDots[line.end];

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.strokeStyle = line.intersecting ? 'red' : 'green';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    if (showIntersections) {
      ctx.fillStyle = 'blue';
      intersections.forEach(intersection => {
        ctx.beginPath();
        ctx.arc(intersection.x, intersection.y, 9, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.fillStyle = 'green';
    currentDots.forEach(dot => {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 7, 0, Math.PI * 2);
      ctx.fill();
    });

    return { intersections, updatedLines };
  };

  const startGame = () => {
    const newDots = createDots();
    const newLines = createLines(newDots);

    setGameDotsState(newDots);
    setGameLinesState(newLines);

    const { intersections, updatedLines } = draw(newDots, newLines);

    if (intersections.length === 0) {
      startGame();
      return;
    }

    setGameStarted(true);
    setGameLinesState(updatedLines);
    startTimer();

    if (gameTimeoutRef.current) {
      clearTimeout(gameTimeoutRef.current);
    }
    gameTimeoutRef.current = setTimeout(() => {
      checkGame(true);
    }, speed * 1000);
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setCurrentTime(elapsed);
    }, 1);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const checkGame = (timeout = false) => {
    const { intersections, updatedLines } = draw();
    setGameLinesState(updatedLines);

    if (intersections.length === 0) {
      setStreak(s => s + 1);
      setMaxStreak(m => Math.max(m, streak + 1));
      if (currentTime < bestTime) {
        setBestTime(currentTime);
      }
      if (!timeout) {
        stopTimer();
        resetGame();
      }
    }

    if (timeout) {
      setStreak(0);
      resetGame();
    }
  };

  const resetGame = () => {
    stopTimer();
    if (gameTimeoutRef.current) {
      clearTimeout(gameTimeoutRef.current);
    }
    setGameStarted(false);
    setCurrentTime(0);
    setSelectedDot(null);
    setGameDotsState([]);
    setGameLinesState([]);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = 0; i < gameDotsState.length; i++) {
      const dot = gameDotsState[i];
      const dx = x - dot.x;
      const dy = y - dot.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= 7) {
        setSelectedDot(i);
        setOffset({ x: dx, y: dy });
        break;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || selectedDot === null) return;

    const rect = canvas.getBoundingClientRect();
    const newX = e.clientX - rect.left - offset.x;
    const newY = e.clientY - rect.top - offset.y;

    setGameDotsState(prevDots => {
      const newDots = [...prevDots];
      newDots[selectedDot] = { x: newX, y: newY };
      return newDots;
    });
  };

  const handleMouseUp = () => {
    if (selectedDot !== null) {
      setSelectedDot(null);
      checkGame();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 500;
      canvas.height = 500;
    }
  }, []);

  useEffect(() => {
    if (gameDotsState.length > 0 && gameLinesState.length > 0) {
      const { updatedLines } = draw();
      setGameLinesState(updatedLines);
    }
  }, [gameDotsState]);

  return (
    <div className="flex flex-col items-center mt-16 gap-6 p-4 bg-black text-white">
      <div className="w-full max-w-lg space-y-4">
        <div className="w-full max-w-2xl space-y-6">
          <div className="flex gap-6 w-full">
            <div className="flex-1">
              <label className="block text-sm mb-2 text-gray-300">Speed: {speed}s</label>
              <Slider
                min={5}
                max={60}
                value={[speed]}
                onValueChange={(value: number[]) => setSpeed(value[0])}
                className="bg-gray-700"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm mb-2 text-gray-300">Dots: {dots}</label>
              <Slider
                min={5}
                max={10}
                value={[dots]}
                onValueChange={(value: number[]) => setDots(value[0])}
                className="bg-gray-700"
              />
            </div>
          </div>

          <label className="flex items-center justify-center gap-2 text-gray-300">
            <input
              type="checkbox"
              checked={showIntersections}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowIntersections(e.target.checked)}
              className="bg-gray-700"
            />
            Show Intersections
          </label>
        </div>
      </div>

      <div className="relative">
        {!gameStarted && (
          <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center bg-black/90 text-white">
            <div className="mb-4">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto" />
              <p className="mt-2 text-center text-purple-400">Untangle the lines...</p>
            </div>
            <Button
              size="lg"
              onClick={startGame}
              className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              Start Game
            </Button>
          </div>
        )}

        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="bg-gray-900 rounded-lg"
        />
        {gameStarted && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900/50">
        <div className="w-full flex items-center gap-4">
          <Progress
            value={((speed - currentTime) / speed) * 100}
            className="h-2 flex-1"
            indicatorClassName="bg-green-500"
          />
        </div>
          </div>
        )}
      </div>

      <Button
        size="lg"
        onClick={resetGame}
        className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
      >
        Reset Game
      </Button>
    </div>
  );
};

export default UntangleGame;