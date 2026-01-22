/* 2 km 8:10 – Routine (Strength + Run Progressive 2km) */

const STORAGE_KEY = "treadmill810_v9";
const TODAY_KEY = () => new Date().toISOString().slice(0, 10);

// -------------------- Run Progression --------------------
const base2kPaceSec = 516; // 8:36 total = 4:18 per km, in sec total 2km
const target2kPaceSec = 480; // 8:00 = 4:00/km

function currentWeekNumber() {
  const base = new Date("2026-01-01T00:00:00Z").getTime();
  const now = Date.now();
  const diffDays = Math.floor((now - base) / (24 * 3600 * 1000));
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}

function getIntervalSpeedKmH() {
  const wk = currentWeekNumber();
  let paceSec = base2kPaceSec * Math.pow(0.985, wk - 1);
  paceSec = Math.max(target2kPaceSec, paceSec);
  return 7200 / paceSec; // km/h (2km in 7200s)
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
  // Monday – Upper Strength + optional short run
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

  // Tuesday – Intervals (2km focus)
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

  // Friday – Optional Strength (full body)
  {
    key: "fri",
    name: "Fri – Full Body Strength",
    warmup: ["5 min row/bike", "Mobility 5 min"],
    main: {
      type: "strength",
      exercises: [
        { id: "dead", name: "Trap Bar Deadlift", sets: 3, targetReps: 5 },
        { id: "dip", name: "Dips", sets: 3, targetReps: 10 },
        { id: "pull2", name: "Pull-ups", sets: 3, targetReps: 8 }
      ]
    },
    mobility: [
      { id: "pec2", name: "Pec stretch", seconds: 60 },
      { id: "hip2", name: "Hip flexor", seconds: 60 }
    ]
  },

  // Saturday – Long Run / 2km focus
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
        outdoor: [
          "20–25 min steady run",
          "Finish last 400m at target 2km pace"
        ]
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

// -------------------- State / Helpers / DOM / Render --------------------
// You can copy all your previous JS code here (state management, session timer, strength/mobility logging, render functions, interval timer, beep, etc.)
// Everything below remains identical to your current JS
// ...
// All the previous code for rendering, session timers, mobility, strength, interval timers, rest settings, etc.
// Keep your attachHandlers(), startTick(), render(), etc. as-is

// At the end, call init()
init();
