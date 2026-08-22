const STORAGE_KEY = 'mysp hyro-state-v1';
const defaultState = {
  theme: 'minimal',
  tasks: [
    {id:1,title:'DSA Assignment',due:'Friday',priority:'high',done:false,category:'College'},
    {id:2,title:'Project meeting',due:'Today · 4:00 PM',priority:'med',done:false,category:'College'},
    {id:3,title:'Electricity bill',due:'Today',priority:'high',done:false,category:'Personal'},
    {id:4,title:'AI/ML practice',due:'Today · 7:00 PM',priority:'low',done:false,category:'Growth'},
    {id:5,title:'Buy notebook',due:'Tomorrow',priority:'low',done:true,category:'Personal'}
  ],
  docs:[
    {id:1,name:'DSA_Assignment.pdf',type:'PDF',size:'1.4 MB',tag:'College',date:'2m ago',important:'Submission · Friday'},
    {id:2,name:'Internship_Report.pdf',type:'PDF',size:'2.1 MB',tag:'Project',date:'Yesterday',important:'Review · Monday'},
    {id:3,name:'Semester_Timetable.pdf',type:'PDF',size:'820 KB',tag:'College',date:'3d ago',important:'Updated timetable'}
  ],
  expenses:[
    {id:1,name:'Lunch',category:'Food',amount:250,date:'Today'},
    {id:2,name:'Metro',category:'Travel',amount:90,date:'Today'},
    {id:3,name:'Starbucks',category:'Food',amount:320,date:'Yesterday'},
    {id:4,name:'Notebook',category:'College',amount:180,date:'Yesterday'},
    {id:5,name:'Data plan',category:'Bills',amount:399,date:'3d ago'}
  ],
  personal:[
    {id:1,name:'Buy shampoo',note:'Personal care',done:false},
    {id:2,name:'Order USB-C cable',note:'By this weekend',done:false},
    {id:3,name:'Renew gym membership',note:'Before month-end',done:true},
    {id:4,name:'Back up phone photos',note:'Weekend reset',done:false}
  ],
  plans:[
    {id:1,title:'AI/ML Skill Sprint',tag:'Growth',progress:68,desc:'Build a small ML feature and revise fundamentals.',meta:'4 of 6 sessions'},
    {id:2,title:'Semester Strong',tag:'College',progress:54,desc:'Keep assignments, exam prep and attendance on track.',meta:'7 of 13 tasks'},
    {id:3,title:'Savings Buffer',tag:'Money',progress:41,desc:'Build a small emergency cushion this semester.',meta:'₹4,100 of ₹10,000'}
  ],
  classes:[
    {time:'10:00 AM',title:'DSA Practice',room:'Lab 2'},
    {time:'12:30 PM',title:'Lunch Break',room:'Campus'},
    {time:'04:00 PM',title:'Project Meeting',room:'Innovation Lab'},
    {time:'07:00 PM',title:'Gym',room:'Personal'}
  ],
  activities:[
    {icon:'□',title:'Added new document',meta:'DSA_Assignment.pdf · 2m ago'},
    {icon:'₹',title:'Expense added',meta:'₹250 · Lunch · 1h ago'},
    {icon:'✓',title:'Task completed',meta:'Maths Practice · 3h ago'}
  ],
  mood:'Productive'
};

let state;
try { state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || structuredClone(defaultState); } catch { state = structuredClone(defaultState); }
const el = s => document.querySelector(s);
const els = s => [...document.querySelectorAll(s)];
const API_BASE = window.MYSPHYRO_API_URL || '/api/v1';
const API_TOKEN_KEY = 'mysphyro-api-token';
const apiToken = () => localStorage.getItem(API_TOKEN_KEY) || window.MYSPHYRO_API_TOKEN;
let syncTimer;
async function apiRequest(path, options = {}) {
  if (!API_BASE || !apiToken()) return null;
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers: { Authorization: `Bearer ${apiToken()}`, ...(options.headers || {}) } });
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.error?.message || 'API request failed');
  return response.status === 204 ? null : response.json();
}
function queueSync() {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => apiRequest('/dashboard/state', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state }) }).catch(() => {}), 700);
}
const save = () => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); queueSync(); };
const money = n => `₹${Math.round(n).toLocaleString('en-IN')}`;
const today = new Date();
let calendarCursor = new Date(today.getFullYear(), today.getMonth(), 1);

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  el('#themeBtn').title = `Current theme: ${state.theme}`;
}
function toast(msg, type='success') {
  const t = document.createElement('div'); t.className = `toast ${type}`; t.textContent = msg;
  el('#toastStack').appendChild(t); setTimeout(()=>t.remove(), 2600);
}
function setView(view) {
  els('.nav-item').forEach(x => x.classList.toggle('active', x.dataset.view === view));
  els('.view').forEach(x => x.classList.toggle('active', x.id === `view-${view}`));
  const titles = {dashboard:['Good morning, Kirat 👋',"Here's your world, all in sync."],tasks:['Tasks','Get it done.'],college:['College','Your academic world, all in one place.'],documents:['Documents','Your files, understood.'],money:['Money','Know where it goes.'],calendar:['Calendar','See the whole week.'],plans:['Plans','Turn goals into motion.'],personal:['Personal','The little things matter too.'],assistant:['AI Assistant','Just tell MYSPHYRO.']};
  const t=titles[view]||titles.dashboard; el('#pageTitle').textContent=t[0]; el('#pageSubtitle').textContent=t[1];
  if (window.innerWidth <= 860) el('#appShell').classList.remove('menu-open');
  render();
}

function renderDashboard(){
  const open=state.tasks.filter(t=>!t.done).sort((a,b)=>({high:0,med:1,low:2}[a.priority]-({high:0,med:1,low:2}[b.priority])));
  const top=open.slice(0,3);
  el('#priorityList').innerHTML = top.map(t=>`<div class="priority-row"><span class="dot"></span><span>${escapeHtml(t.title)} <small style="color:var(--muted)">· ${escapeHtml(t.due)}</small></span></div>`).join('') || `<div class="priority-row"><span class="dot done"></span><span>You're all caught up. ✨</span></div>`;
  el('#aiHeroTitle').textContent = open.length ? `You have ${open.length} ${open.length===1?'important thing':'important things'} today.` : 'Nice. Your day is clear.';
  el('#todayTimeline').innerHTML = state.classes.map(c=>`<div class="time-row"><span class="time">${escapeHtml(c.time)}</span><div class="event"><b>${escapeHtml(c.title)}</b><div style="font-size:9px;color:var(--muted);margin-top:2px">${escapeHtml(c.room)}</div></div></div>`).join('');
  const focus=Math.min(98,Math.max(42,Math.round((state.tasks.filter(t=>t.done).length/state.tasks.length||0)*100+42)));
  el('#focusScore').textContent=`${focus}%`; el('#focusRing').style.background=`conic-gradient(var(--primary) 0 ${focus}%, var(--border) ${focus}% 100%)`;
  el('#weekBars').innerHTML=[34,48,52,68,58,74,62].map((h,i)=>`<span style="height:${h*0.45}px"></span>`).join('');
  const sphere=[['🎓','College',`${Math.min(100,54+state.tasks.filter(t=>t.category==='College'&&t.done).length*8)}%`,'On track'],['✓','Tasks',state.tasks.filter(t=>!t.done).length,'Pending'],['□','Documents',state.docs.length,'Files'],['₹','Money',money(Math.max(0,8000-state.expenses.reduce((s,x)=>s+x.amount,0))),'Left'],['⚑','Plans',state.plans.length,'Active'],['♡','Personal',state.personal.filter(x=>!x.done).length,'Notes']];
  el('#sphereGrid').innerHTML=sphere.map(x=>`<div class="sphere-item"><span class="sphere-icon">${x[0]}</span><b>${x[1]}</b><strong>${x[2]}</strong><small>${x[3]}</small></div>`).join('');
  el('#activityList').innerHTML=state.activities.slice(0,5).map(a=>`<div class="activity-row"><span class="activity-icon">${a.icon}</span><div><b>${escapeHtml(a.title)}</b><small>${escapeHtml(a.meta)}</small></div></div>`).join('');
  const insights=[
    `You have ${open.length} open task${open.length===1?'':'s'}; tackle the high-priority one first.`,
    `Your documents contain ${state.docs.length} tracked file${state.docs.length===1?'':'s'}; upload notices to auto-create deadlines.`,
    `You have spent ${money(state.expenses.reduce((s,x)=>s+x.amount,0))} this month; keep an eye on Food.`
  ];
  el('#insightList').innerHTML=insights.map((x,i)=>`<div class="insight-row"><span class="activity-icon">✦</span><div><b>AI insight</b><small>${escapeHtml(x)}</small></div></div>`).join('');
}
function renderTasks(filter='all'){
  let tasks=[...state.tasks]; if(filter==='high') tasks=tasks.filter(t=>t.priority==='high'); if(filter==='today') tasks=tasks.filter(t=>t.due.includes('Today')); if(filter==='done') tasks=tasks.filter(t=>t.done);
  el('#taskList').innerHTML=tasks.length?tasks.map(t=>`<div class="task-row"><button class="checkbox ${t.done?'done':''}" data-task-toggle="${t.id}">${t.done?'✓':''}</button><div class="task-main"><b>${escapeHtml(t.title)}</b><small>${escapeHtml(t.due)} · ${escapeHtml(t.category)}</small></div><span class="priority-badge priority-${t.priority}">${t.priority}</span><button class="delete-btn" data-task-delete="${t.id}" aria-label="Delete">×</button></div>`).join(''):`<div class="card" style="text-align:center;color:var(--muted)">No tasks in this view.</div>`;
}
function renderCollege(){
  el('#collegeStats').innerHTML=[['ATTENDANCE','82%','+4% this month'],['ASSIGNMENTS',state.tasks.filter(t=>t.category==='College'&&!t.done).length,'open'],['EXAMS','2','upcoming'],['CREDITS','21','this semester']].map(s=>`<div class="stat-box"><span>${s[0]}</span><strong>${s[1]}</strong><small>${s[2]}</small></div>`).join('');
  el('#classList').innerHTML=state.classes.map(c=>`<div class="class-row"><span class="activity-icon">◫</span><div><b>${escapeHtml(c.title)}</b><small>${escapeHtml(c.time)} · ${escapeHtml(c.room)}</small></div></div>`).join('');
  el('#assignmentList').innerHTML=state.tasks.filter(t=>t.category==='College').map(t=>`<div class="activity-row"><span class="activity-icon">${t.done?'✓':'!'}</span><div><b>${escapeHtml(t.title)}</b><small>${escapeHtml(t.due)} · ${t.done?'Completed':'Open'}</small></div></div>`).join('');
}
function renderDocs(){
  const q=(el('#docSearch').value||'').toLowerCase(); const docs=state.docs.filter(d=>d.name.toLowerCase().includes(q)||d.tag.toLowerCase().includes(q));
  el('#documentGrid').innerHTML=docs.length?docs.map(d=>`<article class="document-card"><div class="doc-top"><span class="doc-type">${d.type}</span><button class="delete-btn" data-doc-delete="${d.id}">×</button></div><h4>${escapeHtml(d.name)}</h4><p>${escapeHtml(d.tag)} · ${escapeHtml(d.size)}</p><div class="doc-meta"><span>${escapeHtml(d.date)}</span><span>${escapeHtml(d.important)}</span></div></article>`).join(''):`<div class="card" style="grid-column:1/-1;text-align:center;color:var(--muted)">No documents found.</div>`;
}
function renderMoney(){
  const spent=state.expenses.reduce((s,x)=>s+x.amount,0); const budget=8000; const left=Math.max(0,budget-spent); const days=10; const safe=Math.floor(left/days); el('#balanceValue').textContent=money(left); el('#budgetProgress span').style.width=`${Math.min(100,spent/budget*100)}%`; el('#dailySafeSpend').textContent=money(safe); const cat={}; state.expenses.forEach(x=>cat[x.category]=(cat[x.category]||0)+x.amount); const top=Object.entries(cat).sort((a,b)=>b[1]-a[1])[0]||['None',0]; el('#topCategory').textContent=top[0]; el('#topCategoryText').textContent=`${money(top[1])} this month`; el('#expenseList').innerHTML=state.expenses.map(x=>`<div class="activity-row"><span class="activity-icon">₹</span><div><b>${escapeHtml(x.name)}</b><small>${escapeHtml(x.category)} · ${escapeHtml(x.date)}</small></div><strong style="font:600 12px 'Space Grotesk'">-${money(x.amount)}</strong></div>`).join('');
  const total=spent||1; el('#spendingMix').innerHTML=Object.entries(cat).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="mix-row"><span>${escapeHtml(k)}</span><div class="mix-bar"><span style="width:${Math.round(v/total*100)}%"></span></div><b>${Math.round(v/total*100)}%</b></div>`).join('');
}
function renderCalendar(){
  const y=calendarCursor.getFullYear(),m=calendarCursor.getMonth(); el('#calendarTitle').textContent=calendarCursor.toLocaleString('en',{month:'long',year:'numeric'}); const first=new Date(y,m,1).getDay(); const days=new Date(y,m+1,0).getDate(); const prevDays=new Date(y,m,0).getDate(); let cells=[];
  for(let i=0;i<42;i++){ const day=i-first+1; let d,dim=false,dt; if(day<=0){ d=prevDays+day; dt=new Date(y,m-1,d); dim=true; } else if(day>days){ d=day-days; dt=new Date(y,m+1,d); dim=true; } else {d=day;dt=new Date(y,m,d);} const iso=dt.toISOString().slice(0,10); const isToday=dt.toDateString()===today.toDateString(); const eventData=[]; if(!dim && dt.getDate()%5===0) eventData.push({text:'Task review'}); if(!dim && dt.getDate()%7===0) eventData.push({text:'College notice',pink:true}); cells.push(`<div class="calendar-cell ${dim?'dim':''} ${isToday?'today':''}"><div class="day-num">${d}</div>${eventData.map(e=>`<div class="event-pill ${e.pink?'pink':''}">${e.text}</div>`).join('')}</div>`); }
  el('#calendarGrid').innerHTML=cells.join('');
}
function renderPlans(){ el('#plansGrid').innerHTML=state.plans.map(p=>`<article class="plan-card"><span class="card-label">${escapeHtml(p.tag)}</span><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.desc)}</p><div class="progress-track"><span style="width:${p.progress}%"></span></div><div class="plan-meta"><span>${escapeHtml(p.meta)}</span><b>${p.progress}%</b></div></article>`).join(''); }
function renderPersonal(){ el('#personalList').innerHTML=state.personal.map(x=>`<div class="check-row ${x.done?'done':''}"><button class="checkbox ${x.done?'done':''}" data-personal-toggle="${x.id}">${x.done?'✓':''}</button><div class="item-content"><b>${escapeHtml(x.name)}</b><small>${escapeHtml(x.note)}</small></div><button class="delete-btn" data-personal-delete="${x.id}">×</button></div>`).join(''); els('[data-mood]').forEach(b=>b.classList.toggle('active',b.dataset.mood===state.mood)); el('#moodTitle').textContent=state.mood; el('#moodCopy').textContent={Productive:'Keep the momentum; small wins count.',Focused:'Pick one important thing and protect your focus.',Calm:'A clear mind makes the next action easier.',Energetic:'Use the energy while it is here. Knock out a small win.',Creative:'Make room for ideas, not just obligations.',Social:'People are part of your life sphere too.'}[state.mood]||''; }
function renderAssistant(){ const tracked=state.tasks.length+state.docs.length+state.expenses.length+state.personal.length; el('#trackedItemsCount').textContent=tracked; el('#assistantOpenTasks').textContent=state.tasks.filter(t=>!t.done).length; el('#assistantBudgetLeft').textContent=money(Math.max(0,8000-state.expenses.reduce((s,x)=>s+x.amount,0))); }
function render(){ renderDashboard(); renderTasks(); renderCollege(); renderDocs(); renderMoney(); renderCalendar(); renderPlans(); renderPersonal(); renderAssistant(); el('#navTaskCount').textContent=state.tasks.filter(t=>!t.done).length; el('#navDocCount').textContent=state.docs.length; applyTheme(); }
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

function openModal(title,body,submit){ el('#modal').innerHTML=`<h3>${title}</h3>${body}<div class="modal-actions"><button class="btn ghost" id="modalCancel">Cancel</button><button class="btn primary" id="modalSubmit">Save</button></div>`; el('#modalBackdrop').hidden=false; el('#modalCancel').onclick=closeModal; el('#modalSubmit').onclick=()=>{ if(submit()) {closeModal();save();render();} }; }
function closeModal(){ el('#modalBackdrop').hidden=true; }
function addTask(){ openModal('Add a task','<div class="form-grid"><div class="form-row"><label>Task</label><input id="fTitle" placeholder="e.g. Finish DBMS assignment"/></div><div class="form-row"><label>Due</label><input id="fDue" placeholder="e.g. Friday · 5 PM"/></div><div class="form-row"><label>Priority</label><select id="fPriority"><option value="high">High</option><option value="med" selected>Medium</option><option value="low">Low</option></select></div><div class="form-row"><label>Category</label><select id="fCategory"><option>College</option><option>Personal</option><option>Growth</option><option>Work</option></select></div></div>',()=>{const title=el('#fTitle').value.trim();if(!title){toast('Add a task name first.','warn');return false;}state.tasks.unshift({id:Date.now(),title,due:el('#fDue').value.trim()||'Today',priority:el('#fPriority').value,done:false,category:el('#fCategory').value});state.activities.unshift({icon:'✓',title:'Task added',meta:`${title} · just now`});toast('Task added.');return true;});}
function addExpense(){openModal('Add expense','<div class="form-grid"><div class="form-row"><label>Expense</label><input id="fName" placeholder="e.g. Lunch"/></div><div class="form-row"><label>Amount (₹)</label><input id="fAmount" type="number" min="0" placeholder="250"/></div><div class="form-row"><label>Category</label><select id="fCat"><option>Food</option><option>Travel</option><option>College</option><option>Bills</option><option>Personal</option><option>Other</option></select></div></div>',()=>{const name=el('#fName').value.trim(),amount=Number(el('#fAmount').value);if(!name||!amount){toast('Enter an expense and amount.','warn');return false;}state.expenses.unshift({id:Date.now(),name,amount,category:el('#fCat').value,date:'Today'});state.activities.unshift({icon:'₹',title:'Expense added',meta:`${money(amount)} · ${name} · just now`});toast('Expense added.');return true;});}
function addPersonal(){openModal('Add personal requirement','<div class="form-grid"><div class="form-row"><label>Requirement</label><input id="fPName" placeholder="e.g. Buy headphones"/></div><div class="form-row"><label>Note</label><input id="fNote" placeholder="e.g. Before Sunday"/></div></div>',()=>{const name=el('#fPName').value.trim();if(!name){toast('Add a requirement.','warn');return false;}state.personal.unshift({id:Date.now(),name,note:el('#fNote').value.trim()||'No note',done:false});toast('Personal requirement added.');return true;});}
function addClass(){openModal('Add schedule item','<div class="form-grid"><div class="form-row"><label>Title</label><input id="fCtitle" placeholder="e.g. Java Lab"/></div><div class="form-row"><label>Time</label><input id="fCtime" placeholder="e.g. 2:00 PM"/></div><div class="form-row"><label>Location</label><input id="fCroom" placeholder="e.g. Lab 1"/></div></div>',()=>{const title=el('#fCtitle').value.trim();if(!title){toast('Add a title.','warn');return false;}state.classes.push({title,time:el('#fCtime').value||'TBD',room:el('#fCroom').value||'Campus'});toast('Schedule item added.');return true;});}
function createPlan(){openModal('Create plan','<div class="form-grid"><div class="form-row"><label>Plan name</label><input id="fPlan" placeholder="e.g. 30-day coding sprint"/></div><div class="form-row"><label>Category</label><select id="fPlanTag"><option>Growth</option><option>College</option><option>Money</option><option>Personal</option></select></div><div class="form-row"><label>Goal</label><input id="fPlanDesc" placeholder="What does success look like?"/></div></div>',()=>{const title=el('#fPlan').value.trim();if(!title){toast('Name your plan.','warn');return false;}state.plans.unshift({id:Date.now(),title,tag:el('#fPlanTag').value,progress:0,desc:el('#fPlanDesc').value||'New personal plan.',meta:'0% complete'});toast('Plan created.');return true;});}

function chatRespond(text){
  const q=text.toLowerCase(); const open=state.tasks.filter(t=>!t.done); const spent=state.expenses.reduce((s,x)=>s+x.amount,0); const left=8000-spent;
  if(q.includes('next')||q.includes('what should')){const t=open.sort((a,b)=>({high:0,med:1,low:2}[a.priority]-({high:0,med:1,low:2}[b.priority])))[0]; return t?`Start with “${t.title}”. It is ${t.priority} priority and due ${t.due}. Give it 25 focused minutes, then check back with me.`:'You are all caught up. Use the time for your next goal or a proper reset.';}
  if(q.includes('afford')||q.includes('budget')){const match=q.match(/₹?\s*(\d[\d,]*)/);const ask=match?Number(match[1].replace(/,/g,'')):1500;return ask<=left?`Yes. You have about ${money(left)} left this month, so ${money(ask)} fits. After it, you'd have about ${money(left-ask)} remaining.`:`I'd hold off. You have about ${money(left)} left, so ${money(ask)} would push you over the remaining budget.`;}
  if(q.includes('week')) return `This week you have ${open.length} open task${open.length===1?'':'s'}, ${state.docs.length} tracked documents and ${money(spent)} in logged expenses. Your biggest focus should be ${open[0]?.title||'your next goal'}.`;
  if(q.includes('document')||q.includes('pdf')){const d=state.docs[0];return d?`Your latest document is “${d.name}”. I’ve tagged it as ${d.tag} and noted: ${d.important}. Upload notices here and I can turn their dates into tasks.`:'No documents yet. Upload a PDF or note and I’ll organize it.';}
  if(q.includes('task')) return `You have ${open.length} open tasks. The highest priority is ${open.find(t=>t.priority==='high')?.title||open[0]?.title||'none'}.`;
  return `Got it. I can help you connect tasks, documents, money, college and plans. Try “What should I do next?”, “Can I afford ₹1500?” or “Summarize my week.”`;
}
function addChatMessage(text,who='ai'){const d=document.createElement('div');d.className=`message ${who}`;d.textContent=text;el('#chatMessages').appendChild(d);el('#chatMessages').scrollTop=el('#chatMessages').scrollHeight;}
async function sendChat(){
  const input=el('#chatInput');const text=input.value.trim();if(!text)return;addChatMessage(text,'user');input.value='';
  try { const response=await apiRequest('/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,context:state})}); addChatMessage(response?.data?.reply || chatRespond(text),'ai'); }
  catch { addChatMessage(chatRespond(text),'ai'); }
  renderAssistant();
}

// Events
els('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
els('[data-view-jump]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.viewJump)));
el('#mobileMenu').onclick=()=>el('#appShell').classList.toggle('menu-open');
el('#themeBtn').onclick=()=>{state.theme=state.theme==='minimal'?'aesthetic':state.theme==='aesthetic'?'cosmic':'minimal';save();applyTheme();toast(`Theme: ${state.theme}`);};
el('#planDayBtn').onclick=()=>{const top=state.tasks.filter(t=>!t.done).sort((a,b)=>({high:0,med:1,low:2}[a.priority]-({high:0,med:1,low:2}[b.priority]))).slice(0,3);if(!top.length){toast('Your day is already clear.');return;}state.classes=[{time:'Now',title:top[0].title,room:'Focus block'},...state.classes.filter((x,i)=>!(i===0&&x.time==='Now'))];state.activities.unshift({icon:'✦',title:'AI planned your day',meta:`${top.length} priority blocks · just now`});save();setView('dashboard');toast('Day plan created.');};
el('#nextThingBtn').onclick=()=>{setView('assistant');setTimeout(()=>{el('#chatInput').value='What should I do next?';sendChat();},70)};
el('#customizeSphere').onclick=()=>toast('Sphere customization is ready for the next build.');
el('#addTaskBtn').onclick=addTask;el('#addExpenseBtn').onclick=addExpense;el('#addPersonalBtn').onclick=addPersonal;el('#addClassBtn').onclick=addClass;el('#createPlanBtn').onclick=createPlan;
el('#autoPrioritizeBtn').onclick=()=>{state.tasks.sort((a,b)=>({high:0,med:1,low:2}[a.priority]-({high:0,med:1,low:2}[b.priority])));save();renderTasks();toast('Tasks re-prioritized.');};
el('#docInput').addEventListener('change',async e=>{
  const files=[...e.target.files];
  for(const f of files){
    let url; try { const form=new FormData();form.append('file',f);const response=await apiRequest('/documents/upload',{method:'POST',body:form});url=response?.data?.url; } catch {}
    state.docs.unshift({id:Date.now()+Math.random(),name:f.name,type:(f.name.split('.').pop()||'FILE').toUpperCase().slice(0,4),size:(f.size/1024/1024).toFixed(1)+' MB',tag:'Uploaded',date:'just now',important:'AI scan pending',...(url?{url}:{})});state.activities.unshift({icon:'□',title:'Added new document',meta:`${f.name} · just now`});
  }
  save();renderDocs();renderDashboard();toast(`${files.length} document${files.length===1?'':'s'} added.`);e.target.value='';
});
el('#docSearch').addEventListener('input',renderDocs);el('#prevMonth').onclick=()=>{calendarCursor.setMonth(calendarCursor.getMonth()-1);renderCalendar();};el('#nextMonth').onclick=()=>{calendarCursor.setMonth(calendarCursor.getMonth()+1);renderCalendar();};

els('[data-task-filter]').forEach(b=>b.onclick=()=>{els('[data-task-filter]').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderTasks(b.dataset.taskFilter);});
document.addEventListener('click',e=>{
  const tt=e.target.closest('[data-task-toggle]'); if(tt){const t=state.tasks.find(x=>x.id==tt.dataset.taskToggle);if(t){t.done=!t.done;state.activities.unshift({icon:t.done?'✓':'↺',title:t.done?'Task completed':'Task reopened',meta:`${t.title} · just now`});save();render();toast(t.done?'Task completed.':'Task reopened.');}}
  const td=e.target.closest('[data-task-delete]'); if(td){state.tasks=state.tasks.filter(x=>x.id!=td.dataset.taskDelete);save();render();toast('Task removed.','warn');}
  const dd=e.target.closest('[data-doc-delete]'); if(dd){state.docs=state.docs.filter(x=>x.id!=dd.dataset.docDelete);save();render();toast('Document removed.','warn');}
  const pt=e.target.closest('[data-personal-toggle]'); if(pt){const x=state.personal.find(y=>y.id==pt.dataset.personalToggle);if(x){x.done=!x.done;save();renderPersonal();}}
  const pd=e.target.closest('[data-personal-delete]'); if(pd){state.personal=state.personal.filter(x=>x.id!=pd.dataset.personalDelete);save();renderPersonal();toast('Requirement removed.','warn');}
  const mood=e.target.closest('[data-mood]'); if(mood){state.mood=mood.dataset.mood;save();renderPersonal();toast(`Vibe set to ${state.mood}.`);}
  const prompt=e.target.closest('[data-prompt]'); if(prompt){setView('assistant');el('#chatInput').value=prompt.dataset.prompt;sendChat();}
});

el('#sendChat').onclick=sendChat;el('#chatInput').addEventListener('keydown',e=>{if(e.key==='Enter')sendChat();});
el('#modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop')closeModal();});
el('#notifBtn').onclick=()=>toast('You have 3 smart reminders waiting.');
el('#openProfile').onclick=()=>toast('Profile editing can be added in the next sprint.');
el('#globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){const q=e.target.value.trim(); if(!q)return; const t=state.tasks.find(t=>t.title.toLowerCase().includes(q.toLowerCase())); const d=state.docs.find(d=>d.name.toLowerCase().includes(q.toLowerCase())); if(t){setView('tasks');toast(`Found task: ${t.title}`)} else if(d){setView('documents');el('#docSearch').value=q;renderDocs();toast(`Found document: ${d.name}`)} else {toast('No exact match. Try a broader keyword.','warn')}}});

addChatMessage('Hey Kirat 👋 I’m MYSPHYRO AI. I can look across your tasks, documents, budget and plans. Ask me what to do next.');
render();
