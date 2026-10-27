export const CATEGORIES = {
  MOTION: {
    id: "motion",
    name: "Motion",
    color: "#4C97FF",
    bgClass: "bg-blue-500",
    hoverClass: "hover:bg-blue-600",
  },
  LOOKS: {
    id: "looks",
    name: "Looks",
    color: "#9966FF",
    bgClass: "bg-purple-500",
    hoverClass: "hover:bg-purple-600",
  },
  CONTROLS: {
    id: "controls",
    name: "Controls",
    color: "#FFAB19",
    bgClass: "bg-yellow-500",
    hoverClass: "hover:bg-yellow-600",
  },
  EVENTS: {
    id: "events",
    name: "Events",
    color: "#FFBF00",
    bgClass: "bg-yellow-400",
    hoverClass: "hover:bg-yellow-500",
  },
};

export const BLOCK_TEMPLATES = [
  // Events
  {
    type: "WHEN_FLAG_CLICKED",
    category: "events",
    title: "When clicked",
    isHeader: true,
  },
  // Motion
  {
    type: "MOVE_STEPS",
    category: "motion",
    steps: 10,
  },
  {
    type: "TURN_RIGHT",
    category: "motion",
    degrees: 15,
  },
  {
    type: "TURN_LEFT",
    category: "motion",
    degrees: 15,
  },
  {
    type: "GOTO_XY",
    category: "motion",
    x: 0,
    y: 0,
  },
  // Looks
  {
    type: "SAY_FOR_SECS",
    category: "looks",
    message: "Hello!",
    seconds: 2,
  },
  {
    type: "THINK_FOR_SECS",
    category: "looks",
    message: "Hmm...",
    seconds: 2,
  },
  // Controls
  {
    type: "REPEAT",
    category: "controls",
    times: 5,
    children: [],
  },
];

export const createBlockInstance = (template) => {
  const id = "block_" + Math.random().toString(36).substr(2, 9);
  return {
    ...template,
    id,
    children: template.children ? template.children.map(createBlockInstance) : undefined,
  };
};

export const findBlockById = (blocks, id) => {
  if (!blocks || !id) return null;
  for (const b of blocks) {
    if (b.id === id) return b;
    if (b.children) {
      const found = findBlockById(b.children, id);
      if (found) return found;
    }
  }
  return null;
};

export const findFirstRepeat = (blocks) => {
  if (!blocks) return null;
  for (const b of blocks) {
    if (b.type === "REPEAT") return b;
    if (b.children) {
      const found = findFirstRepeat(b.children);
      if (found) return found;
    }
  }
  return null;
};

export const removeBlockById = (blocks, id) => {
  if (!blocks || !id) return [];
  return blocks
    .filter((b) => b.id !== id)
    .map((b) => (b.children ? { ...b, children: removeBlockById(b.children, id) } : b));
};

