import React, { useState, useRef, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";
import Icon from "./components/Icon";
import { createBlockInstance } from "./constants/blocks";

const SPRITE_COLORS = [
  "#FFAB19", // Classic Scratch Orange
  "#2563EB", // Blue
  "#10B981", // Emerald
  "#EC4899", // Pink
  "#8B5CF6", // Purple
];

const COLLISION_THRESHOLD = 60; // Pixels distance between sprite centers

export default function App() {
  const [sprites, setSprites] = useState([
    {
      id: "sprite_1",
      name: "Sprite 1",
      color: SPRITE_COLORS[0],
      x: -120,
      y: 0,
      direction: 90,
      bubble: null,
      actions: [
        createBlockInstance({ type: "WHEN_FLAG_CLICKED", category: "events" }),
        createBlockInstance({
          type: "REPEAT",
          category: "controls",
          times: 15,
          children: [
            createBlockInstance({ type: "MOVE_STEPS", category: "motion", steps: 10 }),
          ],
        }),
      ],
    },
    {
      id: "sprite_2",
      name: "Sprite 2",
      color: SPRITE_COLORS[1],
      x: 120,
      y: 0,
      direction: 90,
      bubble: null,
      actions: [
        createBlockInstance({ type: "WHEN_FLAG_CLICKED", category: "events" }),
        createBlockInstance({
          type: "REPEAT",
          category: "controls",
          times: 15,
          children: [
            createBlockInstance({ type: "MOVE_STEPS", category: "motion", steps: -10 }),
          ],
        }),
      ],
    },
  ]);

  const [activeSpriteId, setActiveSpriteId] = useState("sprite_1");
  const [isRunning, setIsRunning] = useState(false);
  const [heroFeatureEnabled, setHeroFeatureEnabled] = useState(true);
  const [collisionNotification, setCollisionNotification] = useState(null);

  // References to keep track of running state and avoid stale closures
  const isRunningRef = useRef(false);
  const spritesRef = useRef(sprites);
  spritesRef.current = sprites;

  const collisionCooldownRef = useRef(false);
  const runningAbortControllers = useRef(new Map());

  // Helper sleep function that supports abort cancellation
  const sleep = (ms) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => resolve(), ms);
      if (!isRunningRef.current) {
        clearTimeout(timer);
        reject(new Error("aborted"));
      }
    });
  };

  // Update a single sprite in state
  const handleUpdateSprite = (spriteId, updates) => {
    setSprites((prev) =>
      prev.map((s) => (s.id === spriteId ? { ...s, ...updates } : s))
    );
  };

  // Update actions for a sprite
  const handleUpdateSpriteActions = (actions) => {
    handleUpdateSprite(activeSpriteId, { actions });
  };

  // Add a block to active sprite's actions
  const handleAddBlockToActiveSprite = (block) => {
    const active = sprites.find((s) => s.id === activeSpriteId);
    if (!active) return;
    handleUpdateSprite(activeSpriteId, {
      actions: [...(active.actions || []), block],
    });
  };

  // Add a new sprite character
  const handleAddSprite = () => {
    const nextIdx = sprites.length;
    const color = SPRITE_COLORS[nextIdx % SPRITE_COLORS.length];
    const newSprite = {
      id: `sprite_${Date.now()}`,
      name: `Sprite ${nextIdx + 1}`,
      color,
      x: Math.round((Math.random() - 0.5) * 160),
      y: Math.round((Math.random() - 0.5) * 100),
      direction: 90,
      bubble: null,
      actions: [
        createBlockInstance({ type: "WHEN_FLAG_CLICKED", category: "events" }),
        createBlockInstance({ type: "MOVE_STEPS", category: "motion", steps: 10 }),
      ],
    };
    setSprites((prev) => [...prev, newSprite]);
    setActiveSpriteId(newSprite.id);
  };

  // Delete a sprite
  const handleDeleteSprite = (spriteId) => {
    if (sprites.length <= 1) return;
    setSprites((prev) => {
      const filtered = prev.filter((s) => s.id !== spriteId);
      if (activeSpriteId === spriteId && filtered.length > 0) {
        setActiveSpriteId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Load Hero Feature Collision Swap Preset Demo
  const handleLoadHeroDemo = () => {
    handleStop();
    setSprites([
      {
        id: "sprite_1",
        name: "Character 1",
        color: SPRITE_COLORS[0],
        x: -120,
        y: 0,
        direction: 90,
        bubble: null,
        actions: [
          createBlockInstance({ type: "WHEN_FLAG_CLICKED", category: "events" }),
          createBlockInstance({
            type: "REPEAT",
            category: "controls",
            times: 16,
            children: [
              createBlockInstance({ type: "MOVE_STEPS", category: "motion", steps: 10 }),
            ],
          }),
        ],
      },
      {
        id: "sprite_2",
        name: "Character 2",
        color: SPRITE_COLORS[1],
        x: 120,
        y: 0,
        direction: 90,
        bubble: null,
        actions: [
          createBlockInstance({ type: "WHEN_FLAG_CLICKED", category: "events" }),
          createBlockInstance({
            type: "REPEAT",
            category: "controls",
            times: 16,
            children: [
              createBlockInstance({ type: "MOVE_STEPS", category: "motion", steps: -10 }),
            ],
          }),
        ],
      },
    ]);
    setActiveSpriteId("sprite_1");
    setHeroFeatureEnabled(true);
    setCollisionNotification("⚡ Hero Demo Loaded! Click the Green Flag to see Collision Swap in action!");
    setTimeout(() => setCollisionNotification(null), 4000);
  };

  // Reset all sprites
  const handleReset = () => {
    handleStop();
    setSprites((prev) =>
      prev.map((s, idx) => ({
        ...s,
        x: idx === 0 ? -120 : idx === 1 ? 120 : 0,
        y: 0,
        direction: 90,
        bubble: null,
      }))
    );
  };

  // Collision Detection and Animation Swapping
  const checkCollisionsAndSwap = useCallback(() => {
    if (!heroFeatureEnabled || collisionCooldownRef.current) return;

    const currentSprites = spritesRef.current;
    if (currentSprites.length < 2) return;

    for (let i = 0; i < currentSprites.length; i++) {
      for (let j = i + 1; j < currentSprites.length; j++) {
        const s1 = currentSprites[i];
        const s2 = currentSprites[j];

        const dist = Math.hypot(s1.x - s2.x, s1.y - s2.y);

        if (dist < COLLISION_THRESHOLD) {
          // Collision Detected!
          collisionCooldownRef.current = true;

          // Swap animations between s1 and s2
          const s1Actions = JSON.parse(JSON.stringify(s1.actions || []));
          const s2Actions = JSON.parse(JSON.stringify(s2.actions || []));

          setSprites((prev) =>
            prev.map((s) => {
              if (s.id === s1.id) {
                return { ...s, actions: s2Actions };
              }
              if (s.id === s2.id) {
                return { ...s, actions: s1Actions };
              }
              return s;
            })
          );

          setCollisionNotification(
            `💥 Collision between ${s1.name} & ${s2.name}! Swapped their animations!`
          );

          setTimeout(() => {
            setCollisionNotification(null);
          }, 3500);

          // Cooldown before next collision swap to avoid immediate oscillation
          setTimeout(() => {
            collisionCooldownRef.current = false;
          }, 1200);

          return { swapped: true, s1Id: s1.id, s2Id: s2.id };
        }
      }
    }
    return null;
  }, [heroFeatureEnabled]);

  // Execute a single block for a sprite
  const executeBlock = async (spriteId, block) => {
    if (!isRunningRef.current) return;

    const getSprite = () => spritesRef.current.find((s) => s.id === spriteId);

    switch (block.type) {
      case "MOVE_STEPS": {
        const steps = block.steps ?? 10;
        const current = getSprite();
        if (!current) return;

        // Scratch angle standard: 90 is right, 0 is up
        const rad = ((current.direction ?? 90) * Math.PI) / 180;
        const dx = steps * Math.sin(rad);
        const dy = steps * Math.cos(rad);

        // Animate movement in 3 micro-steps for smooth visual flow
        const subSteps = 3;
        for (let i = 1; i <= subSteps; i++) {
          if (!isRunningRef.current) break;
          const target = getSprite();
          if (!target) break;

          handleUpdateSprite(spriteId, {
            x: Math.round(target.x + dx / subSteps),
            y: Math.round(target.y + dy / subSteps),
          });

          checkCollisionsAndSwap();
          await sleep(35);
        }
        break;
      }

      case "TURN_RIGHT": {
        const deg = block.degrees ?? 15;
        const current = getSprite();
        if (!current) return;
        const newDir = ((current.direction ?? 90) + deg) % 360;
        handleUpdateSprite(spriteId, { direction: newDir });
        await sleep(50);
        break;
      }

      case "TURN_LEFT": {
        const deg = block.degrees ?? 15;
        const current = getSprite();
        if (!current) return;
        const newDir = ((current.direction ?? 90) - deg) % 360;
        handleUpdateSprite(spriteId, { direction: newDir });
        await sleep(50);
        break;
      }

      case "GOTO_XY": {
        const targetX = block.x ?? 0;
        const targetY = block.y ?? 0;
        handleUpdateSprite(spriteId, { x: targetX, y: targetY });
        checkCollisionsAndSwap();
        await sleep(100);
        break;
      }

      case "SAY_FOR_SECS": {
        const msg = block.message ?? "Hello!";
        const secs = block.seconds ?? 2;
        handleUpdateSprite(spriteId, {
          bubble: { type: "say", text: msg },
        });
        await sleep(secs * 1000);
        handleUpdateSprite(spriteId, { bubble: null });
        break;
      }

      case "THINK_FOR_SECS": {
        const msg = block.message ?? "Hmm...";
        const secs = block.seconds ?? 2;
        handleUpdateSprite(spriteId, {
          bubble: { type: "think", text: msg },
        });
        await sleep(secs * 1000);
        handleUpdateSprite(spriteId, { bubble: null });
        break;
      }

      case "REPEAT": {
        const times = block.times ?? 5;
        const innerBlocks = block.children || [];

        for (let t = 0; t < times; t++) {
          if (!isRunningRef.current) break;

          if (innerBlocks.length > 0) {
            for (const child of innerBlocks) {
              if (!isRunningRef.current) break;
              await executeBlock(spriteId, child);
            }
          } else {
            // Default motion if empty repeat
            await executeBlock(spriteId, { type: "MOVE_STEPS", steps: 10 });
          }
          await sleep(60);
        }
        break;
      }

      case "WHEN_FLAG_CLICKED":
        // Header block, proceed immediately
        break;

      default:
        break;
    }
  };

  // Run script for a specific sprite
  const runSpriteScript = async (spriteId) => {
    const sprite = spritesRef.current.find((s) => s.id === spriteId);
    if (!sprite || !sprite.actions) return;

    for (const block of sprite.actions) {
      if (!isRunningRef.current) break;
      await executeBlock(spriteId, block);
    }
  };

  // Run all sprites concurrently (Play / Green Flag)
  const handlePlay = async () => {
    if (isRunning) return;

    setIsRunning(true);
    isRunningRef.current = true;
    collisionCooldownRef.current = false;

    try {
      // Execute all sprites in parallel
      await Promise.all(
        spritesRef.current.map((sprite) => runSpriteScript(sprite.id))
      );
    } catch (err) {
      // Aborted or finished
    } finally {
      setIsRunning(false);
      isRunningRef.current = false;
      // Clear any remaining speech/thought bubbles
      setSprites((prev) =>
        prev.map((s) => ({ ...s, bubble: null }))
      );
    }
  };

  // Stop all running animations
  const handleStop = () => {
    isRunningRef.current = false;
    setIsRunning(false);
    setSprites((prev) =>
      prev.map((s) => ({ ...s, bubble: null }))
    );
  };

  // Run only active sprite's script
  const handleRunSingleSprite = async (spriteId) => {
    if (isRunning) return;
    setIsRunning(true);
    isRunningRef.current = true;
    try {
      await runSpriteScript(spriteId);
    } finally {
      setIsRunning(false);
      isRunningRef.current = false;
      setSprites((prev) =>
        prev.map((s) => (s.id === spriteId ? { ...s, bubble: null } : s))
      );
    }
  };

  // Clear script for active sprite
  const handleClearSingleSprite = (spriteId) => {
    handleUpdateSprite(spriteId, { actions: [] });
  };

  const activeSprite =
    sprites.find((s) => s.id === activeSpriteId) || sprites[0];

  return (
    <div className="bg-blue-50 h-screen w-screen overflow-hidden flex flex-col font-sans select-none">
      {/* Top Main Navigation Header */}
      <header className="h-12 bg-blue-600 text-white flex items-center justify-between px-4 shadow-sm flex-none z-30">
        <div className="flex items-center space-x-3">
          {/* Scratch Logo Badge */}
          <div className="flex items-center space-x-1.5 font-black text-lg tracking-tight bg-blue-700 px-2.5 py-1 rounded-md shadow-inner">
            <span className="text-yellow-400">SCRATCH</span>
            <span className="text-xs bg-yellow-400 text-blue-900 px-1.5 py-0.2 rounded font-bold">
              VISUAL
            </span>
          </div>
          <span className="text-xs text-blue-200 hidden sm:inline">
            React Visual Coding Environment
          </span>
        </div>

        {/* Center Quick Controls */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handlePlay}
            disabled={isRunning}
            className={`px-3 py-1 text-xs font-bold rounded-full flex items-center space-x-1.5 transition-all shadow-sm ${
              isRunning
                ? "bg-green-300 text-green-900 cursor-not-allowed opacity-75"
                : "bg-green-500 hover:bg-green-400 active:scale-95 text-white ring-2 ring-green-300"
            }`}
            title="Start (Green Flag)"
          >
            <Icon name="flag" size={14} className="text-white" />
            <span>Go</span>
          </button>

          <button
            type="button"
            onClick={handleStop}
            className="px-3 py-1 text-xs font-bold bg-red-500 hover:bg-red-400 active:scale-95 text-white rounded-full flex items-center space-x-1.5 shadow-sm ring-2 ring-red-300 transition-all"
            title="Stop All"
          >
            <Icon name="stop" size={12} />
            <span>Stop</span>
          </button>
        </div>

        {/* Right Info & Hero Status */}
        <div className="flex items-center space-x-3">
          <div
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center space-x-1 ${
              heroFeatureEnabled
                ? "bg-amber-400 text-amber-950 ring-1 ring-amber-300"
                : "bg-blue-700 text-blue-200"
            }`}
          >
            <Icon name="bolt" size={12} />
            <span>Hero Swap {heroFeatureEnabled ? "ON" : "OFF"}</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 overflow-hidden flex flex-row p-2 gap-2">
        {/* Left Coding Area: Sidebar + MidArea Canvas */}
        <div className="flex-1 h-full overflow-hidden flex flex-row bg-white rounded-xl shadow-sm border border-gray-200">
          <Sidebar onAddBlock={handleAddBlockToActiveSprite} />
          <MidArea
            activeSprite={activeSprite}
            onUpdateSpriteActions={handleUpdateSpriteActions}
            onRunSpriteScript={handleRunSingleSprite}
            onClearSpriteScript={handleClearSingleSprite}
          />
        </div>

        {/* Right Stage & Sprites Area */}
        <div className="w-[490px] flex-none h-full overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200">
          <PreviewArea
            sprites={sprites}
            activeSpriteId={activeSpriteId}
            onSelectSprite={setActiveSpriteId}
            onAddSprite={handleAddSprite}
            onDeleteSprite={handleDeleteSprite}
            onUpdateSprite={handleUpdateSprite}
            isRunning={isRunning}
            onPlay={handlePlay}
            onStop={handleStop}
            onReset={handleReset}
            onLoadHeroDemo={handleLoadHeroDemo}
            heroFeatureEnabled={heroFeatureEnabled}
            onToggleHeroFeature={() => setHeroFeatureEnabled(!heroFeatureEnabled)}
            collisionNotification={collisionNotification}
          />
        </div>
      </div>
    </div>
  );
}
