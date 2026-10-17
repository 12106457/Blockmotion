import React, { useRef, useState, useEffect } from "react";
import CatSprite from "./CatSprite";
import Icon from "./Icon";

export default function PreviewArea({
  sprites,
  activeSpriteId,
  onSelectSprite,
  onAddSprite,
  onDeleteSprite,
  onUpdateSprite,
  isRunning,
  onPlay,
  onStop,
  onReset,
  onLoadHeroDemo,
  heroFeatureEnabled,
  onToggleHeroFeature,
  collisionNotification,
}) {
  const stageRef = useRef(null);
  const [draggingSpriteId, setDraggingSpriteId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Stage dimensions
  const STAGE_WIDTH = 480;
  const STAGE_HEIGHT = 360;
  const SPRITE_SIZE = 80;

  const activeSprite = sprites.find((s) => s.id === activeSpriteId) || sprites[0];

  // Mouse / Pointer dragging of sprites on stage
  const handleSpritePointerDown = (e, sprite) => {
    e.stopPropagation();
    e.preventDefault();
    onSelectSprite(sprite.id);
    setDraggingSpriteId(sprite.id);

    if (stageRef.current) {
      const rect = stageRef.current.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;

      // Current sprite center in canvas pixels
      const spriteCenterX = STAGE_WIDTH / 2 + sprite.x;
      const spriteCenterY = STAGE_HEIGHT / 2 - sprite.y;

      setDragOffset({
        x: pointerX - spriteCenterX,
        y: pointerY - spriteCenterY,
      });
    }
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!draggingSpriteId || !stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;

      // New center in canvas pixels
      const newCenterX = pointerX - dragOffset.x;
      const newCenterY = pointerY - dragOffset.y;

      // Convert back to Scratch coordinates: X from center, Y from center (inverted)
      let newX = Math.round(newCenterX - STAGE_WIDTH / 2);
      let newY = Math.round(STAGE_HEIGHT / 2 - newCenterY);

      // Clamp to stage bounds
      newX = Math.max(-STAGE_WIDTH / 2 + 20, Math.min(STAGE_WIDTH / 2 - 20, newX));
      newY = Math.max(-STAGE_HEIGHT / 2 + 20, Math.min(STAGE_HEIGHT / 2 - 20, newY));

      onUpdateSprite(draggingSpriteId, { x: newX, y: newY });
    };

    const handlePointerUp = () => {
      if (draggingSpriteId) {
        setDraggingSpriteId(null);
      }
    };

    if (draggingSpriteId) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [draggingSpriteId, dragOffset]);

  return (
    <div className="w-full h-full flex flex-col bg-gray-100 overflow-hidden select-none border-l border-gray-200">
      {/* Stage Control Toolbar */}
      <div className="h-12 bg-white border-b border-gray-200 px-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2">
          {/* Green Flag Play Button */}
          <button
            type="button"
            onClick={onPlay}
            disabled={isRunning}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${
              isRunning
                ? "bg-green-100 text-green-300 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 active:scale-95 text-white ring-2 ring-green-200"
            }`}
            title="Start animating all sprites (Green Flag)"
          >
            <Icon name="flag" size={18} className="text-white" />
          </button>

          {/* Red Stop Button */}
          <button
            type="button"
            onClick={onStop}
            className="w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 text-white flex items-center justify-center shadow-sm ring-2 ring-red-200 transition-all"
            title="Stop all animations"
          >
            <Icon name="stop" size={15} />
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={onReset}
            className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            title="Reset sprites to starting positions"
          >
            Reset
          </button>
        </div>

        {/* Hero Feature Toggle & Demo Loader */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onToggleHeroFeature}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center space-x-1.5 transition-all shadow-xs ${
              heroFeatureEnabled
                ? "bg-amber-100 text-amber-800 border border-amber-300 ring-1 ring-amber-300"
                : "bg-gray-100 text-gray-500 border border-gray-200"
            }`}
            title="Collision-based animation swap feature"
          >
            <Icon name="bolt" size={13} className={heroFeatureEnabled ? "text-amber-600" : "text-gray-400"} />
            <span>Hero Swap: {heroFeatureEnabled ? "ON" : "OFF"}</span>
          </button>

          <button
            type="button"
            onClick={onLoadHeroDemo}
            className="px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-md shadow-xs transition-all active:scale-95 flex items-center space-x-1"
            title="Load the collision swap demo scenario from challenge document"
          >
            <span>⚡ Demo</span>
          </button>
        </div>
      </div>

      {/* Collision Alert Toast Banner */}
      {collisionNotification && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-3 py-1.5 text-xs font-bold flex items-center justify-center space-x-2 shadow-md animate-pulse">
          <span>💥</span>
          <span>{collisionNotification}</span>
        </div>
      )}

      {/* Stage Canvas Area */}
      <div className="flex-1 overflow-auto p-3 flex items-center justify-center">
        <div
          ref={stageRef}
          className="relative bg-white border-2 border-gray-300 rounded-xl shadow-lg overflow-hidden"
          style={{
            width: `${STAGE_WIDTH}px`,
            height: `${STAGE_HEIGHT}px`,
            minWidth: `${STAGE_WIDTH}px`,
            minHeight: `${STAGE_HEIGHT}px`,
          }}
        >
          {/* Subtle Scratch Stage Center Axis Crosshairs */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-400 border-r border-dashed border-gray-400" />
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gray-400 border-b border-dashed border-gray-400" />
            <div className="absolute left-2 top-2 text-[10px] text-gray-400 font-mono">
              (0, 0) Center Stage
            </div>
          </div>

          {/* Render All Sprites */}
          {sprites.map((sprite) => {
            const isSelected = sprite.id === activeSpriteId;
            // Scratch coordinates: center is (0,0), Y is positive UP
            const pixelX = STAGE_WIDTH / 2 + sprite.x - SPRITE_SIZE / 2;
            const pixelY = STAGE_HEIGHT / 2 - sprite.y - SPRITE_SIZE / 2;
            const rotationDeg = (sprite.direction ?? 90) - 90;

            return (
              <div
                key={sprite.id}
                onPointerDown={(e) => handleSpritePointerDown(e, sprite)}
                className={`absolute select-none cursor-grab active:cursor-grabbing transition-transform ${
                  isSelected ? "z-20" : "z-10"
                }`}
                style={{
                  left: `${pixelX}px`,
                  top: `${pixelY}px`,
                  width: `${SPRITE_SIZE}px`,
                  height: `${SPRITE_SIZE}px`,
                  touchAction: "none",
                }}
              >
                {/* Speech / Thought Bubble */}
                {sprite.bubble && (
                  <div
                    className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none whitespace-nowrap"
                  >
                    {sprite.bubble.type === "say" ? (
                      /* Speech Bubble */
                      <div className="relative bg-white border-2 border-gray-800 text-gray-900 font-bold text-xs px-3 py-1.5 rounded-2xl shadow-md">
                        {sprite.bubble.text}
                        <div className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-gray-800" />
                        <div className="absolute left-1/2 -bottom-1.5 transform -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-white" />
                      </div>
                    ) : (
                      /* Thought Bubble */
                      <div className="relative bg-white border-2 border-purple-800 text-purple-900 font-semibold text-xs px-3 py-1.5 rounded-2xl shadow-md">
                        💭 {sprite.bubble.text}
                        <div className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 w-2 h-2 bg-white border-2 border-purple-800 rounded-full" />
                        <div className="absolute left-1/2 -bottom-3.5 transform -translate-x-1/2 w-1.5 h-1.5 bg-white border border-purple-800 rounded-full" />
                      </div>
                    )}
                  </div>
                )}

                {/* Cat Sprite Character */}
                <div
                  className={`w-full h-full flex items-center justify-center p-1 rounded-full transition-all ${
                    isSelected ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-white" : ""
                  }`}
                  style={{
                    transform: `rotate(${rotationDeg}deg)`,
                  }}
                >
                  <CatSprite color={sprite.color || "#FFAB19"} size={SPRITE_SIZE - 10} />
                </div>

                {/* Sprite Label Badge */}
                <div
                  className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-[10px] font-bold px-2 py-0.2 rounded text-white shadow-xs pointer-events-none "
                  style={{
                    backgroundColor: sprite.color || "#6B7280",
                    fontSize: "10px",
                    padding: "2px 4px",
                  }}
                >
                  {sprite.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Sprite Coordinate Inspector Bar */}
      {activeSprite && (
        <div className="bg-white border-t border-b border-gray-200 px-3 py-2 flex items-center justify-between text-xs text-gray-700">
          <div className="flex items-center space-x-1 font-semibold">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: activeSprite.color }}
            />
            <span>{activeSprite.name}</span>
          </div>

          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-1">
              <span className="text-gray-400 font-mono">x:</span>
              <input
                type="number"
                value={activeSprite.x}
                onChange={(e) =>
                  onUpdateSprite(activeSprite.id, { x: parseFloat(e.target.value) || 0 })
                }
                className="w-12 border border-gray-300 rounded px-1 py-0.5 text-center font-mono text-xs focus:ring-1 focus:ring-blue-400"
              />
            </label>

            <label className="flex items-center space-x-1">
              <span className="text-gray-400 font-mono">y:</span>
              <input
                type="number"
                value={activeSprite.y}
                onChange={(e) =>
                  onUpdateSprite(activeSprite.id, { y: parseFloat(e.target.value) || 0 })
                }
                className="w-12 border border-gray-300 rounded px-1 py-0.5 text-center font-mono text-xs focus:ring-1 focus:ring-blue-400"
              />
            </label>

            <label className="flex items-center space-x-1">
              <span className="text-gray-400 font-mono">dir:</span>
              <input
                type="number"
                value={activeSprite.direction ?? 90}
                onChange={(e) =>
                  onUpdateSprite(activeSprite.id, {
                    direction: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-12 border border-gray-300 rounded px-1 py-0.5 text-center font-mono text-xs focus:ring-1 focus:ring-blue-400"
              />
            </label>
          </div>
        </div>
      )}

      {/* Multiple Sprites Management Panel */}
      <div className="h-28 bg-gray-50 p-2.5 flex items-center space-x-2 overflow-x-auto">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pr-1 flex-none">
          Sprites
        </div>

        {/* List of Sprite Cards */}
        {sprites.map((sprite) => {
          const isSelected = sprite.id === activeSpriteId;
          return (
            <div
              key={sprite.id}
              onClick={() => onSelectSprite(sprite.id)}
              className={`relative flex-none w-20 h-22 rounded-lg p-1.5 flex flex-col items-center justify-between cursor-pointer transition-all border ${
                isSelected
                  ? "bg-blue-50 border-blue-500 ring-2 ring-blue-400 shadow-sm"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Delete button if more than 1 sprite */}
              {sprites.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSprite(sprite.id);
                  }}
                  className="absolute top-1 right-1 text-gray-400 hover:text-red-500 p-0.5 rounded transition-colors"
                  title="Delete Sprite"
                >
                  <Icon name="trash" size={10} />
                </button>
              )}

              {/* Sprite Thumbnail */}
              <div className="w-10 h-10 flex items-center justify-center">
                <CatSprite color={sprite.color} size={36} />
              </div>

              {/* Name */}
              <span className="text-[11px] font-bold text-gray-700 truncate w-full text-center">
                {sprite.name}
              </span>

              {/* Blocks count badge */}
              <span className="text-[9px] text-gray-400">
                {(sprite.actions || []).length} blocks
              </span>
            </div>
          );
        })}

        {/* Add Sprite Button */}
        <button
          type="button"
          onClick={onAddSprite}
          className="flex-none w-20 h-22 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-500 hover:text-blue-600 flex flex-col items-center justify-center space-y-1 transition-all"
          title="Add another sprite character"
        >
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
            <Icon name="plus" size={14} />
          </div>
          <span className="text-[11px] font-semibold">+ Sprite</span>
        </button>
      </div>
    </div>
  );
}
