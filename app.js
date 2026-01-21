// ---------------- Sidebar ----------------
function showSection(id){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ---------------- Plan ----------------
const plan=[
  {day:"Day 1",type:"VO2 Intervals"},
  {day:"Day 2",type:"Easy + Strides"},
  {day:"Day 3",type:"Tempo / Race Pace"},
  {day:"Day 4",type:"Easy / Cross Train"},
  {day:"Day 5",type:"Speed + Finish"},
  {day:"Day 6",type:"Easy / Optional"}
];

let userData = JSON.parse(localStorage.getItem("trainingData"))||{};
let logs = JSON.parse(localStorage.getItem("runLogs"))||[];

// ---------------- Calendar ----------------
function renderCalendar(){
  const container=document.getElementById('calendarContainer');
  container.innerHTML='';
  plan.forEach((p,i)=>{
    const dayCard=document.createElement('div');
    dayCard.className='day-card';
    dayCard.innerHTML=`
      <div><strong>${p.day}</strong></div>
      <div>${p.type}</div>
      <div>
        <input type="checkbox" id="chk${i}" ${userData[i]?.done?'checked':''} onchange="toggleDone(${i})"> Done
      </div>
      <button onclick="logSession(${i})">Log Session</button>
    `;
    container.appendChild(dayCard);
  });
}
function toggleDone(i){
  userData[i]=userData[i]||{};
  userData[i].done=document.getElementById('chk'+i).checked;
  localStorage.setItem('trainingData',JSON.stringify(userData));
}

// ---------------- Logs ----------------
function renderLogs(){
  const list=document.getElementById('logList');
  list.innerHTML='';
  logs.slice(-10).reverse().forEach(l=>{
    const li=document.createElement('li');
    li.textContent=`${l.day} - ${l.type} - Pace: ${l.pace} - Notes: ${l.notes}`;
    list.appendChild(li);
  });
}
function logSession(i){
  const pace=prompt("Enter your average pace (mm:ss per km):");
  const notes=prompt("Notes?");
  userData[i]=userData[i]||{};
  userData[i].pace=pace;
  userData[i].notes=notes;
  userData[i].done=true;

  logs.push({day:plan[i].day,type:plan[i].type,pace,notes});
  localStorage.setItem('trainingData',JSON.stringify(userData));
  localStorage.setItem('runLogs',JSON.stringify(logs));
  renderCalendar();
  renderLogs();
  alert('Session logged!');
}

// ---------------- Timer ----------------
let audioCtx,timerInterval,currentRep=0;
function initAudio(){if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();}
function beep(f=800,d=0.15){initAudio();const o=audioCtx.createOscillator();const g=audioCtx.createGain();o.frequency.value=f;o.type='sine';g.gain.setValueAtTime(0.2,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+d);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+d);}
function endBeep(){beep(600,0.2);setTimeout(()=>beep(600,0.2),200);}
function updateTimerDisplay(label,sec){document.getElementById('timerLabel').innerText=label;document.getElementById('timerTime').innerText=Math.floor(sec/60).toString().padStart(2,'0')+':'+(sec%60).toString().padStart(2,'0');}
function runWorkPhase(work,rest,reps){let t=work;beep(1000,0.2);timerInterval=setInterval(()=>{updateTimerDisplay(`Rep ${currentRep} — RUN`,t);if(t<=3&&t>0)beep(1200,0.1);if(t<=0){clearInterval(timerInterval);endBeep();if(currentRep<reps)runRestPhase(work,rest,reps);else updateTimerDisplay('Session Complete',0);}t--;},1000);}
function runRestPhase(work,rest,reps){let t=rest;beep(500,0.2);timerInterval=setInterval(()=>{updateTimerDisplay(`Rep ${currentRep} — REST`,t);if(t<=0){clearInterval(timerInterval);currentRep++;runWorkPhase(work,rest,reps);}t--;},1000);}
function startIntervalTimer({reps=6,work=90,rest=90}){initAudio();currentRep=1;runWorkPhase(work,rest,reps);}
function start400s(){startIntervalTimer({reps:6,work:90,rest:90});}

// ---------------- Initial Render ----------------
renderCalendar();
renderLogs();
