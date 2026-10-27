import React, { useState } from "react";
import BlockItem from "./BlockItem";
import { CATEGORIES, BLOCK_TEMPLATES, createBlockInstance } from "../constants/blocks";

export default function Sidebar({ onAddBlock }) {
  const [activeCategory, setActiveCategory] = useState("all");

  const handleDragStart = (e, blockTemplate) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        isFromSidebar: true,
        blockTemplate: blockTemplate,
      })
    );
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleBlockClick = (template) => {
    if (onAddBlock) {
      onAddBlock(createBlockInstance(template));
    }
  };

  const categoriesList = [
    { id: "all", name: "All", color: "#6B7280" },
    { id: "motion", name: "Motion", color: CATEGORIES.MOTION.color },
    { id: "looks", name: "Looks", color: CATEGORIES.LOOKS.color },
    { id: "controls", name: "Control", color: CATEGORIES.CONTROLS.color },
    { id: "events", name: "Events", color: CATEGORIES.EVENTS.color },
  ];

  const filteredTemplates =
    activeCategory === "all"
      ? BLOCK_TEMPLATES
      : BLOCK_TEMPLATES.filter((b) => b.category === activeCategory);

  return (
    <aside className="w-64 flex-none h-full bg-gray-50 flex flex-col border-r border-gray-200 select-none">
      {/* Category Pills Header */}
      <div className="p-3 bg-white border-b border-gray-200">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Block Categories
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {categoriesList.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all flex items-center space-x-1.5 ${isActive
                  ? "bg-gray-800 text-white shadow-sm ring-1 ring-gray-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: cat.color }}
                />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Palette Blocks List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="text-[11px] text-gray-400 font-medium pb-1 flex items-center justify-between">
          <span>DRAG BLOCKS TO WORKSPACE</span>
          <span className="text-[10px] text-gray-400">(or click to add)</span>
        </div>

        {filteredTemplates.map((template, idx) => (
          <div
            key={template.type + idx}
            onClick={() => handleBlockClick(template)}
            className="transition-transform active:scale-95"
            title="Click to add or drag into workspace"
          >
            <BlockItem
              block={template}
              isPalette={true}
              onDragStart={(e) => handleDragStart(e, template)}
            />
          </div>
        ))}
      </div>

      {/* Sidebar Footer Hint */}
      <div className="p-2.5 bg-gray-100 border-t border-gray-200 text-center">
        <span className="text-[11px] text-gray-500 font-medium">
          💡 Drag or click to build scripts
        </span>
      </div>
    </aside>
  );
}
