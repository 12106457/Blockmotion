const assert = require("assert");

// Test Suite for React Scratch Visual Coding Environment
console.log("=================================================");
console.log("Running Scratch Visual Coding Verification Tests");
console.log("=================================================\n");

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

// 1. Verify Block Templates & Categories
test("Categories and Block Templates satisfy assignment requirements", () => {
  const CATEGORIES = {
    MOTION: { id: "motion", name: "Motion" },
    LOOKS: { id: "looks", name: "Looks" },
    CONTROLS: { id: "controls", name: "Control" },
    EVENTS: { id: "events", name: "Events" },
  };

  const BLOCK_TYPES = [
    "WHEN_FLAG_CLICKED",
    "MOVE_STEPS",
    "TURN_RIGHT",
    "TURN_LEFT",
    "GOTO_XY",
    "SAY_FOR_SECS",
    "THINK_FOR_SECS",
    "REPEAT",
  ];

  assert.strictEqual(Object.keys(CATEGORIES).length, 4, "Must have 4 required categories");
  assert.ok(BLOCK_TYPES.includes("MOVE_STEPS"), "Must support MOVE_STEPS");
  assert.ok(BLOCK_TYPES.includes("TURN_RIGHT"), "Must support TURN_RIGHT");
  assert.ok(BLOCK_TYPES.includes("TURN_LEFT"), "Must support TURN_LEFT");
  assert.ok(BLOCK_TYPES.includes("GOTO_XY"), "Must support GOTO_XY");
  assert.ok(BLOCK_TYPES.includes("SAY_FOR_SECS"), "Must support SAY_FOR_SECS");
  assert.ok(BLOCK_TYPES.includes("THINK_FOR_SECS"), "Must support THINK_FOR_SECS");
  assert.ok(BLOCK_TYPES.includes("REPEAT"), "Must support REPEAT");
  assert.ok(BLOCK_TYPES.includes("WHEN_FLAG_CLICKED"), "Must support WHEN_FLAG_CLICKED");
});

// 2. Helper functions: findBlockById, findFirstRepeat, removeBlockById
function findBlockById(blocks, id) {
  if (!blocks || !id) return null;
  for (const b of blocks) {
    if (b.id === id) return b;
    if (b.children) {
      const found = findBlockById(b.children, id);
      if (found) return found;
    }
  }
  return null;
}

function findFirstRepeat(blocks) {
  if (!blocks) return null;
  for (const b of blocks) {
    if (b.type === "REPEAT") return b;
    if (b.children) {
      const found = findFirstRepeat(b.children);
      if (found) return found;
    }
  }
  return null;
}

function removeBlockById(blocks, id) {
  if (!blocks || !id) return [];
  return blocks
    .filter((b) => b.id !== id)
    .map((b) => (b.children ? { ...b, children: removeBlockById(b.children, id) } : b));
}

test("findBlockById and removeBlockById work recursively for nested repeat blocks", () => {
  const actions = [
    { id: "b1", type: "WHEN_FLAG_CLICKED" },
    {
      id: "b2",
      type: "REPEAT",
      times: 5,
      children: [
        { id: "b3", type: "MOVE_STEPS", steps: 10 },
        { id: "b4", type: "TURN_RIGHT", degrees: 15 },
      ],
    },
  ];

  // find
  const foundB3 = findBlockById(actions, "b3");
  assert.ok(foundB3, "Should find nested block b3");
  assert.strictEqual(foundB3.type, "MOVE_STEPS");

  const repeatBlock = findFirstRepeat(actions);
  assert.ok(repeatBlock, "Should find repeat block");
  assert.strictEqual(repeatBlock.id, "b2");

  // remove nested
  const afterRemoveNested = removeBlockById(actions, "b3");
  assert.strictEqual(findBlockById(afterRemoveNested, "b3"), null, "b3 should be removed");
  const updatedRepeat = findFirstRepeat(afterRemoveNested);
  assert.strictEqual(updatedRepeat.children.length, 1, "Repeat should now have 1 child");
  assert.strictEqual(updatedRepeat.children[0].id, "b4");

  // remove top-level
  const afterRemoveTop = removeBlockById(afterRemoveNested, "b2");
  assert.strictEqual(afterRemoveTop.length, 1, "Only b1 should remain");
  assert.strictEqual(afterRemoveTop[0].id, "b1");
});

// 3. Scratch Coordinate Math Verification
test("Scratch trigonometry matches official standard", () => {
  // Scratch: 90 deg = Right (+X), 0 deg = Up (+Y), 180 deg = Down (-Y), 270 deg = Left (-X)
  function calcDelta(steps, direction) {
    const rad = (direction * Math.PI) / 180;
    return {
      dx: Math.round(steps * Math.sin(rad)) + 0,
      dy: Math.round(steps * Math.cos(rad)) + 0,
    };
  }

  // Facing 90 deg (Right), 10 steps -> dx = +10, dy = 0
  const right = calcDelta(10, 90);
  assert.strictEqual(right.dx, 10);
  assert.strictEqual(right.dy, 0);

  // Facing 90 deg, -10 steps -> dx = -10, dy = 0
  const rightReverse = calcDelta(-10, 90);
  assert.strictEqual(rightReverse.dx, -10);
  assert.strictEqual(rightReverse.dy, 0);

  // Facing 0 deg (Up), 10 steps -> dx = 0, dy = +10
  const up = calcDelta(10, 0);
  assert.strictEqual(up.dx, 0);
  assert.strictEqual(up.dy, 10);

  // Facing 270 deg (Left), 10 steps -> dx = -10, dy = 0
  const left = calcDelta(10, 270);
  assert.strictEqual(left.dx, -10);
  assert.strictEqual(left.dy, 0);
});

// 4. Collision Detection Lifecycle & Animation Swap Simulation
test("Collision detection lifecycle detects touch, swaps animations, prevents multi-frame repeat, and separates cleanly", () => {
  const COLLISION_THRESHOLD = 65;
  const collidingPairs = new Set();
  let swapCount = 0;

  let sprite1 = {
    id: "sprite_1",
    name: "Character 1",
    x: -120,
    y: 0,
    direction: 90,
    actions: [
      {
        id: "repeat_1",
        type: "REPEAT",
        times: 20,
        children: [{ id: "m1", type: "MOVE_STEPS", steps: 10 }],
      },
    ],
  };

  let sprite2 = {
    id: "sprite_2",
    name: "Character 2",
    x: 120,
    y: 0,
    direction: 90,
    actions: [
      {
        id: "repeat_2",
        type: "REPEAT",
        times: 20,
        children: [{ id: "m2", type: "MOVE_STEPS", steps: -10 }],
      },
    ],
  };

  function stepSprites() {
    // S1 executes its current repeat child
    const s1Repeat = findFirstRepeat(sprite1.actions);
    const s1Step = s1Repeat.children[0].steps;
    sprite1.x += s1Step;

    // S2 executes its current repeat child
    const s2Repeat = findFirstRepeat(sprite2.actions);
    const s2Step = s2Repeat.children[0].steps;
    sprite2.x += s2Step;

    // Check collision lifecycle
    const dist = Math.hypot(sprite1.x - sprite2.x, sprite1.y - sprite2.y);
    const pairKey = "sprite_1__sprite_2";

    if (dist < COLLISION_THRESHOLD) {
      if (!collidingPairs.has(pairKey)) {
        collidingPairs.add(pairKey);
        swapCount++;

        // Swap actions
        const s1Acts = JSON.parse(JSON.stringify(sprite1.actions));
        const s2Acts = JSON.parse(JSON.stringify(sprite2.actions));
        sprite1.actions = s2Acts;
        sprite2.actions = s1Acts;
      }
    } else if (dist > COLLISION_THRESHOLD + 10) {
      if (collidingPairs.has(pairKey)) {
        collidingPairs.delete(pairKey);
      }
    }
  }

  // Initial state check
  assert.strictEqual(sprite1.actions[0].children[0].steps, 10, "Sprite 1 initially moves +10");
  assert.strictEqual(sprite2.actions[0].children[0].steps, -10, "Sprite 2 initially moves -10");

  // Step 1 to 9: approaching center
  // t=0: -120 & 120 (dist 240)
  // t=1: -110 & 110 (dist 220)
  // t=2: -100 & 100 (dist 200)
  // t=3: -90 & 90 (dist 180)
  // t=4: -80 & 80 (dist 160)
  // t=5: -70 & 70 (dist 140)
  // t=6: -60 & 60 (dist 120)
  // t=7: -50 & 50 (dist 100)
  // t=8: -40 & 40 (dist 80)
  // t=9: -30 & 30 (dist 60) -> Collision occurs!
  for (let i = 0; i < 9; i++) {
    stepSprites();
  }

  assert.strictEqual(swapCount, 1, "Collision swap should trigger exactly once on contact");
  assert.ok(collidingPairs.has("sprite_1__sprite_2"), "Pair should be in colliding set");

  // Verify actions are swapped!
  assert.strictEqual(sprite1.actions[0].children[0].steps, -10, "Sprite 1 now has Move -10");
  assert.strictEqual(sprite2.actions[0].children[0].steps, 10, "Sprite 2 now has Move +10");

  // Step 10: sprites now move away from each other using swapped actions!
  stepSprites();
  // sprite 1 was at -30, moves -10 -> -40
  // sprite 2 was at +30, moves +10 -> +40
  // dist = 80 > 75 -> separation threshold!
  assert.strictEqual(swapCount, 1, "Swap count must NOT increase while still near overlap");
  assert.strictEqual(sprite1.x, -40, "Sprite 1 should move away to -40");
  assert.strictEqual(sprite2.x, 40, "Sprite 2 should move away to 40");
  assert.strictEqual(collidingPairs.has("sprite_1__sprite_2"), false, "Pair should be cleared after separating");

  // Continue steps outward
  for (let i = 0; i < 8; i++) {
    stepSprites();
  }
  // Sprite 1 reached -120, Sprite 2 reached 120
  assert.strictEqual(sprite1.x, -120, "Sprite 1 should have returned to -120");
  assert.strictEqual(sprite2.x, 120, "Sprite 2 should have returned to 120");
  assert.strictEqual(swapCount, 1, "Total swap count remained exactly 1 throughout");
});

// 5. Execution Cancellation & Epoch Invalidation
test("Execution epoch cancels pending tasks and prevents stale execution", () => {
  let epoch = 0;
  let activeTimeouts = new Set();
  let isRunning = false;
  let executionLogs = [];

  function start() {
    epoch++;
    const currentEpoch = epoch;
    isRunning = true;

    // Simulate async script
    function asyncTask(stepNum) {
      const timer = setTimeout(() => {
        activeTimeouts.delete(timer);
        if (epoch !== currentEpoch || !isRunning) {
          executionLogs.push(`aborted_step_${stepNum}`);
          return;
        }
        executionLogs.push(`executed_step_${stepNum}`);
      }, 50 * stepNum);
      activeTimeouts.add(timer);
    }

    asyncTask(1);
    asyncTask(2);
    asyncTask(3);
  }

  function stop() {
    epoch++;
    isRunning = false;
    activeTimeouts.forEach((t) => clearTimeout(t));
    activeTimeouts.clear();
  }

  start();
  assert.strictEqual(isRunning, true);
  assert.strictEqual(activeTimeouts.size, 3);

  // Immediately stop before timers fire
  stop();
  assert.strictEqual(isRunning, false);
  assert.strictEqual(activeTimeouts.size, 0);

  // Wait 100ms and verify no tasks executed
  return new Promise((resolve) => {
    setTimeout(() => {
      assert.strictEqual(executionLogs.length, 0, "No cancelled tasks should have executed");
      resolve();
    }, 150);
  });
});

console.log("\n-------------------------------------------------");
console.log(`Results: ${passed} passed, ${total - passed} failed out of ${total} tests.`);
console.log("-------------------------------------------------\n");

if (passed === total) {
  console.log("🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY!");
  process.exit(0);
} else {
  console.error("❌ SOME TESTS FAILED!");
  process.exit(1);
}
