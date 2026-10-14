// Navigation et progression v0.2. Les titres historiques restent stables.
const navigationExercises=[
 ['Entre dans un sous-dossier','Dans Mes images, ouvre le dossier Animaux.','Double-clique sur Animaux, ou sélectionne-le puis appuie sur Entrée.'],
 ['Descends encore un niveau','Ouvre Animaux puis le sous-dossier Chats.','Le chemin devient Mes images / Animaux / Chats.'],
 ['Reviens au dossier parent','Depuis Chats, utilise Retour pour revenir dans Animaux.','Retour remonte d’un seul niveau.'],
 ['Retrouve la racine','Depuis Chats, reviens à Mes images avec le fil de navigation.','Clique sur Mes images dans le chemin affiché au-dessus des fichiers.']
];
function basicStep(index){return basicStart+index+(index>=2?navigationExercises.length:0)}
function basicMissionIndex(index){return index<basicStart+2?index-basicStart:index-basicStart-navigationExercises.length}
function seedBasicMission(){
 const n=basicMissionIndex(step);
 entries=[{id:'photo',name:n>=4?'Chat':'Photo 1',type:'image',parent:n>=5?'animals':'root'},
 {id:'note',name:'Mon petit mémo',type:'text',parent:n===9?'trash':'root'}];
 if(n>=3)entries.push({id:'animals',name:n>=7?'Mes animaux':'Animaux',type:'folder',parent:n>=8?'archives':'root'});
 if(n>=7)entries.push({id:'archives',name:'Archives',type:'folder',parent:'root'});
 if(n===9)entries.find(e=>e.id==='note').originalParent='root';
 selected=null;currentFolder='root';clipboard=null;
}
function prepareNavigationMission(){
 if(step<basicStart+2||step>=basicStart+2+navigationExercises.length)return false;
 entries=[{id:'nav-animals',name:'Animaux',type:'folder',parent:'root'},{id:'nav-cats',name:'Chats',type:'folder',parent:'nav-animals'}];
 selected=null;clipboard=null;currentFolder=step>=basicStart+4?'nav-cats':'root';
 showSimWindow('files');renderFiles();return true;
}
function checkNavigationMission(from,to){
 const n=step-basicStart-2;
 if(n===0&&to==='nav-animals'||n===1&&from==='nav-animals'&&to==='nav-cats'||n===2&&from==='nav-cats'&&to==='nav-animals'||n===3&&from==='nav-cats'&&to==='root')success();
}
function replayMission(index){
 if(!Number.isInteger(index)||!missions[index])return;
 if(!mayLeaveDocument())return;
 stopSpeech();closeContextMenu();resetDocumentDraft();resetSimWindows();
 for(const id of ['dialog','docDialog','filePreview','badgeCelebration'])if($(id).open)$(id).close();
 step=index;completed=false;lastOpenedEntry=null;selected=null;clipboard=null;pathChoice='';
 prepareMission(true);mission();$('badgePanel').hidden=true;tell('À toi de jouer ! Tes réussites restent dans ton carnet.');saveActiveProfile();
}
function currentBadge(){return badgeDefinitions().find(b=>b.steps.includes(step))}
const badgeModules=['startBasics','startOrganizer','startPaths','startMouse','startWindows','startFileClipboard','startDocuments','startWriting','startClipboard','startShortcuts'];
function renderModuleBadges(){badgeDefinitions().forEach((badge,i)=>{
 const button=$(badgeModules[i]);if(!button)return;
 button.classList.toggle('badge-complete',!!badgeEarned(badge));
 button.setAttribute('aria-label',badge.name+(badgeEarned(badge)?' — badge obtenu':''));
 button.setAttribute('aria-current',badge.steps.includes(step)?'step':'false');
})}
function renderBadgeJourney(){
 const badge=currentBadge();if(!badge)return;
 const panel=$('badgeJourney');
 panel.replaceChildren();const heading=document.createElement('strong'),status=document.createElement('span');
 const count=badge.steps.filter(i=>progressRecords[i]).length;
 heading.textContent=badge.icon+' Objectif : '+badge.name;
 status.textContent=count+' / '+badge.steps.length+' missions réussies'+(badgeEarned(badge)?' · Badge obtenu !':'');
 const progress=document.createElement('progress');progress.max=badge.steps.length;progress.value=count;progress.setAttribute('aria-label','Progression du badge '+badge.name);
 const retry=document.createElement('button');retry.type='button';retry.textContent='↻ Refaire';retry.setAttribute('aria-label','Refaire cette mission');retry.onclick=()=>replayMission(step);
 const film=document.createElement('button');film.type='button';film.textContent='▶ Présentation';film.setAttribute('aria-label','Voir la présentation de ce badge');film.onclick=()=>openDemo('badge');const tools=document.createElement('div');tools.className='badge-film-actions';tools.append(retry,film);panel.append(heading,status,progress,tools);
 if(completed)$('feedback').textContent=missionSuccessMessage();
}
function missionSuccessMessage(){const badge=currentBadge();return '✓ Mission réussie !'+(badge?' '+badge.name+' : '+badge.steps.filter(i=>progressRecords[i]).length+' / '+badge.steps.length+'.':'')}
function celebrateBadge(name){
 const badge=badgeDefinitions().find(b=>b.name===name);if(!badge)return;
 $('celebrationTitle').textContent='Félicitations : '+badge.name+' !';
 $('celebrationIcon').textContent=badge.icon;$('celebrationSkills').textContent='Tu as appris à : '+badge.skill+'.';
 $('collectBadge').onclick=()=>{
  const icon=$('celebrationIcon'),target=$('showBadges');
  const from=icon.getBoundingClientRect?.(),to=target.getBoundingClientRect?.();
  $('badgeCelebration').close();
  if(from&&to&&typeof icon.animate==='function'&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
   const flying=document.createElement('span');flying.className='flying-badge';flying.textContent=badge.icon;
   flying.style.left=from.left+'px';flying.style.top=from.top+'px';document.body.append(flying);
   const animation=flying.animate([{transform:'translate(0,0) scale(1)'},{transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(.3)`}],{duration:850,easing:'ease-in-out'});
   animation.onfinish=()=>{flying.remove();target.focus()};
  }else target.focus();
 };
 $('badgeCelebration').showModal();$('collectBadge').focus();
}
