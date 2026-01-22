/* 2 km PR Training – Strength + Run Progressive 2km
   - Mode dropdown: Treadmill / Outdoor
   - Interval timer only on Intervals day
   - Strength logging: kg + LWkg + reps + LWreps
   - Per-set rest countdown starts when set ticked
   - Mobility timers + tick
*/

const STORAGE_KEY = "treadmill810_v9";
const TODAY_KEY = () => new Date().toISOString().slice(0, 10);

// -------------------- 2 km progression --------------------
const base2kSec = 516; // 8:36 total = 4:18/km
const target2kSec = 480; // 8:00 total = 4:00/km

function currentWeekNumber() {
  const base = new Date("2026-01-01T00:00:00Z").getTime();
  const now = Date.now();
  const diffDays = Math.floor((now - base) / (24 * 3600 * 1000));
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}

function getIntervalSpeedKmH() {
  const wk = currentWeekNumber();
  let pace = base2kSec * Math.pow(0.985, wk - 1);
  pace = Math.max(target2kSec, pace);
  return 7200 / pace; // km/h for 2 km in 7200s
}

function getTempoSpeedKmH() {
  const wk = currentWeekNumber();
  let baseTempo = 10.8;
  let increment = 0.2 * Math.floor((wk - 1) / 2);
  return baseTempo + increment;
}

function getLongRunSpeedKmH() {
  const wk = currentWeekNumber();
  let baseLong = 10.5;
  let increment = 0.2 * Math.floor((wk - 1) / 2);
  return baseLong + increment;
}

// -------------------- Plan (FULL WEEK) --------------------
const days = [
  // Monday – Upper Strength
  {
    key: "mon",
    name: "Mon – Upper Strength",
    warmup: ["5 min easy bike/row", "Shoulder mobility 60s", "Arm circles 10 each way"],
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

  // Tuesday – Intervals (2 km focus)
  {
    key: "tue",
    name: "Tue – Intervals",
    warmup: ["10 min easy", "3 × 20s strides"],
    main: {
      type: "run",
      title: "2 km Intervals",
      showIntervalTimer: true,
      detailsByMode: {
        treadmill: [
          `6 × 400m @ ${getIntervalSpeedKmH().toFixed(1)} km/h`,
          "Recovery: 90s walk/jog",
          "Goal: controlled fast pace"
        ],
        outdoor: [
          "6 × 400m at target pace (~8:00 2km)",
          "Recovery: 90s easy jog",
          "Goal: controlled fast reps"
        ]
      }
    },
    mobility: [{ id: "calfStretch2", name: "Calf stretch", seconds: 60 }]
  },

  // Wednesday – Lower Strength
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

  // Thursday – Tempo Run
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
          `10–15 min steady @ ${getTempoSpeedKmH().toFixed(1)} km/h`,
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

  // Friday – Easy Run
  {
    key: "fri",
    name: "Fri – Easy Run",
    warmup: ["8–10 min easy", "2 × 15s relaxed strides (optional)"],
    main: {
      type: "run",
      title: "Easy Run",
      showIntervalTimer: false,
      detailsByMode: {
        treadmill: [`15–25 min easy @ ${getLongRunSpeedKmH().toFixed(1)} km/h`],
        outdoor: ["15–25 min easy pace", "Keep conversational, optional hills"]
      }
    },
    mobility: [{ id: "calfStretch3", name: "Calf stretch", seconds: 60 }]
  },

  // Saturday – Long / 2 km focus
  {
    key: "sat",
    name: "Sat – Long / 2 km Focus",
    warmup: ["10 min easy", "3 × 20s strides"],
    main: {
      type: "run",
      title: "Long Run + Finisher",
      showIntervalTimer: false,
      detailsByMode: {
        treadmill: [
          `20–25 min steady @ ${getLongRunSpeedKmH().toFixed(1)} km/h`,
          `Finish last 400m @ ${getIntervalSpeedKmH().toFixed(1)} km/h`
        ],
        outdoor: ["20–25 min steady run", "Finish last 400m at target 2km pace"]
      }
    },
    mobility: [{ id: "fullbody", name: "Full body stretch", seconds: 180 }]
  },

  // Sunday – Rest / Mobility
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

// -------------------- STATE --------------------
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
    const parsed = JSON.parse(raw);
    return { ...structuredClone(defaultState), ...parsed };
  } catch { return structuredClone(defaultState); }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function dayByKey(key) { return days.find(d => d.key === key) || days[0]; }
function getWeekKey() { return String(currentWeekNumber()); }

// -------------------- SESSION TIMER, STRENGTH LOG, MOBILITY, RENDER, HANDLERS, TICK, INTERVAL TIMER, UTILS --------------------
// Copy your previously fully working functions here from your single-file app.js
// sessionStart, sessionPause, sessionEndSave, getLogRef, setTodayValue, setDoneAndStartRest
// getMob, mobStart, mobToggleDone, mobRemainingMs, renderSession, renderDay, renderExercise, renderRestSettings
// renderMobItem, renderIntervalTimer, render, attachHandlers, startTick, setupIntervalTimer, beep, escapeHtml, escapeAttr

// -------------------- PROGRESSION LOGIC --------------------
function getStrengthSuggestion(dayKey, ex) {
  const wk = Number(getWeekKey());
  const lastWeek = String(Math.max(1, wk - 1));
  const logs = (((state.logs || {})[lastWeek] || {})[dayKey] || {})[ex.id];
  if (!logs) return null;

  let allHit = true, avgKg = 0, sets = 0;
  for (let i = 1; i <= ex.sets; i++) {
    const row = logs[String(i)];
    if (!row) return null;
    const reps = Number(row.reps || 0);
    const kg = Number(row.kg || 0);
    if (reps < ex.targetReps) allHit = false;
    avgKg += kg;
    sets++;
  }
  if (!allHit || sets === 0) return null;
  avgKg /= sets;
  let jump = 2.5;
  if (/split|lunge|step/i.test(ex.name)) jump = 1;
  if (/calf/i.test(ex.name)) jump = 2.5;
  return Math.round((avgKg + jump) * 2) / 2;
}

function getIntervalSuggestion() {
  const wk = Number(getWeekKey());
  const reps = Math.min(8, 6 + (wk % 4));
  const speedBump = 0;
  return { reps, speedBump };
}

function getTempoMinutes(base = 12) {
  const wk = Number(getWeekKey());
  return Math.min(20, base + Math.floor(wk / 2) * 2);
}

function getLongRunMinutes(base = 45) {
  const wk = Number(getWeekKey());
  if (wk % 4 === 0) return base;
  return base + Math.min(25, wk * 5);
}

// -------------------- INIT --------------------
init();
