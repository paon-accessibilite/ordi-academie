const $=id=>document.getElementById(id);
// La casse ne compte pas pour la validation ; le nom saisi reste affiché.
const sameName=(a,b)=>a.trim().normalize('NFC').toLocaleLowerCase('fr')===b.trim().normalize('NFC').toLocaleLowerCase('fr');
const missions=[['Un premier clic','Clique une fois sur le dossier « Mes images ».','Place le pointeur sur le dossier jaune, puis appuie une fois sur le bouton gauche.'],['Ouvre le dossier','Ouvre « Mes images » avec un double-clic, ou un clic puis la touche Entrée.','Clique une fois sur le dossier, puis appuie sur Entrée. Tu peux aussi cliquer deux fois rapidement au même endroit.'],['Crée un dossier','Fais un clic droit dans un espace vide de Mes images et crée un dossier appelé « Animaux ».','Appuie sur le bouton droit de la souris dans le blanc de la fenêtre, choisis « Nouveau dossier », écris Animaux puis valide.'],['Donne un nom au fichier','Fais un clic droit sur « Photo 1 », puis choisis « Renommer » et écris « Chat ».','Place le pointeur sur Photo 1 et appuie sur le bouton droit. Clique ensuite sur « Renommer », efface le nom et écris Chat.'],['Range ton image','Déplace le fichier « Chat » dans le dossier « Animaux ».','Glisse Chat sur Animaux, ou sélectionne Chat puis utilise le bouton « Déplacer ».'],['Copie ton image','Ouvre Animaux, copie Chat, puis retourne dans Mes images et colle le fichier.','Fais un clic droit sur Chat, choisis Copier. Clique sur Retour puis fais un clic droit dans le blanc et choisis Coller.'],['Renomme un dossier','Dans Mes images, renomme le dossier Animaux en Mes animaux.','Fais un clic droit sur Animaux, choisis Renommer et écris Mes animaux.'],['Déplace un dossier','Déplace le dossier Mes animaux dans le dossier Archives.','Sélectionne Mes animaux, clique sur Déplacer et choisis Archives. Tu peux aussi le glisser sur Archives.'],['Utilise la corbeille','Supprime le fichier Mon petit mémo dans Mes images.','Fais un clic droit sur Mon petit mémo et choisis Supprimer. Il sera placé dans la corbeille.'],['Répare une erreur','Ouvre la Corbeille et restaure Mon petit mémo.','Ouvre la Corbeille avec un double-clic, ou un clic puis Entrée. Fais un clic droit sur Mon petit mémo et choisis Restaurer.']];
const passedSteps=new Set();
let step=0,completed=false,selected=null,currentFolder='root',action=null,clipboard=null,serial=0;
let entries=[{id:'photo',name:'Photo 1',type:'image',parent:'root'},{id:'note',name:'Mon petit mémo',type:'text',parent:'root'}];
function folderPath(id){
  if(id==='root')return 'Mes images';if(id==='trash')return 'Corbeille';
  const folder=entries.find(e=>e.id===id);return folder?folderPath(folder.parent)+' / '+folder.name:'Mes images';
}
function isTrashed(id){
  const e=entries.find(e=>e.id===id);return !!e&&(e.parent==='trash'||e.parent!=='root'&&isTrashed(e.parent));
}
function validDestination(e,id){
  if(!id||id==='trash'||id===e.id)return false;
  if(id==='root')return true;
  const dest=entries.find(x=>x.id===id);
  if(!dest||dest.type!=='folder'||isTrashed(id))return false;
  return validDestination(e,dest.parent);
}
function copySelected(){
  const e=entries.find(e=>e.id===selected);if(!e||isTrashed(e.id)){tell('Sélectionne un fichier ou un dossier à copier.');return}
  const snapshot=id=>{const source=entries.find(e=>e.id===id);return {name:source.name,type:source.type,sourceId:id,content:source.content,children:entries.filter(e=>e.parent===id).map(e=>snapshot(e.id))}};
  clipboard={...snapshot(e.id),mode:'copy'};renderFiles();checkFileClipboardMission('copy',e.id);if(!completed)tell('Élément copié. Ouvre le dossier de destination puis choisis Coller.');
}
function uniqueName(name,parent,excludeId=null){
  const extension=name.match(/\.(txt|tad|docx|png|jpe?g|gif|pdf)$/i)?.[0]||'',base=extension?name.slice(0,-extension.length):name;
  let result=name,index=1;while(entries.some(e=>e.id!==excludeId&&e.parent===parent&&sameName(e.name,result))){result=base+' (copie '+index+')'+extension;index++}return result;
}
function pasteClipboard(){
  if(!clipboard||currentFolder==='trash'||isTrashed(currentFolder)){tell('Copie d’abord un élément, puis ouvre son dossier de destination.');return}
  if(clipboard.mode==='cut'){
    const sourceId=clipboard.sourceId,entry=entries.find(e=>e.id===sourceId);
    if(!entry||isTrashed(sourceId)){clipboard=null;renderFiles();tell('Cet élément n’est plus disponible. Coupe à nouveau un fichier ou dossier.');return}
    if(entry.parent===currentFolder){tell('Ouvre un autre dossier pour déplacer cet élément.');return}
    if(moveFile(sourceId,currentFolder)){clipboard=null;renderFiles();checkFileClipboardMission('cut-paste',sourceId)}return;
  }
  const clone=(snapshot,parent)=>{const id='copy-'+ ++serial;entries.push({id,name:uniqueName(snapshot.name,parent),type:snapshot.type,parent,copiedFrom:snapshot.sourceId,content:snapshot.content});snapshot.children.forEach(child=>clone(child,id));return id};
  clone(clipboard,currentFolder);renderFiles();tell('La copie est créée. L’original reste à sa place.');
  if(step===basicStart+5&&clipboard.sourceId==='photo'&&currentFolder==='root')success();checkChallenge(false);checkFileClipboardMission('copy-paste',clipboard.sourceId);
}
function deleteSelected(){
  const e=entries.find(e=>e.id===selected);if(!e||isTrashed(e.id)){tell('Sélectionne un élément à supprimer.');return}
  e.originalParent=e.parent;e.parent='trash';selected=null;renderFiles();tell('Élément placé dans la corbeille. Tu peux le restaurer.');
  if(step===basicStart+8&&e.id==='note')success();
}
function restoreSelected(){
  const e=entries.find(e=>e.id===selected);if(!e||e.parent!=='trash'){tell('Sélectionne un élément dans la corbeille.');return}
  const original=entries.find(x=>x.id===e.originalParent);
  e.parent=e.originalParent==='root'||original&&!isTrashed(original.id)?e.originalParent:'root';
  e.name=uniqueName(e.name,e.parent,e.id);delete e.originalParent;selected=null;renderFiles();tell('Élément restauré dans '+folderPath(e.parent)+'.');
  if(step===basicStart+9&&e.id==='note')success();
}
function tell(message){$('feedback').textContent=message}
function success(){if(completed)return;completed=true;passedSteps.add(step);const awards=recordProgress();tell('✓ Bravo ! Tu as réussi cette mission.'+(awards.length?' 🏅 Nouveau badge : '+awards.join(', '):''));$('next').hidden=false;$('next').textContent=step===missions.length-1?'Terminer mon parcours ✨':'Mission suivante →';renderSteps()}
let stepsPage=0;
function renderSteps(followCurrent=true){
 const container=$('steps');container.replaceChildren();if(followCurrent)stepsPage=Math.floor(step/5);
 const start=stepsPage*5;missions.slice(start,start+5).forEach((m,index)=>{const i=start+index,d=document.createElement('div');d.className='step '+(i===step?'active':passedSteps.has(i)?'done':'');const n=document.createElement('span');n.className='number';n.textContent=passedSteps.has(i)?'✓':i+1;d.append(n,document.createTextNode(m[0]));container.append(d)});
 $('previousSteps').disabled=stepsPage===0;$('followingSteps').disabled=start+5>=missions.length;
}
function mission(){stopSpeech();closeContextMenu();completed=false;$('next').hidden=true;$('hint').hidden=true;$('missionNumber').textContent=`MISSION ${step+1} / ${missions.length}`;$('title').textContent=missions[step][0];$('instruction').textContent=missions[step][1];renderSteps();renderAdvancedExercise()}
function openFolder(id){closeContextMenu();currentFolder=id;selected=null;showSimWindow('files');renderFiles();if(step===basicStart+1&&id==='root')success();checkChallenge(false)}
function fileExtension(entry){return entry.type==='folder'?'':entry.name.match(/\.(txt|tad|docx|png|jpe?g|gif|pdf)$/i)?.[0]||''}
function displayName(entry){const ext=fileExtension(entry);return ext?entry.name.slice(0,-ext.length):entry.name}
function renderFiles(){const folderName=currentFolder==='trash'?'Corbeille':currentFolder==='root'?'Mes images':entries.find(e=>e.id===currentFolder)?.name||'Dossier';$('path').textContent=folderName;$('crumb').textContent=folderPath(currentFolder);$('status').textContent='Clique sur un élément pour le sélectionner.';$('restore').hidden=currentFolder!=='trash';for(const id of ['create','rename','move','copy','cut','paste','delete'])$(id).hidden=currentFolder==='trash';$('files').replaceChildren();entries.filter(e=>e.parent===currentFolder&&!isTrashed(e.id)||currentFolder==='trash'&&e.parent==='trash').forEach(e=>{const b=document.createElement('button');b.className='file'+(selected===e.id?' selected':'')+(clipboard?.mode==='cut'&&clipboard.sourceId===e.id?' cut-pending':'');b.draggable=currentFolder!=='trash';b.dataset.entryId=e.id;b.setAttribute('aria-label',`${e.type==='folder'?'Dossier':'Fichier'} ${displayName(e)}`);const icon=document.createElement('span');icon.textContent=e.type==='folder'?'📁':e.type==='image'?'🐈':'T';if(e.type==='text')icon.className='tada-file-icon';b.append(icon,document.createTextNode(displayName(e)));b.onclick=()=>{selected=e.id;Array.from($('files').children).forEach(child=>child.classList.remove('selected'));b.classList.add('selected');$('status').textContent=`${displayName(e)} sélectionné`};b.ondblclick=()=>openEntry(e.id);b.ondragstart=ev=>ev.dataTransfer.setData('text/plain',e.id);if(e.type==='folder'&&currentFolder!=='trash'){b.ondragover=ev=>ev.preventDefault();b.ondrop=ev=>{ev.preventDefault();moveFile(ev.dataTransfer.getData('text/plain'),e.id)}}$('files').append(b)});if(!$('files').children.length)$('files').textContent=currentFolder==='trash'?'La corbeille est vide.':'Ce dossier est vide. Tu peux y ranger des fichiers.';renderBreadcrumb()}
function moveFile(id,dest){
const e=entries.find(e=>e.id===id);
if(!e||isTrashed(id)||!validDestination(e,dest)){tell('Choisis un dossier valide. Un dossier ne peut pas être rangé dans lui-même.');return false}
if(entries.some(x=>x.id!==id&&x.parent===dest&&sameName(x.name,e.name))){tell('Ce nom existe déjà dans le dossier de destination.');return false}
e.parent=dest;selected=null;renderFiles();tell('Le fichier ou dossier a été déplacé.');
if(step===basicStart+4&&e.id==='photo'&&sameName(e.name,'Chat')&&dest==='animals'||step===basicStart+7&&e.id==='animals'&&dest==='archives')success();checkChallenge(false);return true;
}
function showDialog(kind){
closeContextMenu();stopSpeech();
if(kind!=='create'&&!selected){tell('Clique d’abord sur le fichier ou dossier que tu veux modifier.');return}
if(currentFolder==='trash')return;
action=kind;const moving=kind==='move';
$('dialogTitle').textContent=kind==='create'?'Créer un dossier':kind==='rename'?'Renommer cet élément':'Déplacer cet élément';
$('error').textContent='';$('name').hidden=moving;$('name').required=!moving;$('destination').hidden=!moving;
$('fieldLabel').textContent=moving?'Dossier de destination':'Nom';$('fieldLabel').htmlFor=moving?'destination':'name';
$('name').value=kind==='rename'?displayName(entries.find(e=>e.id===selected)):'';
if(moving){const e=entries.find(e=>e.id===selected);$('destination').replaceChildren();['root',...entries.filter(x=>x.type==='folder'&&!isTrashed(x.id)).map(x=>x.id)].filter(id=>validDestination(e,id)&&id!==e.parent).forEach(id=>{const option=document.createElement('option');option.value=id;option.textContent=folderPath(id);$('destination').append(option)});$('destination').value=$('destination').children[0]?.value||''}
$('dialog').showModal();if(!moving){$('name').focus();$('name').select()}else $('destination').focus();
}
$('images').onclick=()=>{$('images').classList.add('selected');if(step===basicStart+0)success()};$('images').ondblclick=()=>openFolder('root');$('close').onclick=()=>{closeContextMenu();$('window').hidden=true};$('back').onclick=()=>openFolder(entries.find(e=>e.id===currentFolder)?.parent||'root');$('create').onclick=()=>showDialog('create');$('rename').onclick=()=>showDialog('rename');$('move').onclick=()=>showDialog('move');$('cancel').onclick=()=> $('dialog').close();
$('form').onsubmit=ev=>{ev.preventDefault();if(action==='move'){if(moveFile(selected,$('destination').value))$('dialog').close();else $('error').textContent='Choisis une autre destination.';return}let name=$('name').value.trim();if(!name){$('error').textContent='Écris un nom pour cet élément.';return}if(action==='rename'){const ext=fileExtension(entries.find(e=>e.id===selected));if(ext&&!name.toLowerCase().endsWith(ext.toLowerCase()))name+=ext}if(!name||/[\\/:*?"<>|]/.test(name)){$('error').textContent='Choisis un nom sans caractères spéciaux comme / ou :.';return}if(entries.some(e=>e.parent===currentFolder&&sameName(e.name,name)&&(action==='create'||e.id!==selected))){$('error').textContent='Ce nom est déjà utilisé dans ce dossier.';return}if(action==='create'){if(sameName(name,'Animaux')&&entries.some(e=>e.id==='animals')){$('error').textContent='Le dossier Animaux existe déjà dans Mes images.';return}entries.push({id:sameName(name,'Animaux')?'animals':`folder-${++serial}`,name,type:'folder',parent:currentFolder});tell('Ton nouveau dossier est créé.');if(step===basicStart+2&&sameName(name,'Animaux')&&currentFolder==='root')success()}else{const e=entries.find(e=>e.id===selected);e.name=name;tell('Le nom a été changé.');if(step===basicStart+3&&e.id==='photo'&&sameName(name,'Chat')||step===basicStart+6&&e.id==='animals'&&sameName(name,'Mes animaux'))success()}$('dialog').close();renderFiles();checkChallenge(false)};
$('help').onclick=()=>{if($('hint').hidden)noteHelp();stopSpeech();$('hintText').textContent=missions[step][2];$('hint').hidden=!$('hint').hidden};
$('next').onclick=()=>{
stopSpeech();if(!completed)return;
if(step===missions.length-1){$('title').textContent=passedSteps.size===missions.length?'Parcours terminé : bravo !':'Atelier terminé : bravo !';$('instruction').textContent='Consulte ton carnet pour voir les missions réussies, tes badges et les défis à poursuivre.';$('missionNumber').textContent='PARCOURS TERMINÉ';$('next').hidden=true;$('hint').hidden=true;tell('Bravo ! Retrouve les badges obtenus et tes missions réussies dans Mes badges.');return}
step++;prepareMission();mission();tell('À toi de jouer !');
};
function prepareMission(){
if(prepareFileClipboardMission())return;
if(prepareWindowMission())return;
if(prepareDocumentMission())return;
if(prepareAdvancedMission())return;
if(step===basicStart){entries=[{id:"photo",name:"Photo 1",type:"image",parent:"root"},{id:"note",name:"Mon petit mémo",type:"text",parent:"root"}];selected=null;currentFolder="root";clipboard=null;hideSimWindow("files");return}

if(step===basicStart+1){hideSimWindow('files');return}
if(step===basicStart+2)entries=entries.filter(e=>e.id!=='animals');
if(step===basicStart+3)entries.find(e=>e.id==='photo').name='Photo 1';
if(step===basicStart+4)entries.find(e=>e.id==='photo').parent='root';
if(step===basicStart+5){const photo=entries.find(e=>e.id==='photo');if(!sameName(photo.name,'Chat'))photo.name='Chat';photo.parent='animals'}
if(step===basicStart+6){const folder=entries.find(e=>e.id==='animals');if(!sameName(folder.name,'Animaux'))folder.name='Animaux'}
if(step===basicStart+7){const folder=entries.find(e=>e.id==='animals');if(!sameName(folder.name,'Mes animaux'))folder.name='Mes animaux';if(!entries.some(e=>e.id==='archives'))entries.push({id:'archives',name:'Archives',type:'folder',parent:'root'})}
if(step===basicStart+8){const note=entries.find(e=>e.id==='note');note.name='Mon petit mémo';note.parent='root';delete note.originalParent}
openFolder(step===basicStart+5?'animals':'root');
}
$('reset').onclick=()=>{if(!mayLeaveDocument())return;resetDocumentDraft();resetSimWindows();if($('docDialog').open)$('docDialog').close();if($('dialog').open)$('dialog').close();if($('filePreview').open)$('filePreview').close();stopSpeech();closeContextMenu();step=0;selected=null;currentFolder='root';clipboard=null;serial=0;passedSteps.clear();lessonStats.clear();entries=[{id:'photo',name:'Photo 1',type:'image',parent:'root'},{id:'note',name:'Mon petit mémo',type:'text',parent:'root'}];$('window').hidden=true;$('images').classList.remove('selected');$('trash').classList.remove('selected');mission();tell('Bienvenue ! Ta première mission t’attend.')};
const contextMenu=document.createElement('div');
contextMenu.id='contextMenu';contextMenu.className='context-menu';contextMenu.hidden=true;
contextMenu.setAttribute('role','menu');contextMenu.setAttribute('aria-label','Actions sur les fichiers');
document.body.append(contextMenu);
let contextOrigin=null;
function closeContextMenu(restoreFocus=false){contextMenu.hidden=true;if(restoreFocus&&contextOrigin)contextOrigin.focus()}
function openContextMenu(ev,id=null){
  ev.preventDefault();ev.stopPropagation();contextOrigin=ev.target;
  selected=id;
  Array.from($('files').children).forEach(child=>child.classList.toggle('selected',child.dataset.entryId===id));
  contextMenu.replaceChildren();
  const actions=currentFolder==='trash'?(id?[['Restaurer','restore']]:[]):id?[['Renommer','rename'],['Déplacer','move'],['Copier','copy'],['Couper','cut'],['Supprimer','delete']]:[['Nouveau dossier','create'],...(clipboard?[['Coller','paste']]:[])];
  if(!actions.length){closeContextMenu();return}
  if(id)$('status').textContent=displayName(entries.find(e=>e.id===id))+' sélectionné';
  actions.forEach(([label,kind])=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.setAttribute('role','menuitem');button.onclick=()=>{closeContextMenu();if(kind==='copy')copySelected();else if(kind==='cut')cutSelected();else if(kind==='paste')pasteClipboard();else if(kind==='delete')deleteSelected();else if(kind==='restore')restoreSelected();else showDialog(kind)};contextMenu.append(button)});
  contextMenu.hidden=false;
  const margin=8;
  contextMenu.style.left=Math.max(margin,Math.min(ev.clientX,document.documentElement.clientWidth-contextMenu.offsetWidth-margin))+'px';
  contextMenu.style.top=Math.max(margin,Math.min(ev.clientY,document.documentElement.clientHeight-contextMenu.offsetHeight-margin))+'px';
  contextMenu.children[0].focus();
}
$('files').oncontextmenu=ev=>{const file=ev.target.closest('.file');openContextMenu(ev,file?file.dataset.entryId:null)};
document.addEventListener('pointerdown',ev=>{if(!contextMenu.contains(ev.target))closeContextMenu()});
document.addEventListener('scroll',()=>closeContextMenu(),true);
window.addEventListener('resize',()=>closeContextMenu());
document.addEventListener('keydown',ev=>{
  if(!contextMenu.hidden){
    if(ev.key==='Escape'){ev.preventDefault();closeContextMenu(true);return}
    if(ev.key==='Tab'){closeContextMenu();return}
    if(ev.key==='ArrowDown'||ev.key==='ArrowUp'){
      ev.preventDefault();const buttons=Array.from(contextMenu.children);const index=buttons.indexOf(document.activeElement);
      buttons[(index+(ev.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length].focus();return;
    }
  }
  if($('docDialog').open||$('dialog').open||['INPUT','SELECT','TEXTAREA'].includes(ev.target.tagName)||ev.target.isContentEditable)return;
  if(ev.key==='Enter'){
    if(ev.target.id==='images'){ev.preventDefault();openFolder('root');return}
    if(ev.target.id==='tada'){ev.preventDefault();showEditor();return}
    if(ev.target.id==='trash'){ev.preventDefault();openFolder('trash');return}
    const file=ev.target.closest?.('.file');if(file){ev.preventDefault();openEntry(file.dataset.entryId);return}
  }
  if(currentFolder==='trash'||activeSimWindow==='editor')return;
  if((ev.ctrlKey||ev.metaKey)&&!['INPUT','SELECT','TEXTAREA'].includes(ev.target.tagName)){if(ev.key.toLowerCase()==='c'){ev.preventDefault();copySelected()}if(ev.key.toLowerCase()==='x'){ev.preventDefault();cutSelected()}if(ev.key.toLowerCase()==='v'){ev.preventDefault();pasteClipboard()}}
  if(ev.key==='Delete'&&selected){ev.preventDefault();deleteSelected()}
  if(ev.key==='F2'&&selected){ev.preventDefault();showDialog('rename')}
});


let speakingButton=null,speechRequest=0,nativeSpeechAudio=null,nativeSpeechUrl=null;
function stopSpeech(){
  speechRequest++;
  if(nativeSpeechAudio){nativeSpeechAudio.pause();nativeSpeechAudio=null}
  if(nativeSpeechUrl){URL.revokeObjectURL(nativeSpeechUrl);nativeSpeechUrl=null}
  if(window.speechSynthesis)window.speechSynthesis.cancel();
  if(speakingButton){speakingButton.textContent='🔊';speakingButton.setAttribute('aria-pressed','false');speakingButton=null}
}
async function readAloud(text,button){
  const alreadyReading=speakingButton===button;stopSpeech();if(alreadyReading)return;
  if(window.__TAURI__?.core?.invoke){
    const request=speechRequest;
    speakingButton=button;button.textContent='⏹';button.setAttribute('aria-pressed','true');
    $('speechStatus').hidden=true;
    try{
      const bytes=await window.__TAURI__.core.invoke('desktop_speech',{text});
      if(request!==speechRequest)return;
      if(bytes){
        nativeSpeechUrl=URL.createObjectURL(new Blob([new Uint8Array(bytes)],{type:'audio/wav'}));
        nativeSpeechAudio=new Audio(nativeSpeechUrl);
        nativeSpeechAudio.onended=()=>{if(request===speechRequest)stopSpeech()};
        nativeSpeechAudio.onerror=()=>{if(request===speechRequest){stopSpeech();$('speechStatus').hidden=false;$('speechStatus').textContent='La lecture audio est indisponible. Vérifie la sortie sonore.'}};
        await nativeSpeechAudio.play();return;
      }
      speakingButton=null;button.textContent='🔊';button.setAttribute('aria-pressed','false');
    }catch(error){
      if(request!==speechRequest)return;
      stopSpeech();$('speechStatus').hidden=false;$('speechStatus').textContent='La voix française n’a pas pu démarrer.';return;
    }
  }
  const synth=window.speechSynthesis;
  if(!synth||!window.SpeechSynthesisUtterance){$('speechStatus').hidden=false;$('speechStatus').textContent='La lecture vocale n’est pas disponible dans ce navigateur.';return}
  $('speechStatus').hidden=true;
  const utterance=new window.SpeechSynthesisUtterance(text);
  const voices=synth.getVoices();const french=voices.filter(v=>v.lang.toLowerCase().startsWith('fr'));
  utterance.voice=french.find(v=>v.localService)||french[0]||null;utterance.lang='fr-FR';utterance.rate=0.85;
  const request=speechRequest;speakingButton=button;button.textContent='⏹';button.setAttribute('aria-pressed','true');
  const finish=()=>{if(request!==speechRequest)return;button.textContent='🔊';button.setAttribute('aria-pressed','false');speakingButton=null};
  utterance.onend=finish;utterance.onerror=ev=>{if(request!==speechRequest)return;finish();if(!['canceled','interrupted'].includes(ev.error)){$('speechStatus').hidden=false;$('speechStatus').textContent='La voix n’a pas pu démarrer. Vérifie les voix françaises de ton navigateur ou de ton ordinateur.'}};
  try{synth.speak(utterance)}catch{finish();$('speechStatus').hidden=false;$('speechStatus').textContent='La lecture vocale est indisponible.'}
}
$('readInstruction').onclick=()=>readAloud($('instruction').textContent,$('readInstruction'));
$('readHint').onclick=()=>readAloud($('hintText').textContent,$('readHint'));
$('readDialog').onclick=()=>readAloud($('dialogTitle').textContent+'. '+$('fieldLabel').textContent,$('readDialog'));
$('dialog').addEventListener('close',stopSpeech);
window.addEventListener('pagehide',stopSpeech);
$('trash').onclick=()=>{$('trash').classList.add('selected');tell('Double-clique sur la Corbeille pour voir les éléments supprimés.')};
$('trash').ondblclick=()=>openFolder('trash');
$('copy').onclick=copySelected;$('paste').onclick=pasteClipboard;$('delete').onclick=deleteSelected;$('restore').onclick=restoreSelected;
initializeAdvanced();
initializeDocuments();
initializeTextPractice();
initializeWindows();
initializeFileClipboard();
mission();

initializeProfiles();
initializeScreen();
