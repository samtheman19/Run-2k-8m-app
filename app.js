// -------------------- TRAINING PLAN --------------------
const plan = [
  { day: "Day 1", type: "VO2 Intervals" },
  { day: "Day 2", type: "Easy + Strides" },
  { day: "Day 3", type: "Tempo / Race Pace" },
  { day: "Day 4", type: "Easy / Cross Train" },
  { day: "Day 5", type: "Speed + Finish" },
  { day: "Day 6", type: "Easy / Optional" }
];

let userData = JSON.parse(localStorage.getItem("trainingData")) || {};

function renderCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  plan.forEach((p, i) => {
    const dayEl = document.createElement("div");
    dayEl.classList.add("day");
    dayEl.innerHTML = `
      <div><strong>${p.day}</strong></div>
      <div>${p.type}</div>
      <div class="checkbox">
        <input type="checkbox" id="chk${i}" ${userData[i]?.done ? "checked" : ""} onchange="toggleDone(${i})">
      </div>
      <div><button onclick="logSession(${i})">Log Session</button></div>
    `;
    calendar.appendChild(dayEl);
  });
}

function toggleDone(i) {
  userData[i] = userData[i] || {};
  userData[i].done = document.getElementById("chk" + i).checked;
  localStorage.setItem("trainingData", JSON.stringify(userData));
}

function logSession(i) {
  const pace = prompt("Enter your average pace (mm:ss per km):");
  const notes = prompt("Any notes?");
  userData[i] = userData[i] || {};
  userData[i].pace = pace;
  userData[i].notes = notes;
  adjustPlan(i);
  localStorage.setItem("trainingData", JSON.stringify(userData));
  alert("Session logged!");
}

function adjustPlan(i) {
  let entry = userData[i];
  if (!entry.pace) return;
  const [m, s] = entry.pace.split(":").map(Number);
  const totalSec = m * 60 + s;
  const targetSec = 240; // 4:00/km goal
  if (totalSec < targetSec) {
    alert("Nice! We'll make the sessions slightly faster next week!");
  } else {
    alert("Pace targets will remain the same next week.");
  }
}

renderCalendar();

// -------------------- AUDIO --------------------
let audioCtx;
function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function beep(freq = 800, duration = 0.15) {
  initAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.value = freq;
  osc.type = "sine";
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function endBeep() {
  beep(600, 0.2);
  setTimeout(() => beep(600, 0.2), 200);
}

// -------------------- TIMER --------------------
let timerInterval;
let currentRep = 0;

function startIntervalTimer({ reps = 6, work = 90, rest = 90 }) {
  initAudio();
  currentRep = 1;
  runWorkPhase(work, rest, reps);
}

function runWorkPhase(work, rest, reps) {
  let timeLeft = work;
  beep(1000, 0.2);

  timerInterval = setInterval(() => {
    updateTimerDisplay(`Rep ${currentRep} — RUN`, timeLeft);
    if (timeLeft <= 3 && timeLeft > 0) beep(1200, 0.1);
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endBeep();
      if (currentRep < reps) runRestPhase(work, rest, reps);
      else updateTimerDisplay("Session Complete", 0);
    }
    timeLeft--;
  }, 1000);
}

function runRestPhase(work, rest, reps) {
  let timeLeft = rest;
  beep(500, 0.2);
  timerInterval = setInterval(() => {
    updateTimerDisplay(`Rep ${currentRep} — REST`, timeLeft);
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      currentRep++;
      runWorkPhase(work, rest, reps);
    }
    timeLeft--;
  }, 1000);
}

function updateTimerDisplay(label, seconds) {
  document.getElementById("timerLabel").innerText = label;
  document.getElementById("timerTime").innerText =
    Math.floor(seconds / 60).toString().padStart(2, "0") +
    ":" +
    (seconds % 60).toString().padStart(2, "0");
}

function start400s() {
  startIntervalTimer({
    reps: 6,
    work: getEveningAdjustedWorkTime(90),
    rest: 90
  });
}

function getEveningAdjustedWorkTime(baseSeconds) {
  const hour = new Date().getHours();
  return hour >= 17 ? baseSeconds + 3 : baseSeconds;
}
