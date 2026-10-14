// Éditeur TAda simplifié : les documents utilisent la même arborescence que le bureau.
const documentExercises=[
  ['Crée un document texte','Ouvre TAda sur le bureau, clique sur Nouveau et écris une courte invitation pour la classe. Puis clique sur Vérifier.','Un double-clic ou un clic puis Entrée ouvre TAda. Dans la feuille blanche, écris par exemple : Venez à notre exposition !'],
  ['Nomme ton document','Donne le nom Invitation à ton document, puis clique sur Vérifier.','Le champ Nom du document se trouve au-dessus de la feuille. Remplace Sans titre par Invitation.'],
  ['Enregistre au bon endroit','Enregistre Invitation dans Mes images / Classe / Invitations.','Clique sur Enregistrer. Choisis le chemin Mes images / Classe / Invitations, puis valide. Le fichier apparaît aussi dans les dossiers du bureau.'],
  ['Retrouve et rouvre ton document','Ferme TAda. Dans Mes images, ouvre Classe puis Invitations. Retrouve Invitation et ouvre-le pour revoir ton texte.','Tu peux ouvrir chaque dossier et le document par double-clic, ou par un clic puis Entrée. Le raccourci TAda permet aussi de retrouver un document avec Ouvrir.']
];
let documentStart=0,documentDraft={id:null,name:'Sans titre',content:'',dirty:false,created:false},documentClosed=false;
function isDocumentMission(){return step>=documentStart&&step<shortcutStart+shortcutExercises.length}
function seedDocumentFiles(){
  entries=[{id:'class',name:'Classe',type:'folder',parent:'root'},{id:'invitations',name:'Invitations',type:'folder',parent:'class'},{id:'other-invitations',name:'Invitations',type:'folder',parent:'root'}];
  selected=null;currentFolder='root';clipboard=null;documentClosed=false;resetDocumentDraft();hideSimWindow('files');renderFiles();
}
function resetDocumentDraft(){documentDraft={id:null,name:'Sans titre',content:'',dirty:false,created:false};hideSimWindow('editor');resetTextTools(true);renderDocument()}
function prepareDocumentMission(fresh=false){
  if(!isDocumentMission())return false;
  if(currentTextExercise())return prepareTextPractice();
  if(step===documentStart||fresh)seedDocumentFiles();
  if(fresh&&step>documentStart){
    documentDraft={id:null,name:step===documentStart+1?'Sans titre':'Invitation',content:'Venez à notre exposition !',dirty:true,created:true};
    if(step===documentStart+3){
      entries.push({id:'invitation-document',name:'Invitation.txt',type:'text',parent:'invitations',content:documentDraft.content});
      documentDraft.id='invitation-document';documentDraft.dirty=false;
    }
    showEditor();
  }
  if(step===documentStart+3){documentClosed=false;}
  return true;
}
function renderDocument(){
  $('docName').value=documentDraft.name;$('docText').value=documentDraft.content;
  const entry=entries.find(e=>e.id===documentDraft.id);
  $('docState').textContent=documentDraft.dirty?'Modifications à enregistrer':entry&&!isTrashed(entry.id)?'Enregistré : '+folderPath(entry.parent)+' / '+displayName(entry):'Pas encore enregistré';
}
function mayLeaveDocument(){return !documentDraft.dirty||window.confirm('Ton document contient des modifications non enregistrées. Les abandonner ?')}
function showEditor(){closeContextMenu();showSimWindow('editor');renderDocument();$('desktop').scrollIntoView?.({behavior:'smooth',block:'start'});$('docText').focus()}
function closeEditor(){
  if(!mayLeaveDocument())return false;
  if(documentDraft.dirty){const entry=entries.find(e=>e.id===documentDraft.id&&!isTrashed(e.id));documentDraft=entry?{id:entry.id,name:entry.name.replace(/\.txt$/i,''),content:entry.content??'',dirty:false,created:false}:{id:null,name:'Sans titre',content:'',dirty:false,created:false}}
  stopSpeech();hideSimWindow('editor');documentClosed=true;return true;
}
function newDocument(){if(!mayLeaveDocument())return;documentDraft={id:null,name:'Sans titre',content:'',dirty:false,created:true};resetTextTools();showEditor();tell('Ton nouveau document est prêt. Clique dans la feuille pour écrire.')}
function checkDocumentMission(explicit=false){
  if(!isDocumentMission()||completed)return;
  if(currentTextExercise()){if(explicit)checkTextPractice();return}
  const n=step-documentStart;
  const valid=n===0?documentDraft.created&&documentDraft.content.trim().length>0:n===1?documentDraft.created&&sameName(documentDraft.name,'Invitation')&&documentDraft.content.trim().length>0:false;
  if(explicit&&valid)success();else if(explicit){noteAttempt();tell(n===0?'Clique sur Nouveau et écris ton invitation avant de vérifier.':'Écris Invitation dans le champ Nom du document, puis vérifie.')}
}
function documentFolders(){return ['root',...entries.filter(e=>e.type==='folder'&&!isTrashed(e.id)).map(e=>e.id)]}
function listDocumentFiles(){
  const select=$('docOpenFile');select.replaceChildren();
  entries.filter(e=>e.type==='text'&&e.parent===$('docFolder').value&&!isTrashed(e.id)).forEach(e=>{const option=document.createElement('option');option.value=e.id;option.textContent=displayName(e);select.append(option)});
  select.value=select.children[0]?.value||'';
  $('docError').textContent=select.children.length?'':'Aucun document texte dans ce dossier.';
}
let documentDialogMode='save';
function showDocumentDialog(mode){
  if(mode==='open'&&!mayLeaveDocument())return;
  documentDialogMode=mode;stopSpeech();$('docError').textContent='';$('docDialogTitle').textContent=mode==='save'?'Enregistrer mon document':'Ouvrir un document';$('docOpenLabel').hidden=mode!=='open';
  $('docFolder').replaceChildren();documentFolders().forEach(id=>{const option=document.createElement('option');option.value=id;option.textContent=folderPath(id);$('docFolder').append(option)});
  const entry=entries.find(e=>e.id===documentDraft.id);$('docFolder').value=entry&&!isTrashed(entry.id)?entry.parent:documentFolders().includes(currentFolder)?currentFolder:'root';
  if(mode==='open')listDocumentFiles();$('docDialog').showModal();
}
function openTextDocument(id){
  const entry=entries.find(e=>e.id===id);if(!entry||entry.type!=='text'||isTrashed(id))return false;
  if(!mayLeaveDocument())return false;
  documentDraft={id:entry.id,name:entry.name.replace(/\.txt$/i,''),content:entry.content??'Document d’entraînement',dirty:false,created:false};resetTextTools();showEditor();
  tell('Document ouvert : '+displayName(entry));
  if(isDocumentMission()&&step===documentStart+3&&documentClosed&&entry.id==='invitation-document'&&entry.parent==='invitations'&&sameName(entry.name,'Invitation.txt')&&entry.content?.trim())success();
  return true;
}
function saveTextDocument(){
  const name=documentDraft.name.trim().replace(/\.txt$/i,'');
  if(!name||/[\\/:*?"<>|]/.test(name)){$('docError').textContent='Choisis un nom sans caractères spéciaux comme / ou :.';return false}
  const parent=$('docFolder').value;if(!documentFolders().includes(parent)){$('docError').textContent='Choisis un dossier disponible.';return false}
  const filename=name+'.txt',existing=entries.find(e=>e.parent===parent&&sameName(e.name,filename));
  if(existing&&existing.id!==documentDraft.id){$('docError').textContent='Ce nom existe déjà ici. Choisis un autre nom ou un autre dossier.';return false}
  let entry=entries.find(e=>e.id===documentDraft.id&&!isTrashed(e.id));
  if(!entry){entry={id:isDocumentMission()&&!entries.some(e=>e.id==='invitation-document')?'invitation-document':'document-'+ ++serial,type:'text'};entries.push(entry)}
  Object.assign(entry,{name:filename,parent,content:documentDraft.content});documentDraft.id=entry.id;documentDraft.name=name;documentDraft.dirty=false;renderDocument();renderFiles();
  tell('Document enregistré : '+folderPath(parent)+' / '+displayName(entry));
  if(isDocumentMission()&&step===documentStart+2){if(sameName(name,'Invitation')&&parent==='invitations'&&entry.content.trim())success();else{noteAttempt();tell('Ton document est enregistré. Pour réussir, utilise le nom Invitation et le dossier Classe / Invitations.')}}
  if(currentTextExercise()?.skill==='save'){if(textEvidence.has('shortcut-save')&&sameName(name,'Raccourcis')&&parent==='invitations'&&entry.content.normalize('NFC')===currentTextExercise().target)success();else{noteAttempt();tell('Utilise Ctrl+S, le nom Raccourcis, le dossier Classe / Invitations et le texte demandé.')}}
  return true;
}
function initializeDocuments(){
  $('startDocuments').onclick=()=>{if(!mayLeaveDocument())return;stopSpeech();closeContextMenu();if($('dialog').open)$('dialog').close();if($('docDialog').open)$('docDialog').close();if($('filePreview').open)$('filePreview').close();step=documentStart;prepareMission();mission();tell('Bienvenue dans l’atelier documents !')};
  $('tada').onclick=()=>{$('tada').classList.add('selected');tell('Double-clique sur TAda, ou appuie sur Entrée, pour ouvrir l’éditeur.')};$('tada').ondblclick=showEditor;
  $('docNew').onclick=newDocument;$('docClose').onclick=closeEditor;$('docSave').onclick=()=>showDocumentDialog('save');$('docOpen').onclick=()=>showDocumentDialog('open');
  const changed=()=>{documentDraft.name=$('docName').value;documentDraft.content=$('docText').value;documentDraft.dirty=true;$('docState').textContent='Modifications à enregistrer'};
  $('docName').oninput=changed;$('docText').oninput=changed;$('docCheck').onclick=()=>checkDocumentMission(true);
  $('docRead').onclick=()=>{if(documentDraft.content.trim())readAloud(documentDraft.content,$('docRead'));else tell('Écris un texte pour le faire lire.')};
  $('docFolder').onchange=()=>{if(documentDialogMode==='open')listDocumentFiles()};$('docCancel').onclick=()=>{$('docDialog').close()};
  $('docForm').onsubmit=event=>{event.preventDefault();if(documentDialogMode==='save'){if(saveTextDocument())$('docDialog').close()}else if(openTextDocument($('docOpenFile').value))$('docDialog').close()};
}
