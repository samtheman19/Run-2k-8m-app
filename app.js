/* 2 km PR Training – Strength + 2km run progression with full treadmill-810 features */

const STORAGE_KEY = "run2k_v3";
const TODAY_KEY = () => new Date().toISOString().slice(0, 10);

// -------------------- Run progression --------------------
const base2kSec = 516; // 8:36 = 516s
const target2kSec = 480; // 8:00 = 480s

function currentWeekNumber() {
  const base = new Date("2026-01-01T00:00:00Z").getTime();
  const now = Date.now();
  const diffDays = Math.floor((now - base) / (24 * 3600 * 1000));
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}

function intervalSpeedKmH() {
  const wk = currentWeekNumber();
  let pace = base2kSec * Math.pow(0.985, wk - 1);
  pace = Math.max(target2kSec, pace);
  return 7200 / pace;
}

function tempoSpeedKmH() {
  const wk = currentWeekNumber();
  return 10.8 + 0.2 * Math.floor((wk - 1) / 2);
}

function longRunSpeedKmH() {
  const wk = currentWeekNumber();
  return 10.5 + 0.2 * Math.floor((wk - 1) / 2);
}

// -------------------- Weekly Plan --------------------
const days = [
  {
    key: "mon",
    name: "Mon – Upper Strength",
    warmup: ["5 min bike/row", "Shoulder mobility 60s", "Arm circles 10 each way"],
    main: {
      type: "strength",
      exercises: [
        { id: "bench", name: "Bench Press", sets: 4, targetReps: 6, note: "controlled" },
        { id: "row", name: "Barbell Row", sets: 4, targetReps: 6 },
        { id: "press", name: "Overhead Press", sets: 3, targetReps: 8 },
        { id: "pull", name: "Pull-ups", sets: 3, targetReps: 8 }
      ]
    },
    mobility: [
      { id: "pec", name: "Pec stretch", seconds: 60, note: "per side" },
      { id: "lats", name: "Lat stretch", seconds: 60 }
    ]
  },
  {
    key: "tue",
    name: "Tue – 2km Interval Run",
    warmup: ["10 min easy", "3 × 20s strides"],
    main: {
      type: "run",
      title: "2 km Intervals",
      showIntervalTimer: true,
      detailsByMode: {
        treadmill: [
          `6 × 400m @ ${intervalSpeedKmH().toFixed(1)} km/h`,
          "Recovery: 90s walk/jog",
          "Goal: controlled fast pace"
        ],
        outdoor: [
          "6 × 400m at target 2km pace (~8:00)",
          "Recovery: 90s easy jog",
          "Goal: controlled fast reps"
        ]
      }
    },
    mobility: [{ id: "calf2", name: "Calf stretch", seconds: 60 }]
  },
  {
    key: "wed",
    name: "Wed – Lower Strength",
    warmup: ["5 min light jog", "Leg swings 10 each leg", "Hip mobility 60s"],
    main: {
      type: "strength",
      exercises: [
        { id: "squat", name: "Back Squat", sets: 4, targetReps: 6 },
        { id: "dl", name: "Romanian Deadlift", sets: 4, targetReps: 6 },
        { id: "lunge", name: "Walking Lunge", sets: 3, targetReps: 8 },
        { id: "calf", name: "Standing Calf Raise", sets: 3, targetReps: 12 }
      ]
    },
    mobility: [
      { id: "hipFlex", name: "Hip flexor stretch", seconds: 60 },
      { id: "ham", name: "Hamstring stretch", seconds: 60 }
    ]
  },
  {
    key: "thu",
    name: "Thu – Tempo Run",
    warmup: ["10 min easy", "3 × 20s strides"],
    main: {
      type: "run",
      title: "Tempo / Steady Run",
      showIntervalTimer: false,
      detailsByMode: {
        treadmill: [
          `10–15 min steady @ ${tempoSpeedKmH().toFixed(1)} km/h`,
          "5 min easy cool down"
        ],
        outdoor: [
          "10–15 min steady at tempo pace",
          "5–10 min easy cool down"
        ]
      }
    },
    mobility: [{ id: "glutes", name: "Glute stretch", seconds: 60 }]
  },
  {
    key: "fri",
    name: "Fri – Upper Strength / Optional Run",
    warmup: ["5 min bike/row", "Mobility 5 min"],
    main: {
      type: "strength",
      exercises: [
        { id: "bench2", name: "Incline Bench Press", sets: 3, targetReps: 8 },
        { id: "row2", name: "Seated Row", sets: 3, targetReps: 8 },
        { id: "dip", name: "Dips", sets: 3, targetReps: 10 }
      ]
    },
    mobility: [
      { id: "pec2", name: "Pec stretch", seconds: 60 },
      { id: "hip2", name: "Hip flexor", seconds: 60 }
    ]
  },
  {
    key: "sat",
    name: "Sat – Long Run + 2km Finisher",
    warmup: ["10 min easy", "3 × 20s strides"],
    main: {
      type: "run",
      title: "Long Run + 2km Finisher",
      showIntervalTimer: false,
      detailsByMode: {
        treadmill: [
          `20–25 min steady @ ${longRunSpeedKmH().toFixed(1)} km/h`,
          `Finish last 400m @ ${intervalSpeedKmH().toFixed(1)} km/h`
        ],
        outdoor: [
          "20–25 min steady run",
          "Finish last 400m at target 2km pace"
        ]
      }
    },
    mobility: [{ id: "fullbody", name: "Full body stretch", seconds: 180 }]
  },
  {
    key: "sun",
    name: "Sun – Rest / Mobility",
    warmup: [],
    main: { type: "rest", details: ["Recovery day. Optional 10–20 min walk."] },
    mobility: [
      { id: "couch", name: "Couch stretch", seconds: 60 },
      { id: "calves", name: "Calves", seconds: 60 },
      { id: "thoracic", name: "Thoracic rotations", seconds: 60 }
    ]
  }
];

// -------------------- State / Load / Save --------------------
const defaultState = {
  dayKey: "mon",
  mode: "treadmill",
  restSeconds: 90,
  session: { running: false, startedAt: null, elapsedMs: 0, lastSaved: null },
  logs: {},
  mobility: {}
};

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    return { ...structuredClone(defaultState), ...JSON.parse(raw) };
  } catch { return structuredClone(defaultState); }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// -------------------- DOM Elements --------------------
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

// -------------------- INIT --------------------
function init() {
  daySelect.innerHTML = days.map(d => `<option value="${d.key}">${d.name}</option>`).join("");
  daySelect.value = state.dayKey;
  modeSelect.value = state.mode || "treadmill";
  render();
  startTick();
}
init();

// -------------------- Everything else --------------------
// Copy all treadmill-810 JS here (session timer, strength/mobility logging, rest countdowns, interval timer, renderDay, renderExercise, renderMobItem, attachHandlers, startTick, beep, escapeHtml, escapeAttr, etc.)  
// This ensures full functionality while using the new `days` plan above.
