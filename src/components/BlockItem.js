import React from "react";
import Icon from "./Icon";
import { CATEGORIES } from "../constants/blocks";

export default function BlockItem({
  block,
  isPalette = false,
  onUpdateBlock,
  onDeleteBlock,
  onDragStart,
  onDropNested,
  onRunSingle,
}) {
  const cat = CATEGORIES[block.category?.toUpperCase()] || CATEGORIES.MOTION;

  const handleInputChange = (field, value) => {
    if (onUpdateBlock) {
      onUpdateBlock(block.id, { [field]: value });
    }
  };

  const handleDragStartInternal = (e) => {
    e.stopPropagation();
    if (onDragStart) {
      onDragStart(e, block, isPalette);
    }
  };

  const basePillClasses = `${cat.bgClass} text-white font-medium text-xs rounded-md shadow-sm border border-black border-opacity-10 select-none flex items-center transition-transform duration-100 ${
    isPalette ? "cursor-grab active:cursor-grabbing hover:scale-102" : "cursor-move"
  }`;

  const renderContent = () => {
    switch (block.type) {
      case "WHEN_FLAG_CLICKED":
        return (
          <div className="flex items-center space-x-1.5 px-3 py-2">
            <span>When</span>
            <span className="bg-yellow-600 bg-opacity-30 rounded p-1 inline-flex items-center">
              <Icon name="flag" size={14} className="text-green-400" />
            </span>
            <span>clicked</span>
          </div>
        );

      case "MOVE_STEPS":
        return (
          <div className="flex items-center space-x-1.5 px-3 py-2">
            <span>Move</span>
            {isPalette ? (
              <span className="bg-white text-gray-800 rounded-full px-2 py-0.5 text-xs font-semibold shadow-inner">
                {block.steps ?? 10}
              </span>
            ) : (
              <input
                type="number"
                value={block.steps ?? 10}
                onChange={(e) => handleInputChange("steps", parseFloat(e.target.value) || 0)}
                className="w-12 bg-white text-gray-800 text-center rounded-full px-1 py-0.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-inner"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            )}
            <span>steps</span>
          </div>
        );

      case "TURN_RIGHT":
        return (
          <div className="flex items-center space-x-1.5 px-3 py-2">
            <span>Turn</span>
            <Icon name="redo" size={14} className="text-white opacity-90" />
            {isPalette ? (
              <span className="bg-white text-gray-800 rounded-full px-2 py-0.5 text-xs font-semibold shadow-inner">
                {block.degrees ?? 15}
              </span>
            ) : (
              <input
                type="number"
                value={block.degrees ?? 15}
                onChange={(e) => handleInputChange("degrees", parseFloat(e.target.value) || 0)}
                className="w-12 bg-white text-gray-800 text-center rounded-full px-1 py-0.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-inner"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            )}
            <span>degrees</span>
          </div>
        );

      case "TURN_LEFT":
        return (
          <div className="flex items-center space-x-1.5 px-3 py-2">
            <span>Turn</span>
            <Icon name="undo" size={14} className="text-white opacity-90" />
            {isPalette ? (
              <span className="bg-white text-gray-800 rounded-full px-2 py-0.5 text-xs font-semibold shadow-inner">
                {block.degrees ?? 15}
              </span>
            ) : (
              <input
                type="number"
                value={block.degrees ?? 15}
                onChange={(e) => handleInputChange("degrees", parseFloat(e.target.value) || 0)}
                className="w-12 bg-white text-gray-800 text-center rounded-full px-1 py-0.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-inner"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            )}
            <span>degrees</span>
          </div>
        );

      case "GOTO_XY":
        return (
          <div className="flex items-center space-x-1.5 px-3 py-2">
            <span>Go to</span>
            <span className="opacity-90">x:</span>
            {isPalette ? (
              <span className="bg-white text-gray-800 rounded-full px-2 py-0.5 text-xs font-semibold shadow-inner">
                {block.x ?? 0}
              </span>
            ) : (
              <input
                type="number"
                value={block.x ?? 0}
                onChange={(e) => handleInputChange("x", parseFloat(e.target.value) || 0)}
                className="w-11 bg-white text-gray-800 text-center rounded-full px-1 py-0.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-inner"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            )}
            <span className="opacity-90">y:</span>
            {isPalette ? (
              <span className="bg-white text-gray-800 rounded-full px-2 py-0.5 text-xs font-semibold shadow-inner">
                {block.y ?? 0}
              </span>
            ) : (
              <input
                type="number"
                value={block.y ?? 0}
                onChange={(e) => handleInputChange("y", parseFloat(e.target.value) || 0)}
                className="w-11 bg-white text-gray-800 text-center rounded-full px-1 py-0.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-inner"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            )}
          </div>
        );

      case "SAY_FOR_SECS":
        return (
          <div className="flex items-center space-x-1.5 px-3 py-2">
            <span>Say</span>
            {isPalette ? (
              <span className="bg-white text-gray-800 rounded-full px-2 py-0.5 text-xs font-semibold shadow-inner">
                {block.message ?? "Hello!"}
              </span>
            ) : (
              <input
                type="text"
                value={block.message ?? "Hello!"}
                onChange={(e) => handleInputChange("message", e.target.value)}
                className="w-20 bg-white text-gray-800 text-center rounded-full px-2 py-0.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-inner"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            )}
            <span>for</span>
            {isPalette ? (
              <span className="bg-white text-gray-800 rounded-full px-2 py-0.5 text-xs font-semibold shadow-inner">
                {block.seconds ?? 2}
              </span>
            ) : (
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={block.seconds ?? 2}
                onChange={(e) => handleInputChange("seconds", parseFloat(e.target.value) || 1)}
                className="w-10 bg-white text-gray-800 text-center rounded-full px-1 py-0.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-inner"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            )}
            <span>secs</span>
          </div>
        );

      case "THINK_FOR_SECS":
        return (
          <div className="flex items-center space-x-1.5 px-3 py-2">
            <span>Think</span>
            {isPalette ? (
              <span className="bg-white text-gray-800 rounded-full px-2 py-0.5 text-xs font-semibold shadow-inner">
                {block.message ?? "Hmm..."}
              </span>
            ) : (
              <input
                type="text"
                value={block.message ?? "Hmm..."}
                onChange={(e) => handleInputChange("message", e.target.value)}
                className="w-20 bg-white text-gray-800 text-center rounded-full px-2 py-0.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-inner"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            )}
            <span>for</span>
            {isPalette ? (
              <span className="bg-white text-gray-800 rounded-full px-2 py-0.5 text-xs font-semibold shadow-inner">
                {block.seconds ?? 2}
              </span>
            ) : (
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={block.seconds ?? 2}
                onChange={(e) => handleInputChange("seconds", parseFloat(e.target.value) || 1)}
                className="w-10 bg-white text-gray-800 text-center rounded-full px-1 py-0.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-inner"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            )}
            <span>secs</span>
          </div>
        );

      case "REPEAT":
        if (isPalette) {
          return (
            <div className="flex items-center space-x-1.5 px-3 py-2">
              <span>Repeat</span>
              <span className="bg-white text-gray-800 rounded-full px-2 py-0.5 text-xs font-semibold shadow-inner">
                {block.times ?? 5}
              </span>
              <span>times</span>
            </div>
          );
        }

        // Inside Workspace: C-shaped container Scratch repeat block
        return (
          <div className="w-full">
            {/* Top Bar of C-Shape */}
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold">Repeat</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={block.times ?? 5}
                  onChange={(e) =>
                    handleInputChange("times", parseInt(e.target.value, 10) || 1)
                  }
                  className="w-12 bg-white text-gray-800 text-center rounded-full px-1 py-0.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-inner"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
                <span>times</span>
              </div>
              {onDeleteBlock && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBlock(block.id);
                  }}
                  className="text-white hover:text-red-200 p-0.5 rounded opacity-75 hover:opacity-100 transition-opacity ml-2"
                  title="Delete Block"
                >
                  <Icon name="trash" size={13} />
                </button>
              )}
            </div>

            {/* Middle nested child blocks container */}
            <div
              className="ml-4 pl-2 py-1.5 min-h-[40px] border-l-8 border-yellow-600 bg-yellow-400 bg-opacity-20 rounded-r flex flex-col space-y-1.5 transition-colors"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onDropNested) {
                  onDropNested(block.id, e);
                }
              }}
            >
              {block.children && block.children.length > 0 ? (
                block.children.map((childBlock, idx) => (
                  <div key={childBlock.id || idx} className="relative group">
                    <BlockItem
                      block={childBlock}
                      isPalette={false}
                      onUpdateBlock={(id, upd) => {
                        const newChildren = block.children.map((c) =>
                          c.id === id ? { ...c, ...upd } : c
                        );
                        handleInputChange("children", newChildren);
                      }}
                      onDeleteBlock={(id) => {
                        const newChildren = block.children.filter((c) => c.id !== id);
                        handleInputChange("children", newChildren);
                      }}
                      onDragStart={onDragStart}
                      onRunSingle={onRunSingle}
                    />
                  </div>
                ))
              ) : (
                <div className="border border-dashed border-yellow-600 border-opacity-50 text-yellow-900 text-[11px] font-medium p-2 text-center rounded bg-yellow-100 bg-opacity-40">
                  Drop blocks here to repeat
                </div>
              )}
            </div>

            {/* Bottom Bar of C-Shape */}
            <div className="px-3 py-1 bg-yellow-600 bg-opacity-40 rounded-b text-[10px] text-yellow-100 font-semibold tracking-wider flex items-center justify-between">
              <span>END REPEAT</span>
              <Icon name="sync" size={11} className="opacity-70" />
            </div>
          </div>
        );

      default:
        return <div className="px-3 py-2">{block.type}</div>;
    }
  };

  const isRepeatInWorkspace = block.type === "REPEAT" && !isPalette;

  return (
    <div
      draggable
      onDragStart={handleDragStartInternal}
      onClick={() => {
        if (!isPalette && onRunSingle) {
          onRunSingle(block);
        }
      }}
      className={`group relative ${
        isRepeatInWorkspace
          ? "bg-yellow-500 rounded-lg shadow-md border border-yellow-600"
          : basePillClasses
      }`}
      title={isPalette ? "Drag into workspace" : "Click to test or drag to reorder"}
    >
      {renderContent()}

      {/* Delete button for regular blocks in workspace */}
      {!isPalette && !isRepeatInWorkspace && onDeleteBlock && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteBlock(block.id);
          }}
          className="mr-2 text-white hover:text-red-200 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete Block"
        >
          <Icon name="trash" size={13} />
        </button>
      )}
    </div>
  );
}
