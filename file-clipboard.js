const fileClipboardExercises=[
 ['Copie un fichier du bureau','Dans Mes images, sélectionne Affiche et choisis Copier. Le fichier doit rester à sa place.','Fais un clic droit sur Affiche, puis choisis Copier. Tu peux aussi utiliser le bouton de la fenêtre.'],
 ['Colle un fichier dans un dossier','Copie Affiche depuis Mes images, puis colle-le dans Classe. Garde l’original dans Mes images.','Copie Affiche, ouvre Classe, puis fais un clic droit dans le blanc et choisis Coller.'],
 ['Déplace un fichier avec Couper','Coupe Histoire dans Mes images, puis colle-le dans Classe. Il doit quitter son ancien dossier.','Couper prépare le déplacement : le fichier reste visible jusqu’au collage. Ouvre Classe puis choisis Coller.'],
 ['Déplace un dossier avec Couper','Coupe Album dans Mes images, puis colle-le dans Archives avec sa photo à l’intérieur.','Un dossier se coupe comme un fichier. Colle Album dans Archives, puis ouvre-le pour retrouver sa photo.']
];
let fileClipboardStart=0;
function isFileClipboardMission(){return step>=fileClipboardStart&&step<fileClipboardStart+fileClipboardExercises.length}
function prepareFileClipboardMission(){
 if(!isFileClipboardMission())return false;
 entries=[{id:'clip-class',name:'Classe',type:'folder',parent:'root'},{id:'clip-archives',name:'Archives',type:'folder',parent:'root'},{id:'clip-album',name:'Album',type:'folder',parent:'root'},{id:'clip-photo',name:'Souvenir.png',type:'image',parent:'clip-album'},{id:'clip-poster',name:'Affiche.png',type:'image',parent:'root'},{id:'clip-story',name:'Histoire.txt',type:'text',parent:'root',content:'Notre histoire de classe.'}];
 clipboard=null;selected=null;currentFolder='root';resetSimWindows();openFolder('root');return true;
}
function checkFileClipboardMission(action,sourceId){
 if(!isFileClipboardMission()||completed)return;
 const n=step-fileClipboardStart,entry=id=>entries.find(e=>e.id===id);
 if(n===0&&action==='copy'&&sourceId==='clip-poster'&&entry(sourceId)?.parent==='root')success();
 if(n===1&&action==='copy-paste'&&sourceId==='clip-poster'&&entry(sourceId)?.parent==='root'&&entries.some(e=>e.copiedFrom===sourceId&&e.parent==='clip-class'))success();
 if(n===2&&action==='cut-paste'&&sourceId==='clip-story'&&entry(sourceId)?.parent==='clip-class'&&entry(sourceId)?.content==='Notre histoire de classe.')success();
 if(n===3&&action==='cut-paste'&&sourceId==='clip-album'&&entry(sourceId)?.parent==='clip-archives'&&entry('clip-photo')?.parent===sourceId)success();
}
function cutSelected(){
 if(selectionIds().length>1){batchClipboard("cut");return}
 const entry=entries.find(e=>e.id===selected);if(!entry||isTrashed(entry.id)){tell('Sélectionne un fichier ou dossier à couper.');return}
 clipboard={mode:'cut',sourceId:entry.id};renderFiles();tell('Élément prêt à déplacer. Il reste ici jusqu’au collage dans un autre dossier.');
}
function initializeFileClipboard(){
 $('cut').onclick=cutSelected;
 $('startFileClipboard').onclick=()=>{if(!mayLeaveDocument())return;resetDocumentDraft();stopSpeech();closeContextMenu();for(const id of ['dialog','docDialog','filePreview'])if($(id).open)$(id).close();step=fileClipboardStart;prepareMission();mission();tell('Copier conserve l’original ; couper puis coller déplace l’élément.')};
}
