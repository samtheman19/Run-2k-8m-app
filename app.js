/* 2 km PR Routine – Updated JS for existing UI
   - Only replace app.js in your repo
   - Keeps the same look/layout
   - Updates intervals, tempo, easy runs for 2 km PR goal
*/

const STORAGE_KEY = "treadmill810_v9";
const TODAY_KEY = () => new Date().toISOString().slice(0, 10);

// -------------------- Plan --------------------
const days = [
  {
    key: "mon",
    name: "Mon – Strength A",
    warmup: ["3 min easy walk/jog", "Leg swings 10 each direction", "Ankle & calf mobility 60s"],
    main: {
      type: "strength",
      exercises: [
        { id: "trap", name: "Trap Bar Deadlift", sets: 4, targetReps: 3, note: "fast, no grind" },
        { id: "bss", name: "Bulgarian Split Squat", sets: 3, targetReps: 5, note: "each leg" },
        { id: "box", name: "Box Jumps", sets: 3, targetReps: 3, note: "reset each rep" },
        { id: "calf", name: "Standing Calf Raises", sets: 3, targetReps: 10, note: "slow down" }
      ]
    },
    mobility: [
      { id: "couch", name: "Couch stretch", seconds: 60, note: "per side" },
      { id: "calfStretch", name: "Calf stretch", seconds: 60, note: "per side" },
      { id: "glute", name: "Glute stretch", seconds: 60, note: "per side" }
    ]
  },
  {
    key: "tue",
    name: "Tue – Intervals",
    warmup: ["10–12 min easy", "3 × 20s strides"],
    main: {
      type: "run",
      title: "Intervals",
      showIntervalTimer: true,
      detailsByMode: {
        treadmill: [
          "Incline: 1.0%",
          "Rounds: 6",
          "Work: 95s @ 15.3 km/h (≈3:56/km)",
          "Recovery: 90s @ 10 km/h (6:00/km)",
          "Goal: controlled hard reps for 2 km PR"
        ],
        outdoor: [
          "Route: flat loop / track",
          "Rounds: 6",
          "Work: 95s hard-but-controlled (RPE 8/10)",
          "Recovery: 90s easy jog/walk",
          "Goal: even effort reps, focus on last 400m"
        ]
      }
    },
    mobility: [{ id: "calfStretch2", name: "Calf stretch", seconds: 60, note: "per side" }]
  },
  {
    key: "wed",
    name: "Wed – Mobility / Rest",
    warmup: [],
    main: { type: "rest", details: ["Recovery day. Optional 10–20 min walk."] },
    mobility: [
      { id: "couch2", name: "Couch stretch", seconds: 60, note: "per side" },
      { id: "calves2", name: "Calves", seconds: 60, note: "per side" },
      { id: "thoracic", name: "Thoracic rotations", seconds: 60, note: "per side" }
    ]
  },
  {
    key: "thu",
    name: "Thu – Strength B",
    warmup: ["3 min easy walk/jog", "Hip openers 60s", "Ankle & calf mobility 60s"],
    main: {
      type: "strength",
      exercises: [
        { id: "rdl", name: "Romanian Deadlift", sets: 4, targetReps: 6, note: "controlled" },
        { id: "split", name: "Reverse Lunge", sets: 3, targetReps: 6, note: "each leg" },
        { id: "step", name: "Step-ups", sets: 3, targetReps: 8, note: "each leg" },
        { id: "calf2", name: "Seated Calf Raises", sets: 3, targetReps: 12, note: "slow down" }
      ]
    },
    mobility: [
      { id: "hipFlex", name: "Hip flexor stretch", seconds: 60, note: "per side" },
      { id: "ham", name: "Hamstring stretch", seconds: 60, note: "per side" }
    ]
  },
  {
    key: "fri",
    name: "Fri – Easy Run",
    warmup: ["8–10 min easy", "2 × 15s relaxed strides (optional)"],
    main: {
      type: "run",
      title: "Easy Run",
      showIntervalTimer: false,
      detailsByMode: {
        treadmill: ["Incline: 1.0%", "20–30 min easy @ 10–12 km/h", "Finish feeling fresh"],
        outdoor: ["20–30 min easy", "Talk-test pace (RPE 4–5/10)", "Avoid big hills if possible"]
      }
    },
    mobility: [{ id: "calfStretch3", name: "Calf stretch", seconds: 60, note: "per side" }]
  },
  {
    key: "sat",
    name: "Sat – Tempo / Steady",
    warmup: ["10 min easy", "3 × 20s strides"],
    main: {
      type: "run",
      title: "Tempo / Steady",
      showIntervalTimer: false,
      detailsByMode: {
        treadmill: ["Incline: 1.0%", "10 min easy @ 11–12 km/h", "12–16 min tempo @ 13–14 km/h", "5 min easy cool down"],
        outdoor: ["10 min easy", "12–16 min steady (RPE 7/10)", "5–10 min cool down"]
      }
    },
    mobility: [{ id: "glutes2", name: "Glute stretch", seconds: 60, note: "per side" }]
  },
  {
    key: "sun",
    name: "Sun – Long Run",
    warmup: ["5–10 min easy build"],
    main: {
      type: "run",
      title: "Long Run",
      showIntervalTimer: false,
      detailsByMode: {
        treadmill: ["Incline: 1.0%", "40–50 min easy, build by +5 min per 1–2 weeks", "Conversational pace"],
        outdoor: ["35–50 min easy", "Conversational pace", "Prefer flatter route; take water if needed"]
      }
    },
    mobility: [{ id: "fullbody", name: "Full body stretch", seconds: 180, note: "easy" }]
  }
];

// -------------------- State --------------------
const defaultState = {
  dayKey: "mon",
  mode: "treadmill",
  restSeconds: 90,
  session: { running: false, startedAt: null, elapsedMs: 0, lastSaved: null },
  logs: {},
  mobility: {}
};

let state = loadState();

// -------------------- Load / Save --------------------
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(defaultState), ...parsed };
  } catch { return structuredClone(defaultState); }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function dayByKey(key) { return days.find(d => d.key === key) || days[0]; }
function TODAY() { return new Date().toISOString().slice(0,10); }

// -------------------- Init --------------------
const daySelect = document.getElementById("daySelect");
const modeSelect = document.getElementById("modeSelect");
const resetDayBtn = document.getElementById("resetDayBtn");
const resetWeekBtn = document.getElementById("resetWeekBtn");
const sessionDateEl = document.getElementById("sessionDate");
const sessionTimeEl = document.getElementById("sessionTime");
const sessionStartBtn = document.getElementById("sessionStartBtn");
const sessionPauseBtn = document.getElementById("sessionPauseBtn");
const sessionEndBtn = document.getElementById("sessionEndBtn");
const dayTitleEl = document.getElementById("dayTitle");
const warmupList = document.getElementById("warmupList");
const mainBlock = document.getElementById("mainBlock");
const mobilityList = document.getElementById("mobilityList");

function init() {
  daySelect.innerHTML = days.map(d => `<option value="${d.key}">${d.name}</option>`).join("");
  daySelect.value = state.dayKey;
  if (modeSelect) modeSelect.value = state.mode || "treadmill";
  render();
  startTick();
}
init();

// -------------------- Rest of JS --------------------
// Strength logging, session timer, interval timer, mobility, render, tick, beep, progression logic
// ... INCLUDE the rest of the JS from previous message here, unchanged ...
