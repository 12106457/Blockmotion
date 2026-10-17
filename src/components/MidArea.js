import React, { useState } from "react";
import BlockItem from "./BlockItem";
import Icon from "./Icon";
import { createBlockInstance } from "../constants/blocks";

export default function MidArea({
  activeSprite,
  onUpdateSpriteActions,
  onRunSpriteScript,
  onClearSpriteScript,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedBlockIndex, setDraggedBlockIndex] = useState(null);

  if (!activeSprite) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-gray-50 text-gray-400">
        Select a sprite to edit its script
      </div>
    );
  }

  const actions = activeSprite.actions || [];

  const handleDragOverRoot = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeaveRoot = () => {
    setIsDragOver(false);
  };

  const handleDropRoot = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const dataStr = e.dataTransfer.getData("application/json");
      if (!dataStr) return;
      const data = JSON.parse(dataStr);

      if (data.isFromSidebar && data.blockTemplate) {
        // Adding new block from sidebar
        const newBlock = createBlockInstance(data.blockTemplate);
        onUpdateSpriteActions([...actions, newBlock]);
      } else if (data.blockId && draggedBlockIndex !== null) {
        // Reordering within root list
        // (already handled or appended)
      }
    } catch (err) {
      console.error("Drop error", err);
    }
  };

  const handleUpdateBlock = (blockId, updates) => {
    const updateRecursive = (list) => {
      return list.map((b) => {
        if (b.id === blockId) {
          return { ...b, ...updates };
        }
        if (b.children) {
          return { ...b, children: updateRecursive(b.children) };
        }
        return b;
      });
    };
    onUpdateSpriteActions(updateRecursive(actions));
  };

  const handleDeleteBlock = (blockId) => {
    const deleteRecursive = (list) => {
      return list
        .filter((b) => b.id !== blockId)
        .map((b) => {
          if (b.children) {
            return { ...b, children: deleteRecursive(b.children) };
          }
          return b;
        });
    };
    onUpdateSpriteActions(deleteRecursive(actions));
  };

  const handleDropNested = (repeatBlockId, e) => {
    try {
      const dataStr = e.dataTransfer.getData("application/json");
      if (!dataStr) return;
      const data = JSON.parse(dataStr);

      let blockToAdd = null;
      if (data.isFromSidebar && data.blockTemplate) {
        blockToAdd = createBlockInstance(data.blockTemplate);
      } else if (data.block) {
        blockToAdd = data.block;
        // remove old instance from root if it was moved from root
        handleDeleteBlock(data.block.id);
      }

      if (!blockToAdd) return;

      const addToRepeatRecursive = (list) => {
        return list.map((b) => {
          if (b.id === repeatBlockId) {
            return {
              ...b,
              children: [...(b.children || []), blockToAdd],
            };
          }
          if (b.children) {
            return { ...b, children: addToRepeatRecursive(b.children) };
          }
          return b;
        });
      };

      onUpdateSpriteActions(addToRepeatRecursive(actions));
    } catch (err) {
      console.error("Drop nested error", err);
    }
  };

  const handleDragStartBlock = (e, block, isPalette) => {
    if (isPalette) return;
    const index = actions.findIndex((b) => b.id === block.id);
    setDraggedBlockIndex(index);
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        isFromSidebar: false,
        blockId: block.id,
        block: block,
      })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const handleBlockDragOver = (e, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleBlockDrop = (e, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const dataStr = e.dataTransfer.getData("application/json");
      if (!dataStr) return;
      const data = JSON.parse(dataStr);

      if (data.isFromSidebar && data.blockTemplate) {
        const newBlock = createBlockInstance(data.blockTemplate);
        const newActions = [...actions];
        newActions.splice(targetIndex, 0, newBlock);
        onUpdateSpriteActions(newActions);
      } else if (data.blockId) {
        // Reordering
        const fromIndex = actions.findIndex((b) => b.id === data.blockId);
        if (fromIndex !== -1 && fromIndex !== targetIndex) {
          const newActions = [...actions];
          const [moved] = newActions.splice(fromIndex, 1);
          newActions.splice(targetIndex, 0, moved);
          onUpdateSpriteActions(newActions);
        }
      }
    } catch (err) {
      console.error("Reorder drop error", err);
    }
    setDraggedBlockIndex(null);
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-white overflow-hidden select-none">
      {/* MidArea Header */}
      <div className="h-12 bg-gray-50 border-b border-gray-200 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span
            className="w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-sm inline-block"
            style={{ backgroundColor: activeSprite.color || "#FFAB19" }}
          />
          <h2 className="text-sm font-bold text-gray-800">
            Script for <span className="text-blue-600">{activeSprite.name}</span>
          </h2>
          <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
            {actions.length} {actions.length === 1 ? "block" : "blocks"}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onRunSpriteScript && onRunSpriteScript(activeSprite.id)}
            disabled={actions.length === 0}
            className={`px-3 py-1 text-xs font-semibold rounded-md shadow-sm flex items-center space-x-1.5 transition-all ${
              actions.length === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white active:scale-95"
            }`}
            title="Run only this sprite's code"
          >
            <Icon name="play" size={12} />
            <span>Run This</span>
          </button>

          <button
            type="button"
            onClick={() => onClearSpriteScript && onClearSpriteScript(activeSprite.id)}
            disabled={actions.length === 0}
            className={`px-2.5 py-1 text-xs font-medium rounded-md border flex items-center space-x-1 transition-all ${
              actions.length === 0
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-gray-300 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            }`}
            title="Clear all blocks in this script"
          >
            <Icon name="trash" size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Script Canvas with Dot Grid */}
      <div
        onDragOver={handleDragOverRoot}
        onDragLeave={handleDragLeaveRoot}
        onDrop={handleDropRoot}
        className={`flex-1 overflow-y-auto p-6 transition-colors ${
          isDragOver ? "bg-blue-50 bg-opacity-50 ring-2 ring-blue-400 ring-inset" : "bg-gray-50"
        }`}
        style={{
          backgroundImage:
            "radial-gradient(#CBD5E1 1.2px, transparent 1.2px), radial-gradient(#CBD5E1 1.2px, #F8FAFC 1.2px)",
          backgroundSize: "24px 24px",
          backgroundPosition: "0 0, 12px 12px",
        }}
      >
        {actions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 shadow-sm">
              <Icon name="flag" size={28} />
            </div>
            <h3 className="text-sm font-bold text-gray-700 mb-1">
              No code blocks added yet
            </h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Drag Motion, Looks, or Control blocks from the left sidebar and drop them here to build an animation for{" "}
              <span className="font-semibold text-gray-700">{activeSprite.name}</span>.
            </p>
            <div className="text-[11px] bg-white border border-gray-200 rounded-lg p-2.5 text-gray-600 shadow-sm">
              💡 Tip: Stack <span className="font-semibold text-blue-600">Move</span> blocks inside a{" "}
              <span className="font-semibold text-yellow-600">Repeat</span> block to create smooth movements!
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-2 max-w-md">
            {actions.map((block, idx) => (
              <div
                key={block.id || idx}
                onDragOver={(e) => handleBlockDragOver(e, idx)}
                onDrop={(e) => handleBlockDrop(e, idx)}
                className="transition-all"
              >
                <BlockItem
                  block={block}
                  isPalette={false}
                  onUpdateBlock={handleUpdateBlock}
                  onDeleteBlock={handleDeleteBlock}
                  onDragStart={handleDragStartBlock}
                  onDropNested={handleDropNested}
                  onRunSingle={() => onRunSpriteScript && onRunSpriteScript(activeSprite.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
