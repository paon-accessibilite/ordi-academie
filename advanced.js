// Ateliers supplémentaires ; ce fichier est chargé avant app.js.
const pathExercises=[
  ['Trouve le bon fichier','Ouvre le fichier Observation situé dans Mes images / Projets / Nature / Notes. Attention : un autre fichier porte le même nom !','Ouvre Projets, puis Nature, puis Notes. Un clic puis Entrée ouvre aussi les dossiers et le fichier.'],
  ['Retrouve l’adresse du fichier','Sélectionne Renard dans Projets / Nature / Photos, puis choisis son adresse parmi les trois propositions.','Lis le fil de navigation de gauche à droite : Mes images, Projets, Nature, Photos. Le nom Renard vient à la fin.'],
  ['Place au bon endroit','Déplace Renard de À ranger vers Mes images / Projets / Nature / Photos.','Trouve Renard dans À ranger. Utilise Déplacer et lis bien le chemin complet de la destination.'],
  ['Copie vers une autre branche','Copie Observation depuis Projets / Nature / Notes vers Mes images / Archives / 2026, en conservant l’original.','Copie le fichier, remonte avec Retour ou le fil de navigation, ouvre Archives puis 2026, et colle.'],
  ['Construis un chemin','Dans Projets / Nature, crée Sortie, puis un dossier Photos à l’intérieur. Déplace Carte depuis À ranger dans ce nouveau dossier Photos.','Le chemin final doit être Mes images / Projets / Nature / Sortie / Photos / Carte. Un dossier Photos existe ailleurs : choisis le bon.'],
  ['Le grand rangement','Range depuis À ranger : Renard dans Projets / Nature / Photos, Observation dans Projets / Nature / Notes et Carte dans Projets / Nature / Cartes.','Trois fichiers, trois chemins. Déplace les fichiers, puis clique sur Vérifier le défi. Ne touche pas aux fichiers déjà rangés.']
];
const mouseExercises=[
  ['Vise avec le clic gauche','Clique avec le bouton gauche sur six cibles fromage. La cible change de place après chaque réussite.','Place le pointeur au centre du fromage, puis clique une seule fois. Tu peux agrandir les cibles.', 'left',6],
  ['Choisis le clic droit','Clique avec le bouton droit sur six cibles rouges.','Utilise le bouton droit de la souris. Le menu du navigateur ne s’ouvre pas dans cette zone.', 'right',6],
  ['Entraîne le double-clic','Fais cinq doubles-clics sur les cibles jaunes. Tu peux choisir un délai plus souple.','Deux clics gauches sur la même cible. Reste au même endroit entre les deux clics ; une première pression ne déplace pas la cible.', 'double',5],
  ['Glisse sans lâcher','Glisse quatre petites souris dans leur maison verte.','Maintiens le bouton gauche sur la souris, déplace-la jusque dans la maison, puis relâche. Si c’est difficile, réessaie tranquillement.', 'drag',4]
];
let pathStart=0,mouseStart=0,lastOpenedEntry=null,mouseHits=0,mouseWrong=0,mouseFirstClick=null,mouseDragging=false;
const lessonStats=new Map();
let progressRecords={},progressAvailable=true;
const progressKey='ordi-academie-achievements-v1';
function isPathMission(){return step>=pathStart&&step<pathStart+pathExercises.length}
function isMouseMission(){return step>=mouseStart&&step<mouseStart+mouseExercises.length}
function noteHelp(){const stats=lessonStats.get(step)||{help:0,attempts:0};stats.help++;lessonStats.set(step,stats)}
function noteAttempt(){const stats=lessonStats.get(step)||{help:0,attempts:0};stats.attempts++;lessonStats.set(step,stats)}
function badgeDefinitions(){return [
  {name:'Premier bureau',icon:'🌱',steps:Array.from({length:6},(_,i)=>basicStart+i),skill:'Sélectionner, ouvrir un dossier, entrer dans un sous-dossier et revenir à la racine'},
  {name:'Organisateur',icon:'📁',steps:Array.from({length:8},(_,i)=>basicStep(i+2)),skill:'Créer, renommer, déplacer, copier et restaurer'},
  {name:'Explorateur des chemins',icon:'🧭',steps:Array.from({length:6},(_,i)=>i+pathStart),skill:'Lire un chemin et trouver le bon fichier'},
  {name:'Souris agile',icon:'🐭',steps:Array.from({length:4},(_,i)=>i+mouseStart),skill:'Clic gauche, clic droit, double-clic et glisser-déposer'},
  {name:'Maître des fenêtres',icon:'▣',steps:Array.from({length:4},(_,i)=>i+windowStart),skill:'Réduire, retrouver, agrandir, restaurer et fermer'},
  {name:'Fichiers bien rangés',icon:'⧉',steps:Array.from({length:4},(_,i)=>i+fileClipboardStart),skill:'Copier, coller, couper et déplacer un dossier avec son contenu'},
  {name:'Auteur en herbe',icon:'📝',steps:Array.from({length:4},(_,i)=>i+documentStart),skill:'Créer, nommer, enregistrer et retrouver un document'},
  {name:'Clavier apprivoisé',icon:'⌨️',steps:Array.from({length:5},(_,i)=>i+writingStart),skill:'Espaces, majuscules, accents, Retour arrière et Suppr'},
  {name:'Presse-papiers malin',icon:'✂️',steps:Array.from({length:3},(_,i)=>i+clipboardStart),skill:'Copier, couper et coller du texte'},
  {name:'Raccourcis maîtrisés',icon:'⚡',steps:Array.from({length:5},(_,i)=>i+shortcutStart),skill:'Ctrl+A, Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+Z et Ctrl+S'}
]}
function recordProgress(){
  const before=badgeDefinitions().filter(b=>badgeEarned(b)).map(b=>b.name);
  const stats=lessonStats.get(step)||{help:0,attempts:0};
  progressRecords[step]={title:missions[step][0],date:new Date().toISOString(),help:stats.help,attempts:stats.attempts};
  try{window.localStorage.setItem(profileProgressKey(),JSON.stringify(progressRecords))}catch{progressAvailable=false}
  const awards=badgeDefinitions().filter(b=>!before.includes(b.name)&&b.steps.every(i=>progressRecords[i])).map(b=>b.name);
  if(activeProfile)activeProfile.earnedBadges=[...new Set([...(activeProfile.earnedBadges||[]),...awards])];
  saveActiveProfile();renderBadges();return awards;
}
function badgeEarned(b){return b.steps.every(i=>progressRecords[i])||activeProfile?.earnedBadges?.includes(b.name)}
let reportPage=0;
function renderBadges(allRows=false){
  $('badgeGrid').replaceChildren();
  badgeDefinitions().forEach(b=>{const count=b.steps.filter(i=>progressRecords[i]).length,earned=badgeEarned(b);
    const card=document.createElement('article');card.className='badge-card '+(earned?'earned':'');
    const icon=document.createElement('span');icon.className='badge-icon';icon.textContent=b.icon;
    const title=document.createElement('h3');title.textContent=b.name;
    const description=document.createElement('p');description.textContent=b.skill;
    const status=document.createElement('strong');status.textContent=earned?'✓ Badge obtenu':count+' / '+b.steps.length+' missions réussies';const replay=document.createElement('button');replay.type='button';replay.textContent=earned?'Refaire ce badge':'Travailler ce badge';replay.onclick=()=>replayMission(b.steps[0]);card.append(icon,title,description,status,replay);$('badgeGrid').append(card);
  });
  $('progressStorage').textContent=progressAvailable?'Les réussites et badges de '+(activeProfile?.name||'ce carnet')+' sont conservés pour ce profil, dans ce navigateur.':'La sauvegarde locale est indisponible. Le carnet reste consultable pendant cette session.';
  const table=document.createElement('table'),head=document.createElement('tr');
  ['Mission','Réussite','Aides consultées','Essais à corriger'].forEach(label=>{const th=document.createElement('th');th.textContent=label;head.append(th)});table.append(head);
  missions.map((m,i)=>({m,i})).slice(allRows?0:reportPage*8,allRows?missions.length:reportPage*8+8).forEach(({m,i})=>{const record=progressRecords[i],row=document.createElement('tr');
    [String(i+1)+'. '+m[0],record?new Date(record.date).toLocaleDateString('fr-FR',{timeZone:'Europe/Paris'}):'À travailler',record?String(record.help):'—',record?String(record.attempts):'—'].forEach(value=>{const td=document.createElement('td');td.textContent=value;row.append(td)});table.append(row);
  });$('teacherReport').replaceChildren();$('teacherReport').append(table);$('previousReport').disabled=reportPage===0;$('followingReport').disabled=(reportPage+1)*8>=missions.length;$('reportPageInfo').textContent='Missions '+(reportPage*8+1)+' à '+Math.min((reportPage+1)*8,missions.length)+' / '+missions.length;
}
function initializeAdvanced(){
  const basics=missions.splice(0);mouseStart=0;mouseExercises.forEach(e=>missions.push(e.slice(0,3)));
  basicStart=missions.length;missions.push(...basics.slice(0,2),...navigationExercises,...basics.slice(2));
  pathStart=missions.length;pathExercises.forEach(e=>missions.push(e.slice(0,3)));
  windowStart=missions.length;windowExercises.forEach(e=>missions.push(e));
  fileClipboardStart=missions.length;fileClipboardExercises.forEach(e=>missions.push(e));
  documentStart=missions.length;documentExercises.forEach(e=>missions.push(e));
  writingStart=missions.length;writingExercises.forEach(e=>missions.push([e.title,e.instruction,e.hint]));
  clipboardStart=missions.length;clipboardExercises.forEach(e=>missions.push([e.title,e.instruction,e.hint]));
  shortcutStart=missions.length;shortcutExercises.forEach(e=>missions.push([e.title,e.instruction,e.hint]));
  try{const loaded=JSON.parse(window.localStorage.getItem(progressKey)||'{}');
    if(loaded&&typeof loaded==='object')for(const record of Object.values(loaded)){
      const id=missions.findIndex(m=>m[0]===record?.title);
      if(missions[id]&&record?.title===missions[id][0]&&Number.isFinite(Date.parse(record.date))&&Number.isInteger(record.help)&&record.help>=0&&Number.isInteger(record.attempts)&&record.attempts>=0)progressRecords[id]=record;
    }
  }catch{progressAvailable=false}
  $('startBasics').onclick=()=>{$('reset').onclick();if(documentDraft.dirty)return;step=basicStart;prepareMission();mission();$('badgePanel').hidden=true};
  const start=index=>{if(!mayLeaveDocument())return;resetDocumentDraft();resetSimWindows();if($('docDialog').open)$('docDialog').close();stopSpeech();closeContextMenu();if($('dialog').open)$('dialog').close();if($('filePreview').open)$('filePreview').close();step=index;prepareMission();mission();tell('À toi de jouer !');$('badgePanel').hidden=true};
  $('startPaths').onclick=()=>start(pathStart);$('startMouse').onclick=()=>start(mouseStart);
  $('showBadges').onclick=()=>{renderBadges();$('badgePanel').hidden=!$('badgePanel').hidden;if(!$('badgePanel').hidden)$('badgePanel').scrollIntoView?.({behavior:'smooth',block:'start'})};
  $('teacherDetails').ontoggle=()=>{$('badgePanel').classList.toggle('teacher-view',$('teacherDetails').open)};$('previousReport').onclick=()=>{reportPage=Math.max(0,reportPage-1);renderBadges()};$('followingReport').onclick=()=>{reportPage=Math.min(Math.ceil(missions.length/8)-1,reportPage+1);renderBadges()};
  $('closeBadges').onclick=()=>{$('badgePanel').hidden=true};$('printBadges').onclick=()=>{$('teacherDetails').open=true;renderBadges(true);window.print();renderBadges()};
  $('checkChallenge').onclick=()=>checkChallenge(true);$('retryChallenge').onclick=()=>{noteAttempt();passedSteps.delete(step);prepareAdvancedMission();mission();tell('Le défi est prêt pour un nouvel essai.')};
  $('retryMouse').onclick=()=>{noteAttempt();passedSteps.delete(step);mission();tell('Nouvel essai. Prends ton temps.')};
  $('targetSize').onchange=()=>{mouseFirstClick=null;renderMouseTarget()};$('doubleDelay').onchange=()=>{mouseFirstClick=null};
  $('closePreview').onclick=()=>{$('filePreview').close()};renderBadges();
}
function seedPathFiles(){
  const folder=(id,name,parent)=>({id,name,type:'folder',parent});
  entries=[folder('projects','Projets','root'),folder('nature','Nature','projects'),folder('town','Ville','projects'),folder('notes','Notes','nature'),folder('town-notes','Notes','town'),folder('photos','Photos','nature'),folder('maps','Cartes','nature'),folder('inbox','À ranger','root'),folder('archives','Archives','root'),folder('year','2026','archives'),
    {id:'observation',name:'Observation.txt',type:'text',parent:'notes',content:'Observation : un renard a été aperçu près de la forêt.'},
    {id:'decoy',name:'Observation.txt',type:'text',parent:'town-notes',content:'Observation : des voitures circulent dans la ville.'},
    {id:'fox',name:'Renard.png',type:'image',parent:'photos'},
    {id:'map',name:'Carte.png',type:'image',parent:'inbox'}];
  if(step===pathStart+2||step===pathStart+5)entries.find(e=>e.id==='fox').parent='inbox';
  if(step===pathStart+5)entries.find(e=>e.id==='observation').parent='inbox';
  clipboard=null;selected=null;lastOpenedEntry=null;serial=0;
}
function prepareAdvancedMission(){
  if(isPathMission()){seedPathFiles();pathChoice='';openFolder('root');return true}
  if(isMouseMission()){$('window').hidden=true;selected=null;return true}return false;
}
function renderAdvancedExercise(){
  $('challengePanel').hidden=!(isPathMission()&&step===pathStart+1);$('checkChallenge').hidden=!isPathMission();$('retryChallenge').hidden=!isPathMission();$('mousePanel').hidden=!isMouseMission();
  $('docCheck').hidden=!isDocumentMission()||step===documentStart+2||step===documentStart+3||currentTextExercise()?.skill==='save';renderTextPractice();
  if(!isDocumentMission())hideSimWindow('editor');
  $('desktop').hidden=isMouseMission();if(isPathMission()){$('desktop').hidden=false;const read=step===pathStart+1;$('pathChoices').hidden=!read;if(read)renderPathChoices();renderBreadcrumb()}
  if(isMouseMission()){$('desktop').hidden=true;mouseHits=0;mouseWrong=0;mouseFirstClick=null;mouseDragging=false;renderMouseTarget()}
}
function renderBreadcrumb(){
  const chain=[];let id=currentFolder;
  while(id!=='root'&&id!=='trash'){const e=entries.find(e=>e.id===id);if(!e)break;chain.unshift({id,name:e.name});id=e.parent}
  chain.unshift({id,name:id==='trash'?'Corbeille':'Mes images'});$('crumb').replaceChildren();
  chain.forEach((item,index)=>{if(index)$('crumb').append(document.createTextNode(' / '));const button=document.createElement('button');button.className='crumb-button';button.textContent=item.name;button.onclick=()=>openFolder(item.id);if(item.id===currentFolder)button.setAttribute('aria-current','location');$('crumb').append(button)});
}
function openEntry(id){
  const e=entries.find(e=>e.id===id);if(!e)return;
  if(isTrashed(id)){tell('Choisis Restaurer pour retrouver cet élément.');return}
  if(e.type==='folder'){openFolder(id);return}
  if(e.type==='text'){if(openTextDocument(id)){lastOpenedEntry=id;checkChallenge(false)}return}
  lastOpenedEntry=id;$('previewTitle').textContent=displayName(e);$('previewPath').textContent=folderPath(e.parent)+' / '+displayName(e);
  $('previewContent').textContent=e.type==='image'?'🖼️ Image d’entraînement':e.id==='observation'?'Observation : un renard a été aperçu près de la forêt.':e.id==='decoy'?'Observation : des voitures circulent dans la ville.':'Document d’entraînement';
  $('filePreview').showModal();checkChallenge(false);
}
let pathChoice='';
function renderPathChoices(){
  $('pathOptions').replaceChildren();
  [['town-photos','Mes images / Projets / Ville / Photos / Renard.png'],['nature-photos','Mes images / Projets / Nature / Photos / Renard.png'],['nature','Mes images / Projets / Nature / Renard.png']].forEach(([value,text])=>{
    const label=document.createElement('label'),input=document.createElement('input'),span=document.createElement('span');
    input.type='radio';input.name='path-choice';input.value=value;input.checked=pathChoice===value;input.onchange=()=>{pathChoice=value};span.textContent=text.replace(/\.(png|txt)/g,'');label.append(input,span);$('pathOptions').append(label);
  });
}
function childFolder(parent,name){return entries.find(e=>e.parent===parent&&e.type==='folder'&&sameName(e.name,name))}
function checkChallenge(explicit){
  if(!isPathMission()||completed)return;
  const n=step-pathStart,entry=id=>entries.find(e=>e.id===id);let valid=false;
  if(n===0)valid=lastOpenedEntry==='observation'&&entry('observation')?.parent==='notes';
  if(n===1)valid=selected==='fox'&&pathChoice==='nature-photos';
  if(n===2)valid=entry('fox')?.parent==='photos';
  if(n===3)valid=entry('observation')?.parent==='notes'&&entries.some(e=>e.copiedFrom==='observation'&&sameName(e.name,'Observation.txt')&&e.parent==='year'&&e.type==='text');
  if(n===4){const outing=childFolder('nature','Sortie'),photos=outing&&childFolder(outing.id,'Photos');valid=!!photos&&entry('map')?.parent===photos.id}
  if(n===5)valid=entry('fox')?.parent==='photos'&&entry('observation')?.parent==='notes'&&entry('map')?.parent==='maps';
  // La lecture du chemin se valide avec le bouton, après choix de la proposition.
  if(valid&&(n!==1||explicit))success();
  else if(explicit){noteAttempt();tell(n===1?'Vérifie le fichier sélectionné, puis choisis l’adresse qui suit tous les dossiers du fil de navigation.':'Pas encore : relis le chemin demandé et vérifie chaque emplacement. Tu peux continuer à corriger.')}
}
function renderMouseTarget(){
  if(!isMouseMission())return;
  const exercise=mouseExercises[step-mouseStart],arena=$('mouseArena');arena.replaceChildren();
  $('mouseProgress').textContent=mouseHits+' / '+exercise[4]+' gestes réussis · '+mouseWrong+' essais à corriger';
  if(completed){const message=document.createElement('p');message.textContent='✓ Défi réussi !';arena.append(message);return}
  const target=document.createElement('button');target.type='button';target.className='mouse-target '+exercise[3];target.style.width=target.style.height=({large:90,medium:72,small:54}[$('targetSize').value]||90)+'px';
  const positions=[[20,30],[68,65],[40,72],[75,28],[28,58],[55,42]];const point=positions[mouseHits%positions.length];target.style.left=point[0]+'%';target.style.top=point[1]+'%';
  target.textContent=exercise[3]==='drag'?'🐭':'🧀';target.setAttribute('aria-label','Cible '+(mouseHits+1)+' : '+exercise[0]);
  target.onclick=ev=>{
    if(!ev.detail){tell('Pour cet exercice, utilise la souris sur la cible.');return}
    if(exercise[3]==='left')mouseGesture(true);
    else if(exercise[3]==='double'){
      const stamp=ev.timeStamp;const delay=Number($('doubleDelay').value)||1000;
      if(mouseFirstClick!==null&&stamp-mouseFirstClick<=delay&&stamp>mouseFirstClick){mouseFirstClick=null;mouseGesture(true)}else{mouseFirstClick=stamp;tell('Premier clic reçu : clique encore sur la même cible.')}
    }else if(exercise[3]==='right')mouseGesture(false);
  };
  target.oncontextmenu=ev=>{ev.preventDefault();if(ev.button!==2){tell('Utilise le bouton droit de la souris sur cette cible.');return}if(exercise[3]==='right')mouseGesture(true);else mouseGesture(false)};
  if(exercise[3]==='drag'){
    target.draggable=true;target.ondragstart=ev=>{mouseDragging=true;ev.dataTransfer.setData('text/plain','academy-mouse');ev.dataTransfer.effectAllowed='move'};target.ondragend=()=>{if(mouseDragging)mouseGesture(false);mouseDragging=false};
    const home=document.createElement('div');home.className='mouse-home';home.textContent='🏠 Maison';home.ondragover=ev=>ev.preventDefault();home.ondrop=ev=>{ev.preventDefault();if(mouseDragging&&ev.dataTransfer.getData('text/plain')==='academy-mouse'){mouseDragging=false;mouseGesture(true)}};arena.append(home);
  }
  arena.append(target);arena.oncontextmenu=ev=>ev.preventDefault();
  arena.onclick=ev=>{if(ev.target===arena&&!completed)mouseGesture(false)};
}
function mouseGesture(correct){
  if(completed||!isMouseMission())return;
  if(!correct){mouseFirstClick=null;mouseWrong++;noteAttempt();tell('Essaie à nouveau : vise la cible avec le geste demandé.');$('mouseProgress').textContent=mouseHits+' / '+mouseExercises[step-mouseStart][4]+' gestes réussis · '+mouseWrong+' essais à corriger';return}
  mouseHits++;if(mouseHits>=mouseExercises[step-mouseStart][4])success();else tell('Bien joué ! Continue avec la cible suivante.');renderMouseTarget();
}
