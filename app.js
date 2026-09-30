const $=(s,p=document)=>p.querySelector(s);
const $$=(s,p=document)=>[...p.querySelectorAll(s)];
const STORE='entrenaJonathanV1';

const SUPABASE_URL='https://bekhxzzwocxfkczyxnzr.supabase.co';
const SUPABASE_KEY='sb_publishable_yjqLiQgr2kW4rbzIwFHWMw_mPOKVcig';
const supabaseClient=window.supabase?.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
let cloudUser=null;
let cloudTimer=null;
let cloudStatus='local';

const nowISO=()=>new Date().toISOString();
const localKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

const EXERCISES=[
  {id:'db_bench',type:'strength',name:'Press de banca con mancuernas',group:'Pecho',equip:'Mancuernas + banca',risk:'Bajo',knee:'Bajo',abd:'Bajo-medio',tech:'Pies firmes, espalda apoyada, baja controlado y exhala al empujar.',errors:'Rebotar, abrir demasiado los codos o aguantar la respiración.',home:'Press en piso con mancuernas.',visual:'https://www.youtube.com/results?search_query=press+de+banca+con+mancuernas+tecnica',sets:3,reps:10,rest:90},
  {id:'row_supported',type:'strength',name:'Remo con mancuerna apoyado',group:'Espalda',equip:'Mancuerna + banca',risk:'Bajo',knee:'Bajo',abd:'Bajo',tech:'Apoya el torso o brazo, espalda neutra y lleva el codo hacia la cadera.',errors:'Girar el torso o jalar con impulso.',home:'Remo apoyado en silla firme.',visual:'https://www.youtube.com/results?search_query=remo+con+mancuerna+apoyado+tecnica',sets:3,reps:10,rest:90},
  {id:'shoulder_press',type:'strength',name:'Press de hombro sentado',group:'Hombro',equip:'Mancuernas',risk:'Bajo',knee:'Bajo',abd:'Medio',tech:'Espalda apoyada, costillas controladas y empuja sin arquear.',errors:'Hiperextender la espalda o contener el aire.',home:'Sentado en silla firme.',visual:'https://www.youtube.com/results?search_query=press+militar+sentado+mancuernas+tecnica',sets:3,reps:10,rest:90},
  {id:'lat_raise',type:'strength',name:'Elevaciones laterales',group:'Hombro',equip:'Mancuernas',risk:'Bajo',knee:'Bajo',abd:'Bajo',tech:'Codos suaves, sube hasta la línea del hombro y evita balancearte.',errors:'Encoger hombros o usar impulso.',home:'Mismo ejercicio con carga ligera.',visual:'https://www.youtube.com/results?search_query=elevaciones+laterales+mancuernas+tecnica',sets:3,reps:12,rest:60},
  {id:'hammer_curl',type:'strength',name:'Curl martillo',group:'Bíceps',equip:'Mancuernas',risk:'Bajo',knee:'Bajo',abd:'Bajo',tech:'Codos pegados, muñecas neutras y movimiento controlado.',errors:'Balancear el tronco.',home:'Igual.',visual:'https://www.youtube.com/results?search_query=curl+martillo+tecnica',sets:3,reps:10,rest:60},
  {id:'triceps',type:'strength',name:'Tríceps con mancuerna',group:'Tríceps',equip:'Mancuerna',risk:'Bajo',knee:'Bajo',abd:'Bajo-medio',tech:'Controla el movimiento y evita arquear el tronco.',errors:'Compensar con la espalda.',home:'Extensión sentado.',visual:'https://www.youtube.com/results?search_query=extension+triceps+mancuerna+sentado+tecnica',sets:3,reps:10,rest:60},
  {id:'leg_press',type:'strength',name:'Prensa de pierna · rango controlado',group:'Pierna',equip:'Prensa',risk:'Medio',knee:'Medio',abd:'Medio',tech:'Pies al ancho de hombros, rango corto cómodo, no lleves rodillas al pecho y no bloquees.',errors:'Rango excesivo, rodillas hacia adentro o demasiada carga.',home:'Sentarse y levantarse de una banca alta si es cómodo.',visual:'https://www.youtube.com/results?search_query=prensa+de+pierna+tecnica',sets:3,reps:10,rest:120},
  {id:'rdl',type:'strength',name:'Peso muerto rumano con mancuernas',group:'Cadena posterior',equip:'Mancuernas',risk:'Medio',knee:'Bajo',abd:'Medio',tech:'Cadera atrás, rodillas suaves, espalda neutra y recorrido controlado.',errors:'Redondear la espalda, bajar de más o aguantar la respiración.',home:'Igual con carga ligera.',visual:'https://www.youtube.com/results?search_query=peso+muerto+rumano+mancuernas+tecnica',sets:3,reps:10,rest:120},
  {id:'ham_curl',type:'strength',name:'Curl femoral',group:'Isquios',equip:'Máquina',risk:'Bajo',knee:'Bajo-medio',abd:'Bajo',tech:'Rango cómodo y control total, sin rebotes.',errors:'Carga excesiva.',home:'Deslizamiento de talón solo si es cómodo.',visual:'https://www.youtube.com/results?search_query=curl+femoral+maquina+tecnica',sets:3,reps:10,rest:90},
  {id:'glute_bridge',type:'strength',name:'Puente de glúteo',group:'Glúteo',equip:'Piso/banca',risk:'Bajo',knee:'Bajo',abd:'Medio',tech:'Exhala al subir, aprieta glúteos y evita hiperextender la espalda.',errors:'Empujar con la zona lumbar o hacer presión abdominal.',home:'Igual.',visual:'https://www.youtube.com/results?search_query=puente+de+gluteo+tecnica',sets:3,reps:10,rest:90},
  {id:'hip_abduction',type:'strength',name:'Abducción de cadera',group:'Glúteo medio',equip:'Máquina/banda',risk:'Bajo',knee:'Bajo',abd:'Bajo',tech:'Movimiento corto y controlado.',errors:'Rebotar.',home:'Banda sentado.',visual:'https://www.youtube.com/results?search_query=abduccion+de+cadera+maquina+tecnica',sets:3,reps:12,rest:60},
  {id:'calf_raise',type:'strength',name:'Elevación de gemelos',group:'Pantorrilla',equip:'Máquina/mancuernas',risk:'Bajo',knee:'Bajo-medio',abd:'Bajo',tech:'Sube y baja lento con apoyo estable.',errors:'Rebotar o perder equilibrio.',home:'De pie con apoyo.',visual:'https://www.youtube.com/results?search_query=elevacion+de+gemelos+tecnica',sets:3,reps:12,rest:60},
  {id:'walk',type:'cardio',name:'Caminadora suave',group:'Cardio',equip:'Caminadora',risk:'Bajo',knee:'Bajo-medio',abd:'Bajo',tech:'Ritmo conversacional, sin trotar y con zancada cómoda.',errors:'Subir velocidad o inclinación bruscamente.',home:'Caminata plana.',visual:'https://www.youtube.com/results?search_query=walking+treadmill+form',minutes:15,speed:3.5,incline:0,rpe:4},
  {id:'bike',type:'cardio',name:'Bicicleta suave',group:'Cardio',equip:'Bicicleta',risk:'Bajo',knee:'Bajo-medio',abd:'Bajo',tech:'Cadencia cómoda y resistencia baja a moderada. Rodilla sin dolor relevante.',errors:'Resistencia alta o sillín mal ajustado.',home:'Caminadora suave si la bicicleta molesta.',visual:'https://www.youtube.com/results?search_query=stationary+bike+proper+form',minutes:15,resistance:2,rpe:4},
  {id:'mobility',type:'mobility',name:'Movilidad de cadera y tobillo',group:'Movilidad',equip:'Sin equipo',risk:'Bajo',knee:'Bajo',abd:'Bajo',tech:'Rangos suaves y sin dolor. No fuerces amplitud.',errors:'Rebotes o forzar el rango.',home:'Igual.',visual:'https://www.youtube.com/results?search_query=movilidad+cadera+tobillo+principiantes',minutes:8,rpe:2},
  {id:'breathing360',type:'breathing',name:'Respiración 360°',group:'Respiración',equip:'Sin equipo',risk:'Bajo',knee:'Bajo',abd:'Bajo',tech:'Inhala suave expandiendo costillas y exhala sin forzar.',errors:'Hacer presión o contener el aire.',home:'Sentado o recostado cómodo.',visual:'https://www.youtube.com/results?search_query=respiracion+360+diafragmatica',minutes:5,rounds:5,rpe:1},
  {id:'gk_base',type:'goalkeeper',name:'Posición base de portero',group:'Portero',equip:'Balón opcional',risk:'Bajo',knee:'Bajo-medio',abd:'Bajo',tech:'Postura estable, semiflexión mínima y sin pivotes bruscos.',errors:'Flexión profunda, giros o apoyos explosivos.',home:'Frente a espejo o pared.',visual:'https://www.youtube.com/results?search_query=goalkeeper+ready+position+basics',minutes:6,reps:8,rpe:3},
  {id:'gk_catch',type:'goalkeeper',name:'Atrape frontal suave',group:'Portero',equip:'Balón',risk:'Bajo',knee:'Bajo',abd:'Bajo',tech:'Recibe el balón al frente sin lanzarte ni desplazarte rápido.',errors:'Caídas o bloqueos explosivos.',home:'Balón contra pared a poca velocidad.',visual:'https://www.youtube.com/results?search_query=goalkeeper+basic+catching+technique',minutes:8,reps:12,rpe:3},
  {id:'gk_reaction',type:'goalkeeper',name:'Reacción visual con pelota',group:'Portero',equip:'Pelota de tenis',risk:'Bajo',knee:'Bajo',abd:'Bajo',tech:'Reacción de manos sentado o de pie, sin desplazamientos bruscos.',errors:'Saltar o girar de forma explosiva.',home:'Rebote contra pared.',visual:'https://www.youtube.com/results?search_query=goalkeeper+tennis+ball+reaction+drill',minutes:8,reps:12,rpe:3}
];
const EX=Object.fromEntries(EXERCISES.map(x=>[x.id,x]));
const ROUTINE={
  1:{name:'Tren superior completo',type:'Fuerza',ids:['db_bench','row_supported','shoulder_press','lat_raise','hammer_curl','triceps']},
  2:{name:'Cardio + movilidad',type:'Cardio',ids:['walk','mobility','breathing360']},
  3:{name:'Pierna segura',type:'Fuerza',ids:['leg_press','rdl','ham_curl','glute_bridge','hip_abduction','calf_raise']},
  4:{name:'Recuperación activa',type:'Recuperación',ids:['walk','breathing360','mobility']},
  5:{name:'Full body controlado',type:'Fuerza',ids:['db_bench','row_supported','leg_press','rdl','lat_raise','hammer_curl','triceps']},
  6:{name:'Portero seguro + cardio',type:'Portero',ids:['gk_base','gk_catch','gk_reaction','walk','mobility']},
  0:{name:'Descanso / movilidad',type:'Descanso',ids:['breathing360','mobility']}
};
const DEFAULT={
  profile:{name:'Jonathan',height:1.73,weight:140,waist:'',goal:'Bajar grasa, preservar/ganar músculo y mejorar condición',trainingHour:'19:00',messageTone:'Firme'},
  checkins:{},sessions:[],weightLog:[],progression:{},notes:[],settings:{notify:true,weekStart:1}
};
let state=load();
let route='today';
let deferredPrompt=null;
let activeWorkout=null;
let restTimer=null;

function clone(v){return JSON.parse(JSON.stringify(v));}
function load(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORE)||'{}');
    return {...clone(DEFAULT),...raw,profile:{...DEFAULT.profile,...(raw.profile||{})},settings:{...DEFAULT.settings,...(raw.settings||{})}};
  }catch(e){return clone(DEFAULT)}
}
function save(){
  localStorage.setItem(STORE,JSON.stringify(state));
  scheduleCloudSync();
}
function setCloudStatus(v){cloudStatus=v;const el=$('#cloudStatus');if(el){el.textContent=v==='synced'?'Sincronizado':v==='syncing'?'Sincronizando…':v==='error'?'Error de sincronización':'Solo en este dispositivo';el.className='pill '+(v==='synced'?'ok':v==='error'?'danger':'');}}
function scheduleCloudSync(){if(!cloudUser||!supabaseClient)return;clearTimeout(cloudTimer);cloudTimer=setTimeout(pushStateToCloud,700);}
async function pushStateToCloud(){
  if(!cloudUser||!supabaseClient)return;
  setCloudStatus('syncing');
  try{
    const payload={...state,_cloudUpdatedAt:nowISO()};
    const {error}=await supabaseClient.from('app_state').upsert({user_id:cloudUser.id,state:payload,updated_at:nowISO()},{onConflict:'user_id'});
    if(error)throw error;
    setCloudStatus('synced');
  }catch(e){console.error(e);setCloudStatus('error');}
}
function mergeStates(local,remote){
  const out={...clone(DEFAULT),...remote,...local};
  out.profile={...DEFAULT.profile,...(remote.profile||{}),...(local.profile||{})};
  out.settings={...DEFAULT.settings,...(remote.settings||{}),...(local.settings||{})};
  out.checkins={...(remote.checkins||{}),...(local.checkins||{})};
  out.progression={...(remote.progression||{}),...(local.progression||{})};
  const uniq=(arr=[])=>{const seen=new Set();return arr.filter(x=>{const k=JSON.stringify(x);if(seen.has(k))return false;seen.add(k);return true;});};
  out.sessions=uniq([...(remote.sessions||[]),...(local.sessions||[])]).sort((a,b)=>new Date(a.date||0)-new Date(b.date||0));
  out.weightLog=uniq([...(remote.weightLog||[]),...(local.weightLog||[])]);
  out.notes=uniq([...(remote.notes||[]),...(local.notes||[])]);
  return out;
}
async function pullAndMergeCloud(){
  if(!cloudUser||!supabaseClient)return;
  setCloudStatus('syncing');
  try{
    const {data,error}=await supabaseClient.from('app_state').select('state').eq('user_id',cloudUser.id).maybeSingle();
    if(error)throw error;
    if(data?.state){state=mergeStates(state,data.state);localStorage.setItem(STORE,JSON.stringify(state));}
    await pushStateToCloud();render();
  }catch(e){console.error(e);setCloudStatus('error');}
}
async function initCloud(){
  if(!supabaseClient)return;
  const {data}=await supabaseClient.auth.getSession();cloudUser=data.session?.user||null;
  if(cloudUser)await pullAndMergeCloud();
  supabaseClient.auth.onAuthStateChange(async(_event,session)=>{cloudUser=session?.user||null;if(cloudUser)await pullAndMergeCloud();else{setCloudStatus('local');render();}});
}
async function authSignIn(email,password){const {error}=await supabaseClient.auth.signInWithPassword({email,password});if(error)throw error;}
async function authSignUp(email,password){const {error}=await supabaseClient.auth.signUp({email,password});if(error)throw error;}
async function authSignOut(){await supabaseClient.auth.signOut();cloudUser=null;setCloudStatus('local');render();}

function checkin(){return state.checkins[localKey()]||{sleep:3,energy:6,knee:0,abd:0,time:60,place:'gimnasio',mental:'normal'};}
function dayRoutine(){return ROUTINE[new Date().getDay()];}
function safeMode(ci){if(ci.knee>3||ci.abd>3)return'protect';if(ci.energy<=4||ci.sleep<=2)return'quick';if(ci.energy>=8&&ci.knee<=2&&ci.abd<=2)return'strong';return'normal';}
function recommendation(ci=checkin()){
  const base=dayRoutine(),mode=safeMode(ci);let name=base.name,reason='Plan del día según calendario.';
  if(ci.knee>3){name='Tren superior + recuperación';reason='Rodilla >3/10: se bloquean pierna, portero y cambios de dirección.';}
  else if(ci.abd>3){reason='Abdomen >3/10: sin core ni movimientos que aumenten presión abdominal.';}
  else if(mode==='quick'){name='Versión rápida · 30 min';reason='Energía o sueño bajos: se reduce volumen para mantener adherencia.';}
  else if(mode==='strong'){reason='Energía alta y dolor bajo: sesión normal, sin exceder el RPE objetivo.';}
  return{base,name,mode,reason};
}
function progressStats(){
  const cutoff=Date.now()-7*864e5,recent=state.sessions.filter(s=>new Date(s.date).getTime()>=cutoff);
  const completed=new Set(recent.map(s=>s.localDate||s.date.slice(0,10))).size;
  const cardio=recent.reduce((a,s)=>a+(s.cardioMin||0),0);
  const vol=recent.reduce((a,s)=>a+(s.sets||[]).reduce((z,r)=>z+(+r.weight||0)*(+r.reps||0),0),0);
  const pains=recent.flatMap(s=>[...(s.sets||[]).map(r=>+r.knee||0),...(s.activities||[]).map(r=>+r.knee||0)]);
  return{completed,cardio,vol,avgPain:pains.length?(pains.reduce((a,b)=>a+b,0)/pains.length).toFixed(1):'0.0'};
}
function modeLabel(m){return m==='protect'?'Protección':m==='quick'?'Modo rápido':m==='strong'?'Modo fuerte controlado':'Modo normal';}
function sliderField(label,key,value,min,max){return`<div><label>${label}: <b data-val="${key}">${value}</b></label><input type="range" min="${min}" max="${max}" value="${value}" data-ci="${key}"></div>`;}
function render(){
  $$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.route===route));
  const views={today:renderToday,routine:renderRoutine,exercises:renderExercises,progress:renderProgress,goalkeeper:renderGoalkeeper,settings:renderSettings};
  $('#view').innerHTML=views[route]();bindCommon();if(route==='progress')drawCharts();
}
function renderToday(){
  const ci=checkin(),r=recommendation(ci),st=progressStats();
  return`<section class="card hero">
    <div class="row between"><span class="pill ${r.mode==='protect'?'danger':r.mode==='quick'?'warn':'ok'}">${modeLabel(r.mode)}</span><span class="tiny">${new Date().toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'short'})}</span></div>
    <h2>${r.name}</h2><p class="muted">${r.reason}</p>
    <div class="quick-actions"><button class="btn" data-start="full">Empezar rutina</button><button class="btn secondary" data-start="quick">30 min</button><button class="btn secondary" data-adapt="tired">Estoy cansado</button><button class="btn secondary" data-adapt="pain">Me duele algo</button></div>
  </section>
  <div class="section-title">Estado del cuerpo</div>
  <section class="card checkin"><div class="grid three">
    ${sliderField('Sueño','sleep',ci.sleep,1,5)}${sliderField('Energía','energy',ci.energy,1,10)}${sliderField('Rodilla','knee',ci.knee,0,10)}${sliderField('Abdomen','abd',ci.abd,0,10)}
    <div><label>Tiempo disponible</label><select data-ci="time"><option ${ci.time==30?'selected':''}>30</option><option ${ci.time==45?'selected':''}>45</option><option ${ci.time==60?'selected':''}>60</option><option ${ci.time==75?'selected':''}>75</option></select></div>
    <div><label>Lugar</label><select data-ci="place"><option value="gimnasio" ${ci.place==='gimnasio'?'selected':''}>Gimnasio</option><option value="casa" ${ci.place==='casa'?'selected':''}>Casa</option></select></div>
  </div></section>
  <div class="section-title">Esta semana</div><section class="grid two">
    <div class="metric"><div class="value">${st.completed}</div><div class="label">días entrenados</div></div>
    <div class="metric"><div class="value">${st.cardio}</div><div class="label">min cardio</div></div>
    <div class="metric"><div class="value">${Math.round(st.vol)}</div><div class="label">kg·reps volumen</div></div>
    <div class="metric"><div class="value">${st.avgPain}</div><div class="label">dolor rodilla prom.</div></div>
  </section>
  <section class="card flat"><div class="row between"><div><b>Regla de seguridad activa</b><div class="tiny">Dolor &gt;3/10 o inestabilidad = reducir, cambiar o detener.</div></div><span class="status-dot ok"></span></div></section>`;
}
function renderRoutine(){
  const days=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  return`<div class="section-title">Semana adaptativa</div>${[1,2,3,4,5,6,0].map(d=>`<section class="card flat"><div class="row between"><div><div class="tiny">${days[d]}</div><h3>${ROUTINE[d].name}</h3><p class="muted">${ROUTINE[d].ids.map(id=>EX[id].name).join(' · ')}</p></div><button class="btn small secondary" data-day="${d}">Ver</button></div></section>`).join('')}`;
}
function renderExercises(){
  return`<div class="section-title">Biblioteca</div>${EXERCISES.map(e=>`<section class="card flat exercise"><div><div class="row wrap"><span class="pill">${typeName(e.type)}</span><span class="pill">Riesgo ${e.risk}</span></div><h3>${e.name}</h3><p>${e.group} · ${e.equip}</p></div><button class="btn small secondary" data-ex="${e.id}">Ficha</button></section>`).join('')}`;
}
function renderProgress(){
  const st=progressStats(),last=state.sessions.at(-1);
  return`<div class="section-title">Progreso</div><section class="grid two">
    <div class="metric"><div class="value">${st.completed}</div><div class="label">sesiones / 7 días</div></div><div class="metric"><div class="value">${st.cardio}</div><div class="label">min cardio / 7 días</div></div>
  </section><section class="card"><h3>Volumen de fuerza · 7 días</h3><canvas id="volChart" class="chart" width="720" height="220"></canvas></section><section class="card"><h3>Adherencia · 7 días</h3><canvas id="adhChart" class="chart" width="720" height="220"></canvas></section>
  <section class="card flat"><h3>Última sesión</h3><p class="muted">${last?`${new Date(last.date).toLocaleString('es-MX')} · ${last.routine} · ${last.durationMin||'—'} min`:'Aún no hay sesiones registradas.'}</p></section>`;
}
function renderGoalkeeper(){
  return`<section class="card hero"><span class="pill ok">Fase 1 · Base segura</span><h2>Portero progresivo</h2><p class="muted">Sin lances, saltos, sprints, pivotes ni cambios bruscos de dirección. La progresión de fase requiere estabilidad y autorización clínica cuando corresponda.</p><button class="btn" id="startGoalkeeper">Iniciar sesión técnica</button></section>
  ${['gk_base','gk_catch','gk_reaction'].map(id=>`<section class="card flat exercise"><div><h3>${EX[id].name}</h3><p>${EX[id].tech}</p></div><button class="btn small secondary" data-ex="${id}">Ficha</button></section>`).join('')}`;
}
function renderSettings(){
  const authBlock=cloudUser?`<div class="row between"><div><div class="tiny">CUENTA CONECTADA</div><b>${cloudUser.email||'Usuario'}</b></div><span id="cloudStatus" class="pill ${cloudStatus==='synced'?'ok':''}">${cloudStatus==='synced'?'Sincronizado':cloudStatus==='syncing'?'Sincronizando…':cloudStatus==='error'?'Error de sincronización':'Conectado'}</span></div><p class="muted">Tus datos se guardan localmente y se sincronizan con Supabase para poder usarlos en otros dispositivos.</p><div class="grid two"><button class="btn secondary" id="syncNow">Sincronizar ahora</button><button class="btn secondary" id="signOutBtn">Cerrar sesión</button></div>`:`<h3>Sincronización en la nube</h3><p class="muted">Crea una cuenta o inicia sesión para conservar el historial entre computadora y Android. La app sigue funcionando localmente sin cuenta.</p><div class="form-row"><label>Correo</label><input id="authEmail" type="email" autocomplete="email" placeholder="tu@correo.com"></div><div class="form-row"><label>Contraseña</label><input id="authPassword" type="password" autocomplete="current-password" minlength="6" placeholder="Mínimo 6 caracteres"></div><div class="grid two"><button class="btn" id="signInBtn">Iniciar sesión</button><button class="btn secondary" id="signUpBtn">Crear cuenta</button></div><div id="authMsg" class="tiny"></div>`;
  return`<div class="section-title">Ajustes y respaldo</div><section class="card">${authBlock}</section><section class="card"><div class="form-row"><label>Peso actual (kg)</label><input id="profileWeight" type="number" step="0.1" value="${state.profile.weight||''}"></div><div class="form-row"><label>Hora de entrenamiento</label><input id="trainingHour" type="time" value="${state.profile.trainingHour||'19:00'}"></div><button class="btn" id="saveSettings">Guardar ajustes</button></section>
  <section class="card"><h3>Datos</h3><div class="grid two"><button class="btn secondary" id="exportJson">Respaldar JSON</button><button class="btn secondary" id="exportCsv">Exportar CSV</button></div><label class="btn secondary full file-btn">Importar respaldo<input id="importJson" type="file" accept="application/json" hidden></label></section>
  <section class="card"><h3>Notificaciones</h3><p class="muted">Los recordatorios locales dependen de que el navegador/PWA pueda ejecutarse. Para avisos garantizados con la app cerrada se requiere Web Push con backend.</p><button class="btn secondary" id="requestNotify">Permitir notificaciones</button></section>`;
}
function bindCommon(){
  $$('.nav-btn').forEach(b=>b.onclick=()=>{route=b.dataset.route;render();});
  $$('[data-ci]').forEach(el=>el.oninput=()=>{const ci=checkin(),k=el.dataset.ci;ci[k]=el.type==='range'||el.tagName==='SELECT'&&k==='time'?+el.value:el.value;state.checkins[localKey()]=ci;save();const out=$(`[data-val="${k}"]`);if(out)out.textContent=el.value;if((k==='knee'||k==='abd')&&+el.value>3)safetyModal(k,+el.value);});
  $$('[data-start]').forEach(b=>b.onclick=()=>startWorkout(b.dataset.start));
  $$('[data-adapt]').forEach(b=>b.onclick=()=>b.dataset.adapt==='pain'?showBodyPain():adaptTired());
  $$('[data-ex]').forEach(b=>b.onclick=()=>openExercise(b.dataset.ex));
  $$('[data-day]').forEach(b=>b.onclick=()=>openRoutine(+b.dataset.day));
  const g=$('#startGoalkeeper');if(g)g.onclick=()=>startWorkout('goalkeeper');
  const ss=$('#saveSettings');if(ss)ss.onclick=()=>{state.profile.weight=+$('#profileWeight').value||state.profile.weight;state.profile.trainingHour=$('#trainingHour').value||'19:00';save();alert('Ajustes guardados.');};
  const ej=$('#exportJson');if(ej)ej.onclick=exportJSON;const ec=$('#exportCsv');if(ec)ec.onclick=exportCSV;const imp=$('#importJson');if(imp)imp.onchange=importJSON;
  const rn=$('#requestNotify');if(rn)rn.onclick=async()=>{if(!('Notification'in window))return alert('Este navegador no soporta notificaciones.');const p=await Notification.requestPermission();alert('Permiso: '+p);};
  const sin=$('#signInBtn');if(sin)sin.onclick=async()=>{const email=$('#authEmail').value.trim(),password=$('#authPassword').value;const msg=$('#authMsg');try{msg.textContent='Conectando…';await authSignIn(email,password);msg.textContent='Sesión iniciada.';}catch(e){msg.textContent=e.message||'No se pudo iniciar sesión.';}};
  const sup=$('#signUpBtn');if(sup)sup.onclick=async()=>{const email=$('#authEmail').value.trim(),password=$('#authPassword').value;const msg=$('#authMsg');try{if(password.length<6)throw new Error('Usa una contraseña de al menos 6 caracteres.');msg.textContent='Creando cuenta…';await authSignUp(email,password);msg.textContent='Cuenta creada. Si Supabase solicita confirmar correo, revisa tu bandeja.';}catch(e){msg.textContent=e.message||'No se pudo crear la cuenta.';}};
  const sync=$('#syncNow');if(sync)sync.onclick=()=>pullAndMergeCloud();
  const so=$('#signOutBtn');if(so)so.onclick=()=>authSignOut();
}
function openModal(html,cls=''){const t=$('#modalTpl').content.cloneNode(true);const card=$('.modal-card',t);if(cls)card.classList.add(cls);$('.modal-body',t).innerHTML=html;document.body.appendChild(t);const back=$('.modal-backdrop');$('.modal-close',back).onclick=()=>closeModal(back);return back;}
function closeModal(m){if(restTimer){clearInterval(restTimer);restTimer=null;}m?.remove();}
function safetyModal(kind,val){
  const txt=kind==='knee'?'rodilla':'abdomen';openModal(`<div class="danger-box"><h3>Dolor de ${txt}: ${val}/10</h3><p>Reduce carga, rango o cambia el ejercicio. ${kind==='abd'?'Evita core y maniobras que aumenten presión abdominal.':'Evita pierna, portero y desplazamientos exigentes si hay inestabilidad.'}</p><p class="tiny">Si el dolor persiste, hay inestabilidad, dolor de pecho, mareo, falta de aire inusual o sudor frío, detén la sesión y solicita valoración profesional.</p></div>`);
}
function showBodyPain(){
  const m=openModal(`<h2>¿Dónde duele?</h2><div class="pain-choice"><button class="btn warn" data-pain-kind="knee">Rodilla</button><button class="btn warn" data-pain-kind="abd">Abdomen</button><button class="btn secondary" data-pain-kind="other">Otro / me siento mal</button></div>`);
  $$('[data-pain-kind]',m).forEach(b=>b.onclick=()=>{if(b.dataset.painKind==='other')return openModal('<div class="warn-box"><h3>Detén y evalúa</h3><p>Si el síntoma es inusual, intenso o progresivo, no continúes por obligación.</p></div>');promptPainLevel(b.dataset.painKind,m);});
}
function promptPainLevel(kind,parent){
  $('.modal-body',parent).innerHTML=`<h2>${kind==='knee'?'Rodilla':'Abdomen'}</h2><p class="muted">Selecciona intensidad.</p><div class="pain-scale">${[0,1,2,3,4,5,6,7,8,9,10].map(n=>`<button data-level="${n}" class="pain-num ${n>3?'bad':''}">${n}</button>`).join('')}</div>`;
  $$('[data-level]',parent).forEach(b=>b.onclick=()=>{const ci=checkin();ci[kind]=+b.dataset.level;state.checkins[localKey()]=ci;save();closeModal(parent);render();if(+b.dataset.level>3)safetyModal(kind,+b.dataset.level);});
}
function adaptTired(){const ci=checkin();ci.energy=Math.min(ci.energy,4);ci.time=30;state.checkins[localKey()]=ci;save();render();}
function openExercise(id){
  const e=EX[id];openModal(`<h2>${e.name}</h2><div class="row wrap"><span class="pill">${typeName(e.type)}</span><span class="pill">Rodilla ${e.knee}</span><span class="pill">Abdomen ${e.abd}</span></div><div class="section-title">Técnica</div><p>${e.tech}</p><div class="section-title">Evita</div><p>${e.errors}</p><div class="section-title">Alternativa</div><p>${e.home}</p><a class="btn secondary" href="${e.visual}" target="_blank" rel="noopener">Ver referencia visual</a>`);
}
function openRoutine(day){const r=ROUTINE[day];openModal(`<h2>${r.name}</h2>${r.ids.map(id=>`<div class="exercise"><div><h3>${EX[id].name}</h3><p>${typeName(EX[id].type)} · ${EX[id].group}</p></div><button class="btn small secondary" data-routine-ex="${id}">Ficha</button></div>`).join('')}`);$$('[data-routine-ex]').forEach(b=>b.onclick=()=>openExercise(b.dataset.routineEx));}
function typeName(t){return({strength:'Fuerza',cardio:'Cardio',mobility:'Movilidad',breathing:'Respiración',goalkeeper:'Portero'})[t]||t;}
function workoutExerciseIds(mode){
  let ids=mode==='goalkeeper'?['gk_base','gk_catch','gk_reaction','walk','mobility']:[...recommendation().base.ids];const ci=checkin();
  if(ci.knee>3)ids=ids.filter(id=>!['leg_press','rdl','ham_curl','glute_bridge','hip_abduction','calf_raise','gk_base','gk_catch','gk_reaction'].includes(id));
  if(ci.abd>3)ids=ids.filter(id=>!['glute_bridge'].includes(id));
  if(mode==='quick'||ci.time<=30)ids=ids.slice(0,Math.min(3,ids.length));
  return ids;
}
function startWorkout(mode){
  const ci=checkin(),ids=workoutExerciseIds(mode);if(!ids.length)return alert('No hay ejercicios seguros disponibles con el check-in actual.');
  activeWorkout={mode,ids,index:0,start:Date.now(),records:{},note:'',painFlag:false};
  showWorkoutStep();
}
function showWorkoutStep(){
  const w=activeWorkout,e=EX[w.ids[w.index]],total=w.ids.length;let m=$('.modal-backdrop.workout-overlay');if(m)m.remove();
  m=openModal(`<div class="workout-head"><div><div class="eyebrow">SESIÓN ACTIVA · ${w.index+1} DE ${total}</div><h2>${e.name}</h2></div><button class="icon-btn" id="workoutInfo">?</button></div><div class="progress-track"><div style="width:${((w.index+1)/total)*100}%"></div></div><div class="row wrap"><span class="pill">${typeName(e.type)}</span><span class="pill">Riesgo ${e.risk}</span></div><p class="muted">${e.tech}</p><div id="loggerArea">${loggerFor(e,w.records[e.id])}</div><div class="workout-actions"><button class="btn secondary" id="prevExercise" ${w.index===0?'disabled':''}>← Anterior</button><button class="btn ok" id="completeExercise">${w.index===total-1?'Terminar sesión':'✓ Terminé · siguiente'}</button></div>`, 'workout-modal');
  m.classList.add('workout-overlay');$('.modal-close',m).onclick=()=>confirmExitWorkout(m);
  $('#workoutInfo',m).onclick=()=>openExercise(e.id);$('#prevExercise',m).onclick=()=>{saveCurrentRecord(m,e);w.index--;showWorkoutStep();};
  $('#completeExercise',m).onclick=()=>completeCurrentExercise(m,e);
  bindLoggerControls(m,e);
}
function loggerFor(e,record={}){
  if(e.type==='strength'){
    const prev=lastStrengthSet(e.id),sets=record.sets||Array.from({length:e.sets||3},(_,i)=>({set:i+1,weight:prev?.weight||'',reps:prev?.reps||e.reps||10,rpe:6,done:false}));
    return`<div class="target-line"><b>Objetivo:</b> ${sets.length} series · ${e.reps||'8–12'} reps · descanso ${e.rest}s</div><div class="set-list">${sets.map(s=>`<div class="set-card ${s.done?'done':''}" data-set="${s.set}"><button class="set-check" data-setdone="${s.set}">${s.done?'✓':s.set}</button><div><label>kg</label><input data-field="weight" type="number" step="0.5" value="${s.weight}"></div><div><label>reps</label><input data-field="reps" type="number" min="1" value="${s.reps}"></div><div><label>RPE</label><input data-field="rpe" type="number" min="1" max="10" value="${s.rpe}"></div></div>`).join('')}</div><div class="nudge-row"><button class="btn small secondary" data-add-rep>+1 rep</button><button class="btn small secondary" data-add-weight>+2.5 kg</button></div>${painFields(record)}`;
  }
  if(e.type==='cardio')return`<div class="target-line"><b>Objetivo:</b> ritmo conversacional · RPE ${e.rpe||4}–5</div><div class="big-counter"><button data-step="minutes" data-delta="-5">−</button><div><span id="minutesValue">${record.minutes??e.minutes}</span><small>min</small></div><button data-step="minutes" data-delta="5">+</button></div><div class="grid three compact"><div class="form-row"><label>Velocidad km/h</label><input id="speedField" type="number" step="0.1" value="${record.speed??e.speed??3.5}"></div><div class="form-row"><label>Inclinación %</label><input id="inclineField" type="number" step="0.5" value="${record.incline??e.incline??0}"></div><div class="form-row"><label>RPE</label><input id="activityRpe" type="number" min="1" max="10" value="${record.rpe??e.rpe??4}"></div></div>${painFields(record)}`;
  if(e.type==='mobility')return`<div class="target-line"><b>Objetivo:</b> movimiento suave, sin forzar rango</div><div class="big-counter"><button data-step="minutes" data-delta="-1">−</button><div><span id="minutesValue">${record.minutes??e.minutes}</span><small>min</small></div><button data-step="minutes" data-delta="1">+</button></div><div class="form-row"><label>Sensación</label><select id="feelingField"><option ${record.feeling==='bien'?'selected':''} value="bien">Bien / suelto</option><option ${record.feeling==='tenso'?'selected':''} value="tenso">Tenso pero tolerable</option><option ${record.feeling==='molesto'?'selected':''} value="molesto">Molestia</option></select></div>${painFields(record)}`;
  if(e.type==='breathing')return`<div class="target-line"><b>Objetivo:</b> respiración cómoda, sin presión abdominal</div><div class="big-counter"><button data-step="minutes" data-delta="-1">−</button><div><span id="minutesValue">${record.minutes??e.minutes}</span><small>min</small></div><button data-step="minutes" data-delta="1">+</button></div><div class="form-row"><label>Rondas</label><input id="roundsField" type="number" min="1" value="${record.rounds??e.rounds??5}"></div>${painFields(record)}`;
  return`<div class="target-line"><b>Objetivo:</b> técnico, controlado, sin impacto</div><div class="grid two compact"><div class="form-row"><label>Minutos</label><input id="gkMinutes" type="number" min="1" value="${record.minutes??e.minutes??6}"></div><div class="form-row"><label>Repeticiones técnicas</label><input id="gkReps" type="number" min="1" value="${record.reps??e.reps??8}"></div></div><div class="form-row"><label>Intensidad RPE</label><input id="activityRpe" type="number" min="1" max="10" value="${record.rpe??e.rpe??3}"></div>${painFields(record)}`;
}
function painFields(record={}){return`<div class="pain-panel"><div><label>Rodilla <b id="kneeOut">${record.knee??0}</b>/10</label><input id="kneePain" type="range" min="0" max="10" value="${record.knee??0}"></div><div><label>Abdomen <b id="abdOut">${record.abd??0}</b>/10</label><input id="abdPain" type="range" min="0" max="10" value="${record.abd??0}"></div><button class="btn warn full" id="painNow">Me dolió / adaptar</button></div>`;}
function bindLoggerControls(m,e){
  $$('[data-step]',m).forEach(b=>b.onclick=()=>{const out=$('#minutesValue',m),n=Math.max(1,+out.textContent+(+b.dataset.delta));out.textContent=n;});
  const kp=$('#kneePain',m),ap=$('#abdPain',m),panel=$('.pain-panel',m);
  const livePain=(kind,input,outSel)=>{
    const val=+input.value||0;
    $(outSel,m).textContent=val;
    if(panel)panel.classList.toggle('danger-active',(+kp?.value||0)>3||(+ap?.value||0)>3);
    if(val<=3){input.dataset.alerted='0';return;}
    markPain(e,kind,val);
    if(input.dataset.alerted!=='1'){
      input.dataset.alerted='1';
      saveCurrentRecord(m,e);
      painDuringWorkout(m,e);
    }
  };
  if(kp)kp.oninput=()=>livePain('knee',kp,'#kneeOut');
  if(ap)ap.oninput=()=>livePain('abd',ap,'#abdOut');
  const pn=$('#painNow',m);if(pn)pn.onclick=()=>painDuringWorkout(m,e);
  if(e.type==='strength'){
    $$('[data-setdone]',m).forEach(b=>b.onclick=()=>{const card=b.closest('.set-card');card.classList.toggle('done');b.textContent=card.classList.contains('done')?'✓':b.dataset.setdone;if(card.classList.contains('done'))startRestTimer(e.rest||90);});
    const ar=$('[data-add-rep]',m);if(ar)ar.onclick=()=>$$('[data-field="reps"]',m).forEach(x=>x.value=+x.value+1);const aw=$('[data-add-weight]',m);if(aw)aw.onclick=()=>$$('[data-field="weight"]',m).forEach(x=>x.value=(+x.value||0)+2.5);
  }
}
function markPain(e,kind,val){activeWorkout.painFlag=true;if(val>3&&kind==='knee'&&['strength','goalkeeper'].includes(e.type)){} }
function painDuringWorkout(m,e){
  saveCurrentRecord(m,e);const r=activeWorkout.records[e.id]||{},k=+r.knee||0,a=+r.abd||0;if(k<=3&&a<=3){alert('Sube el control de dolor de rodilla o abdomen para indicar dónde y cuánto duele.');return;}
  activeWorkout.painFlag=true;const msg=k>3?`Rodilla ${k}/10`:a>3?`Abdomen ${a}/10`:'Dolor';openModal(`<div class="danger-box"><h3>${msg}</h3><p>${k>3?'Este ejercicio se marca para detener/reducir. Evita continuar con pierna o portero si hay dolor o inestabilidad.':''} ${a>3?'Se bloquean movimientos que aumenten presión abdominal.':''}</p><button class="btn full" id="skipPainExercise">Saltar este ejercicio</button><button class="btn secondary full" id="continueReduced">Continuar con menos carga/rango</button></div>`);$('#skipPainExercise').onclick=()=>{closeTopModal();advanceAfterPain();};$('#continueReduced').onclick=()=>closeTopModal();
}
function closeTopModal(){const ms=$$('.modal-backdrop');if(ms.length)ms.at(-1).remove();}
function advanceAfterPain(){if(activeWorkout.index<activeWorkout.ids.length-1){activeWorkout.index++;showWorkoutStep();}else finishWorkoutFlow();}
function saveCurrentRecord(m,e){
  let r={type:e.type,knee:+($('#kneePain',m)?.value||0),abd:+($('#abdPain',m)?.value||0)};
  if(e.type==='strength')r.sets=$$('.set-card',m).map(c=>({set:+c.dataset.set,weight:+$('[data-field="weight"]',c).value||0,reps:+$('[data-field="reps"]',c).value||0,rpe:+$('[data-field="rpe"]',c).value||6,done:c.classList.contains('done')}));
  else if(e.type==='cardio')Object.assign(r,{minutes:+$('#minutesValue',m).textContent||0,speed:+$('#speedField',m).value||0,incline:+$('#inclineField',m).value||0,rpe:+$('#activityRpe',m).value||4});
  else if(e.type==='mobility')Object.assign(r,{minutes:+$('#minutesValue',m).textContent||0,feeling:$('#feelingField',m).value});
  else if(e.type==='breathing')Object.assign(r,{minutes:+$('#minutesValue',m).textContent||0,rounds:+$('#roundsField',m).value||0});
  else Object.assign(r,{minutes:+$('#gkMinutes',m).value||0,reps:+$('#gkReps',m).value||0,rpe:+$('#activityRpe',m).value||3});
  activeWorkout.records[e.id]=r;return r;
}
function completeCurrentExercise(m,e){
  const r=saveCurrentRecord(m,e);if(r.knee>3||r.abd>3)activeWorkout.painFlag=true;
  if(activeWorkout.index<activeWorkout.ids.length-1){activeWorkout.index++;showWorkoutStep();}else finishWorkoutFlow();
}
function confirmExitWorkout(m){if(confirm('¿Salir de la sesión? El progreso de esta sesión no se guardará hasta finalizarla.')){activeWorkout=null;closeModal(m);}}
function startRestTimer(seconds){
  let remaining=seconds;if(restTimer)clearInterval(restTimer);let box=$('#restToast');if(box)box.remove();box=document.createElement('div');box.id='restToast';box.className='rest-toast';document.body.appendChild(box);const draw=()=>{box.innerHTML=`<b>Descanso</b><span>${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}</span><button id="skipRest">Saltar</button>`;$('#skipRest').onclick=()=>{remaining=0;};};draw();restTimer=setInterval(()=>{remaining--;if(remaining<=0){clearInterval(restTimer);restTimer=null;box.innerHTML='<b>Descanso terminado</b><span>✓</span>';if(navigator.vibrate)navigator.vibrate([120,80,120]);setTimeout(()=>box.remove(),1800);}else draw();},1000);
}
function finishWorkoutFlow(){
  const w=activeWorkout,duration=Math.max(1,Math.round((Date.now()-w.start)/60000));let sets=[],activities=[],cardioMin=0,maxK=0,maxA=0,volume=0;
  for(const id of w.ids){const e=EX[id],r=w.records[id];if(!r)continue;maxK=Math.max(maxK,r.knee||0);maxA=Math.max(maxA,r.abd||0);if(e.type==='strength'){for(const s of(r.sets||[])){const row={exerciseId:id,set:s.set,weight:s.weight,reps:s.reps,rpe:s.rpe,knee:r.knee||0,abd:r.abd||0,done:s.done};sets.push(row);volume+=row.weight*row.reps;}}else{activities.push({exerciseId:id,...r});if(e.type==='cardio')cardioMin+=r.minutes||0;}}
  const m=$('.workout-overlay');if(m)m.remove();const summary=openModal(`<div class="finish-badge">✓</div><h2>Sesión terminada</h2><p class="muted">Revisa el resumen antes de guardarla.</p><div class="grid two"><div class="metric"><div class="value">${duration}</div><div class="label">minutos</div></div><div class="metric"><div class="value">${w.ids.length}</div><div class="label">bloques</div></div><div class="metric"><div class="value">${Math.round(volume)}</div><div class="label">kg·reps</div></div><div class="metric"><div class="value">${cardioMin}</div><div class="label">min cardio</div></div></div><div class="pain-summary ${maxK>3||maxA>3?'danger-box':'ok-box'}"><b>Dolor máximo</b><div>Rodilla ${maxK}/10 · Abdomen ${maxA}/10</div></div><div class="form-row"><label>Nota final</label><textarea id="sessionNote" rows="3" placeholder="Cómo se sintió la sesión…"></textarea><button class="btn small secondary" id="voiceBtn">🎙️ Dictar</button></div><button class="btn ok full" id="saveFinishedSession">Guardar sesión</button><button class="btn secondary full" id="discardSession">Descartar</button>`,'summary-modal');
  $('#voiceBtn',summary).onclick=voiceNote;$('#discardSession',summary).onclick=()=>{if(confirm('¿Descartar esta sesión?')){activeWorkout=null;closeModal(summary);}};$('#saveFinishedSession',summary).onclick=()=>{const session={date:nowISO(),localDate:localKey(),routine:w.mode==='goalkeeper'?'Portero seguro':recommendation().name,mode:w.mode,durationMin:duration,sets,activities,cardioMin,note:$('#sessionNote',summary).value,checkin:checkin(),maxKnee:maxK,maxAbd:maxA};state.sessions.push(session);applyProgression(session);save();activeWorkout=null;closeModal(summary);render();alert(maxK>3||maxA>3?'Sesión guardada. Hubo dolor >3/10: la próxima sesión debe proteger esa zona.':'Sesión guardada.');};
}
function lastStrengthSet(id){for(let i=state.sessions.length-1;i>=0;i--){const arr=(state.sessions[i].sets||[]).filter(x=>x.exerciseId===id&&x.done!==false);if(arr.length)return arr.at(-1);}return null;}
function applyProgression(session){
  const by={};for(const s of(session.sets||[])){if(s.done===false)continue;(by[s.exerciseId]??=[]).push(s);}for(const[id,arr]of Object.entries(by)){if(!arr.length)continue;const avgR=arr.reduce((a,b)=>a+b.rpe,0)/arr.length,k=Math.max(...arr.map(x=>x.knee||0)),a=Math.max(...arr.map(x=>x.abd||0)),top=arr.every(x=>x.reps>=12);let action='mantener',factor=1,reason='RPE y ejecución dentro del rango.';if(k>3||a>3||avgR>=9){action='bajar';factor=.85;reason='Dolor >3/10 o RPE alto.';}else if(top&&avgR<=7){action='subir';factor=id==='leg_press'?1.05:1.075;reason='Rango alto completado con RPE ≤7 y sin dolor relevante.';}const base=Math.max(...arr.map(x=>x.weight||0));state.progression[id]={date:nowISO(),action,recommended:Math.round(base*factor*2)/2,reason};}
}
function voiceNote(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return alert('Dictado no disponible en este navegador. Puedes escribir la nota.');const r=new SR();r.lang='es-MX';r.interimResults=false;r.onresult=e=>{const t=$('#sessionNote');if(t)t.value+=(t.value?' ':'')+e.results[0][0].transcript;};r.onerror=()=>alert('No se pudo usar el micrófono. Revisa permisos.');r.start();}
function drawCharts(){drawBar('volChart',weekVolumes());drawBar('adhChart',weekAdherence());}
function weekVolumes(){const vals=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=localKey(d),ss=state.sessions.filter(s=>(s.localDate||s.date.slice(0,10))===key);vals.push({label:d.toLocaleDateString('es-MX',{weekday:'short'}),value:ss.reduce((a,s)=>a+(s.sets||[]).reduce((z,r)=>z+(r.weight||0)*(r.reps||0),0),0)});}return vals;}
function weekAdherence(){const vals=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=localKey(d);vals.push({label:d.toLocaleDateString('es-MX',{weekday:'short'}),value:state.sessions.some(s=>(s.localDate||s.date.slice(0,10))===key)?1:0});}return vals;}
function drawBar(id,data){const c=$('#'+id);if(!c)return;const ctx=c.getContext('2d'),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#121922';ctx.fillRect(0,0,w,h);const max=Math.max(1,...data.map(x=>x.value)),pad=36,bw=(w-pad*2)/data.length*.62,gap=(w-pad*2)/data.length;ctx.font='12px sans-serif';ctx.textAlign='center';data.forEach((x,i)=>{const bh=(h-60)*(x.value/max),xx=pad+i*gap+(gap-bw)/2,yy=h-34-bh;ctx.fillStyle=x.value>0?'#35d07f':'#263141';ctx.fillRect(xx,yy,bw,bh||3);ctx.fillStyle='#97a3b3';ctx.fillText(x.label,xx+bw/2,h-14);});}
function exportJSON(){download('entrena-respaldo-'+localKey()+'.json',JSON.stringify(state,null,2),'application/json');}
function exportCSV(){const rows=[['fecha','rutina','tipo','ejercicio','serie','peso','reps','rpe','dolor_rodilla','dolor_abdomen','minutos','nota']];state.sessions.forEach(s=>{(s.sets||[]).forEach(r=>rows.push([s.date,s.routine,'fuerza',EX[r.exerciseId]?.name||r.exerciseId,r.set,r.weight,r.reps,r.rpe,r.knee,r.abd,'',cleanCsv(s.note)]));(s.activities||[]).forEach(r=>rows.push([s.date,s.routine,r.type,EX[r.exerciseId]?.name||r.exerciseId,'','','',r.rpe||'',r.knee||0,r.abd||0,r.minutes||'',cleanCsv(s.note)]));});download('entrena-sesiones-'+localKey()+'.csv',rows.map(r=>r.join(',')).join('\n'),'text/csv');}
function cleanCsv(s=''){return`"${String(s).replaceAll('"','""')}"`;}
function importJSON(ev){const f=ev.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{const data=JSON.parse(rd.result);if(!data.profile||!Array.isArray(data.sessions))throw 0;state={...clone(DEFAULT),...data};save();alert('Respaldo importado.');render();}catch(e){alert('Archivo JSON no válido para esta app.');}};rd.readAsText(f);}
function download(name,txt,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);}

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').classList.remove('hidden');});
$('#installBtn').onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('#installBtn').classList.add('hidden');};
if('serviceWorker'in navigator)navigator.serviceWorker.register('service-worker.js').catch(()=>{});
initCloud();
setInterval(()=>{if('Notification'in window&&Notification.permission==='granted'&&state.settings.notify){const[h,m]=state.profile.trainingHour.split(':').map(Number),d=new Date(),key='notified-'+localKey();if(d.getHours()===h&&d.getMinutes()===m&&!sessionStorage.getItem(key)){new Notification('Entrena · Jonathan',{body:'Haz la versión que puedas cumplir hoy.'});sessionStorage.setItem(key,'1');}}},30000);
render();
