import React, { useState, useRef, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";
import Icon from "./components/Icon";
import {
  createBlockInstance,
  findBlockById,
  findFirstRepeat,
} from "./constants/blocks";

const SPRITE_COLORS = [
  "#FFAB19", // Classic Scratch Orange
  "#2563EB", // Blue
  "#10B981", // Emerald
  "#EC4899", // Pink
  "#8B5CF6", // Purple
];

const COLLISION_THRESHOLD = 65; // Pixels distance between sprite centers for touching bounds

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
          times: 20,
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
          times: 20,
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

  // Synchronous execution engine references to avoid stale closures and race conditions
  const isRunningRef = useRef(false);
  const executionEpochRef = useRef(0);
  const runtimeStateRef = useRef({});
  const activeTimeoutsRef = useRef(new Set());
  const collidingPairsRef = useRef(new Set());

  // Keep runtime state synchronized with sprite state
  useEffect(() => {
    const map = { ...runtimeStateRef.current };
    sprites.forEach((s) => {
      if (!map[s.id] || !isRunningRef.current) {
        map[s.id] = { ...s };
      } else {
        // While running, keep real-time x, y, direction but sync actions, name, color
        map[s.id] = {
          ...map[s.id],
          name: s.name,
          color: s.color,
          actions: s.actions,
        };
      }
    });
    // Remove any sprites that were deleted
    Object.keys(map).forEach((id) => {
      if (!sprites.some((s) => s.id === id)) {
        delete map[id];
      }
    });
    runtimeStateRef.current = map;
  }, [sprites]);

  // Clean cancellation sleep helper
  const sleep = (ms, epoch) => {
    return new Promise((resolve, reject) => {
      if (!isRunningRef.current || executionEpochRef.current !== epoch) {
        return reject(new Error("aborted"));
      }
      const timer = setTimeout(() => {
        activeTimeoutsRef.current.delete(timer);
        if (!isRunningRef.current || executionEpochRef.current !== epoch) {
          return reject(new Error("aborted"));
        }
        resolve();
      }, ms);
      activeTimeoutsRef.current.add(timer);
    });
  };

  // Immediate runtime and state update for smooth animation & sync
  const updateSpriteRuntime = (spriteId, updates) => {
    if (runtimeStateRef.current[spriteId]) {
      Object.assign(runtimeStateRef.current[spriteId], updates);
    }
    setSprites((prev) =>
      prev.map((s) => (s.id === spriteId ? { ...s, ...updates } : s))
    );
  };

  // Update a single sprite in state
  const handleUpdateSprite = (spriteId, updates) => {
    updateSpriteRuntime(spriteId, updates);
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

  // Delete a sprite and clean up its runtime resources
  const handleDeleteSprite = (spriteId) => {
    if (sprites.length <= 1) return;

    // Clean up runtime state
    delete runtimeStateRef.current[spriteId];

    // Clean up collision pairs
    const pairsToDelete = [];
    collidingPairsRef.current.forEach((pair) => {
      if (pair.includes(spriteId)) {
        pairsToDelete.push(pair);
      }
    });
    pairsToDelete.forEach((p) => collidingPairsRef.current.delete(p));

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
    const heroSprites = [
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
            times: 20,
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
            times: 20,
            children: [
              createBlockInstance({ type: "MOVE_STEPS", category: "motion", steps: -10 }),
            ],
          }),
        ],
      },
    ];

    setSprites(heroSprites);
    setActiveSpriteId("sprite_1");
    setHeroFeatureEnabled(true);
    setCollisionNotification("⚡ Hero Demo Loaded! Click Run to see Collision Swap in action!");
    const timer = setTimeout(() => setCollisionNotification(null), 4000);
    activeTimeoutsRef.current.add(timer);
  };

  // Stop all active scripts, animations, and timers
  const handleStop = () => {
    executionEpochRef.current++;
    isRunningRef.current = false;
    setIsRunning(false);
    collidingPairsRef.current.clear();

    // Cancel all active timeouts immediately
    activeTimeoutsRef.current.forEach((timer) => clearTimeout(timer));
    activeTimeoutsRef.current.clear();

    // Clear any speech or thought bubbles
    setSprites((prev) => prev.map((s) => ({ ...s, bubble: null })));
    Object.values(runtimeStateRef.current).forEach((s) => {
      if (s) s.bubble = null;
    });
  };

  // Reset all sprites to initial positions
  const handleReset = () => {
    handleStop();
    const updated = sprites.map((s, idx) => ({
      ...s,
      x: idx === 0 ? -120 : idx === 1 ? 120 : 0,
      y: 0,
      direction: 90,
      bubble: null,
    }));
    updated.forEach((s) => {
      if (runtimeStateRef.current[s.id]) {
        Object.assign(runtimeStateRef.current[s.id], {
          x: s.x,
          y: s.y,
          direction: 90,
          bubble: null,
        });
      }
    });
    setSprites(updated);
  };

  // Deterministic Collision Detection & Animation Swapping with Lifecycle
  const checkCollisionsAndSwap = (epoch) => {
    if (!heroFeatureEnabled || !isRunningRef.current || executionEpochRef.current !== epoch) {
      return null;
    }

    const currentSprites = Object.values(runtimeStateRef.current);
    if (currentSprites.length < 2) return null;

    let swappedSpriteIds = null;

    for (let i = 0; i < currentSprites.length; i++) {
      for (let j = i + 1; j < currentSprites.length; j++) {
        const s1 = currentSprites[i];
        const s2 = currentSprites[j];
        if (!s1 || !s2) continue;

        const pairKey = s1.id < s2.id ? `${s1.id}__${s2.id}` : `${s2.id}__${s1.id}`;
        const dist = Math.hypot(s1.x - s2.x, s1.y - s2.y);
        const isColliding = dist < COLLISION_THRESHOLD;

        if (isColliding) {
          if (!collidingPairsRef.current.has(pairKey)) {
            // New collision event! Lifecycle enters 'colliding'
            collidingPairsRef.current.add(pairKey);

            // Deep clone actions to swap
            const s1Actions = JSON.parse(JSON.stringify(s1.actions || []));
            const s2Actions = JSON.parse(JSON.stringify(s2.actions || []));

            // Swap directions if different
            const s1Dir = s1.direction ?? 90;
            const s2Dir = s2.direction ?? 90;

            runtimeStateRef.current[s1.id].actions = s2Actions;
            runtimeStateRef.current[s2.id].actions = s1Actions;
            if (s1Dir !== s2Dir) {
              runtimeStateRef.current[s1.id].direction = s2Dir;
              runtimeStateRef.current[s2.id].direction = s1Dir;
            }

            setSprites((prev) =>
              prev.map((s) => {
                if (s.id === s1.id) {
                  return {
                    ...s,
                    actions: s2Actions,
                    direction: s1Dir !== s2Dir ? s2Dir : s.direction,
                  };
                }
                if (s.id === s2.id) {
                  return {
                    ...s,
                    actions: s1Actions,
                    direction: s1Dir !== s2Dir ? s1Dir : s.direction,
                  };
                }
                return s;
              })
            );

            setCollisionNotification(
              `💥 Collision between ${s1.name} & ${s2.name}! Swapped their animations!`
            );
            const notifTimer = setTimeout(() => {
              setCollisionNotification(null);
            }, 3000);
            activeTimeoutsRef.current.add(notifTimer);

            swappedSpriteIds = [s1.id, s2.id];
          }
        } else if (dist > COLLISION_THRESHOLD + 10) {
          // Sprites have separated! Clean transition in lifecycle allows next collision
          if (collidingPairsRef.current.has(pairKey)) {
            collidingPairsRef.current.delete(pairKey);
          }
        }
      }
    }

    return swappedSpriteIds;
  };

  // Execute a single block for a sprite
  const executeBlock = async (spriteId, block, epoch) => {
    if (!isRunningRef.current || executionEpochRef.current !== epoch) return;

    const getSprite = () => runtimeStateRef.current[spriteId];

    switch (block.type) {
      case "MOVE_STEPS": {
        const steps = block.steps ?? 10;
        const subSteps = 3;

        for (let i = 1; i <= subSteps; i++) {
          if (!isRunningRef.current || executionEpochRef.current !== epoch) break;
          const current = getSprite();
          if (!current) break;

          // Scratch angle standard: 90 is right (+X), 0 is up (+Y), 180 is down (-Y), 270 is left (-X)
          const rad = ((current.direction ?? 90) * Math.PI) / 180;
          const dx = steps * Math.sin(rad);
          const dy = steps * Math.cos(rad);

          const nextX = Math.round(current.x + dx / subSteps);
          const nextY = Math.round(current.y + dy / subSteps);

          // Keep within stage boundary limits (-220 to 220, -160 to 160)
          const boundedX = Math.max(-220, Math.min(220, nextX));
          const boundedY = Math.max(-160, Math.min(160, nextY));

          updateSpriteRuntime(spriteId, { x: boundedX, y: boundedY });

          const swapped = checkCollisionsAndSwap(epoch);
          if (swapped && swapped.includes(spriteId)) {
            // Reversal on swap: finish this Move early so new swapped action takes effect immediately
            break;
          }
          await sleep(30, epoch);
        }
        break;
      }

      case "TURN_RIGHT": {
        const deg = block.degrees ?? 15;
        const current = getSprite();
        if (!current) return;
        const newDir = ((current.direction ?? 90) + deg) % 360;
        updateSpriteRuntime(spriteId, { direction: newDir });
        await sleep(40, epoch);
        break;
      }

      case "TURN_LEFT": {
        const deg = block.degrees ?? 15;
        const current = getSprite();
        if (!current) return;
        let newDir = ((current.direction ?? 90) - deg) % 360;
        if (newDir < 0) newDir += 360;
        updateSpriteRuntime(spriteId, { direction: newDir });
        await sleep(40, epoch);
        break;
      }

      case "GOTO_XY": {
        const targetX = Math.max(-220, Math.min(220, block.x ?? 0));
        const targetY = Math.max(-160, Math.min(160, block.y ?? 0));
        updateSpriteRuntime(spriteId, { x: targetX, y: targetY });
        checkCollisionsAndSwap(epoch);
        await sleep(60, epoch);
        break;
      }

      case "SAY_FOR_SECS": {
        const msg = block.message ?? "Hello!";
        const secs = Math.max(0.2, block.seconds ?? 2);
        updateSpriteRuntime(spriteId, {
          bubble: { type: "say", text: msg },
        });
        await sleep(secs * 1000, epoch);
        if (isRunningRef.current && executionEpochRef.current === epoch) {
          updateSpriteRuntime(spriteId, { bubble: null });
        }
        break;
      }

      case "THINK_FOR_SECS": {
        const msg = block.message ?? "Hmm...";
        const secs = Math.max(0.2, block.seconds ?? 2);
        updateSpriteRuntime(spriteId, {
          bubble: { type: "think", text: msg },
        });
        await sleep(secs * 1000, epoch);
        if (isRunningRef.current && executionEpochRef.current === epoch) {
          updateSpriteRuntime(spriteId, { bubble: null });
        }
        break;
      }

      case "REPEAT": {
        const times = block.times ?? 5;

        for (let t = 0; t < times; t++) {
          if (!isRunningRef.current || executionEpochRef.current !== epoch) break;

          // Dynamically retrieve current version of repeat block for this sprite
          // This allows swapped animations (from collisions) to execute immediately!
          const currentSprite = getSprite();
          const currentActions = currentSprite?.actions || [];
          const activeRepeat =
            findBlockById(currentActions, block.id) ||
            findFirstRepeat(currentActions) ||
            block;
          const innerBlocks = activeRepeat.children || [];

          if (innerBlocks.length > 0) {
            for (const child of innerBlocks) {
              if (!isRunningRef.current || executionEpochRef.current !== epoch) break;
              await executeBlock(spriteId, child, epoch);
            }
          } else {
            await executeBlock(spriteId, { type: "MOVE_STEPS", steps: 10 }, epoch);
          }
          await sleep(40, epoch);
        }
        break;
      }

      case "WHEN_FLAG_CLICKED":
        // Header block: proceeds immediately
        break;

      default:
        break;
    }
  };

  // Run script for a specific sprite
  const runSpriteScript = async (spriteId, epoch) => {
    const sprite = runtimeStateRef.current[spriteId];
    if (!sprite || !sprite.actions) return;

    for (let i = 0; i < (runtimeStateRef.current[spriteId]?.actions?.length || 0); i++) {
      if (!isRunningRef.current || executionEpochRef.current !== epoch) break;
      const currentActions = runtimeStateRef.current[spriteId]?.actions || [];
      const block = currentActions[i];
      if (block) {
        await executeBlock(spriteId, block, epoch);
      }
    }
  };

  // Primary Run All sprites concurrently (Green Flag)
  const handlePlay = async () => {
    if (isRunningRef.current) return;

    const epoch = ++executionEpochRef.current;
    isRunningRef.current = true;
    setIsRunning(true);
    collidingPairsRef.current.clear();

    const activeSprites = Object.values(runtimeStateRef.current);

    try {
      await Promise.allSettled(
        activeSprites.map((sprite) => runSpriteScript(sprite.id, epoch))
      );
    } finally {
      if (executionEpochRef.current === epoch) {
        isRunningRef.current = false;
        setIsRunning(false);
        // Clear speech bubbles
        setSprites((prev) => prev.map((s) => ({ ...s, bubble: null })));
        Object.values(runtimeStateRef.current).forEach((s) => {
          if (s) s.bubble = null;
        });
      }
    }
  };

  // Run only active sprite's script (test single sprite)
  const handleRunSingleSprite = async (spriteId) => {
    if (isRunningRef.current) return;

    const epoch = ++executionEpochRef.current;
    isRunningRef.current = true;
    setIsRunning(true);
    collidingPairsRef.current.clear();

    try {
      await runSpriteScript(spriteId, epoch);
    } finally {
      if (executionEpochRef.current === epoch) {
        isRunningRef.current = false;
        setIsRunning(false);
        setSprites((prev) =>
          prev.map((s) => (s.id === spriteId ? { ...s, bubble: null } : s))
        );
        if (runtimeStateRef.current[spriteId]) {
          runtimeStateRef.current[spriteId].bubble = null;
        }
      }
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
      {/* <header className="h-12 bg-blue-600 text-white flex items-center justify-between px-4 shadow-sm flex-none z-30">
        <div className="flex items-center space-x-3">
        
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

        
        <div className="flex items-center space-x-2">
          {isRunning ? (
            <div className="flex items-center space-x-2 bg-green-500 bg-opacity-30 border border-green-300 border-opacity-40 px-3 py-1 rounded-full text-xs text-green-100 font-semibold shadow-inner">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping inline-block" />
              <span>Running Scripts...</span>
            </div>
          ) : (
            <div className="text-xs text-blue-200 font-medium">
              Ready to code
            </div>
          )}
        </div>

       
        <div className="flex items-center space-x-3">
          <div
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center space-x-1.5 ${
              heroFeatureEnabled
                ? "bg-amber-400 text-amber-950 ring-1 ring-amber-300"
                : "bg-blue-700 text-blue-200"
            }`}
          >
            <Icon name="bolt" size={12} />
            <span>Hero Swap {heroFeatureEnabled ? "ON" : "OFF"}</span>
          </div>
        </div>
      </header> */}

      {/* Main Workspace Body */}
      <div className="flex-1 overflow-hidden flex flex-row p-2 gap-2">
        {/* Left Coding Area: Sidebar + MidArea Canvas */}
        <div className="flex-1 h-full overflow-hidden flex flex-row bg-white rounded-xl shadow-sm border border-gray-200">
          <Sidebar onAddBlock={handleAddBlockToActiveSprite} />
          <MidArea
            activeSprite={activeSprite}
            isRunning={isRunning}
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

