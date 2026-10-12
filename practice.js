// Les gestes sont validés dans le vrai champ de texte de TAda.
const writingExercises=[
 {title:'Des espaces dans TAda',instruction:'Écris le chat dort avec un seul espace entre chaque mot, puis vérifie.',hint:'La grande barre en bas du clavier ajoute un espace. Le modèle doit être reproduit exactement.',initial:'',target:'le chat dort',skill:'spaces'},
 {title:'Des majuscules dans TAda',instruction:'Écris Bonjour Tom avec le B et le T en majuscules, puis vérifie.',hint:'Maintiens Maj pendant la lettre, puis relâche-la. Ici, les majuscules font partie de la consigne.',initial:'',target:'Bonjour Tom',skill:'capitals'},
 {title:'Des accents dans TAda',instruction:'Écris élève à côté avec les accents et les espaces, puis vérifie.',hint:'Repère é, è et à. Sur un clavier français courant, appuie sur ^ puis o pour ô. La disposition dépend du clavier.',initial:'',target:'élève à côté',skill:'accents'},
 {title:'Retour arrière dans TAda',instruction:'Corrige chatt en chat avec Retour arrière. Place le curseur après le dernier t, puis vérifie.',hint:'Retour arrière efface à gauche du curseur. Clique à la fin du mot ou appuie sur Fin, puis sur Retour arrière.',initial:'chatt',target:'chat',skill:'backspace'},
 {title:'Suppr dans TAda',instruction:'Corrige cchat en chat avec Suppr. Place le curseur avant le premier c, puis vérifie.',hint:'Suppr efface à droite du curseur. Clique au début du mot ou appuie sur Début, puis sur Suppr.',initial:'cchat',target:'chat',skill:'delete'}
];
const clipboardExercises=[
 {title:'Copie un mot dans TAda',instruction:'Sélectionne Bonjour dans la feuille et clique sur Copier. Le mot doit rester dans le document. Puis vérifie.',hint:'Maintiens le bouton gauche pour sélectionner le mot, ou double-clique sur Bonjour. Copier conserve le texte à sa place.',initial:'Bonjour',target:'Bonjour',skill:'copy'},
 {title:'Colle une copie dans TAda',instruction:'Sélectionne Bonjour et clique sur Copier. À la fin, ajoute un espace puis clique sur Coller pour obtenir Bonjour Bonjour.',hint:'Copie le mot, clique après le dernier r, ajoute un espace et colle. Tu peux coller plusieurs fois le texte copié.',initial:'Bonjour',target:'Bonjour Bonjour',skill:'copy-paste'},
 {title:'Déplace un mot dans TAda',instruction:'Dans bleu rouge, sélectionne rouge et clique sur Couper. Colle-le au début puis ajuste les espaces pour obtenir rouge bleu.',hint:'Couper retire la sélection. Coller la remet à l’endroit du curseur : le mot est déplacé, au lieu d’être dupliqué.',initial:'bleu rouge',target:'rouge bleu',skill:'cut-paste'}
];
const shortcutExercises=[
 {title:'Tout sélectionner avec Ctrl+A',instruction:'Clique dans le texte puis utilise Ctrl+A pour sélectionner toute la phrase. Clique ensuite sur Vérifier.',hint:'Maintiens Ctrl, appuie sur A, puis relâche. Ce raccourci sélectionne tout le texte du document.',initial:'Bonjour la classe !',target:'Bonjour la classe !',skill:'select-all'},
 {title:'Copier et coller avec les raccourcis',instruction:'Dans TAda, utilise Ctrl+A puis Ctrl+C. Place le curseur à la fin, ajoute un espace et utilise Ctrl+V pour obtenir Salut Salut.',hint:'Ctrl+A sélectionne tout, Ctrl+C copie, Ctrl+V colle. Clique à la fin ou utilise la touche Fin.',initial:'Salut',target:'Salut Salut',skill:'shortcut-copy'},
 {title:'Couper et coller avec les raccourcis',instruction:'Dans chat chien, sélectionne chien. Utilise Ctrl+X puis colle au début avec Ctrl+V. Ajuste les espaces pour obtenir chien chat.',hint:'Ctrl+X coupe la sélection. Ctrl+V colle au curseur. Le texte doit être déplacé une seule fois.',initial:'chat chien',target:'chien chat',skill:'shortcut-cut'},
 {title:'Annuler avec Ctrl+Z',instruction:'Ajoute un caractère à bonjour, puis utilise Ctrl+Z pour annuler cette modification et retrouver bonjour.',hint:'Annuler revient sur la dernière modification. Clique dans la feuille avant d’utiliser Ctrl+Z.',initial:'bonjour',target:'bonjour',skill:'undo'},
 {title:'Enregistrer avec Ctrl+S',instruction:'Écris Mon texte est prêt. puis utilise Ctrl+S. Enregistre le document Raccourcis dans Mes images / Classe / Invitations.',hint:'Ctrl+S ouvre Enregistrer dans TAda. Choisis le bon dossier et valide. Le fichier apparaît dans l’explorateur.',initial:'',target:'Mon texte est prêt.',skill:'save'}
];
let writingStart=0,clipboardStart=0,shortcutStart=0,textClipboard='',textEvidence=new Set(),textKey=null,textChange=null,textHistory=[];
function currentTextExercise(){
 if(step>=writingStart&&step<clipboardStart)return writingExercises[step-writingStart];
 if(step>=clipboardStart&&step<shortcutStart)return clipboardExercises[step-clipboardStart];
 if(step>=shortcutStart&&step<shortcutStart+shortcutExercises.length)return shortcutExercises[step-shortcutStart];
 return null;
}
function resetTextTools(clearClipboard=false){if(clearClipboard)textClipboard='';textEvidence=new Set();textKey=null;textChange=null;textHistory=[];updateTextClipboard()}
function updateTextClipboard(){$('textClipboardState').textContent=textClipboard?'Texte prêt à coller : « '+textClipboard.slice(0,60)+(textClipboard.length>60?'…':'')+' »':'Sélectionne du texte avant de copier ou couper.'}
function prepareTextPractice(){
 const exercise=currentTextExercise();if(!exercise)return false;
 if(!entries.some(e=>e.id==='invitations'))seedDocumentFiles();
 documentDraft={id:null,name:exercise.skill==='save'?'Raccourcis':exercise.title,content:exercise.initial,dirty:false,created:true};resetTextTools(true);hideSimWindow('files');showEditor();return true;
}
function renderTextPractice(){
 const exercise=currentTextExercise();$('textPractice').hidden=!exercise;$('docRetry').hidden=!exercise;
 if(exercise){$('textModel').textContent=exercise.target;$('textPracticeTip').textContent=exercise.skill==='select-all'?'Sélectionne toute la phrase avec le raccourci.':'Texte à obtenir';}
}
function textSelection(){const input=$('docText');return {value:input.value,start:input.selectionStart||0,end:input.selectionEnd||0}}
function rememberText(selection){textHistory.push({...selection});if(textHistory.length>100)textHistory.shift()}
function editText(value,start,end=start){$('docText').value=value;$('docText').focus();$('docText').setSelectionRange(start,end);documentDraft.content=value;documentDraft.dirty=true;$('docState').textContent='Modifications à enregistrer'}
function textCommand(command,origin='button'){
 const selection=textSelection(),part=selection.value.slice(selection.start,selection.end);
 if(command==='copy'||command==='cut'){
   if(!part){tell('Sélectionne du texte avant de '+(command==='copy'?'copier.':'couper.'));return false}
   textClipboard=part;textEvidence.add(command);if(origin==='shortcut')textEvidence.add('shortcut-'+command);
   if(command==='cut'){rememberText(selection);editText(selection.value.slice(0,selection.start)+selection.value.slice(selection.end),selection.start)}
   updateTextClipboard();tell(command==='copy'?'Texte copié : il reste dans la feuille.':'Texte coupé : choisis où le coller.');return true;
 }
 if(command==='paste'){
   if(!textClipboard){tell('Copie ou coupe du texte avant de coller.');return false}
   rememberText(selection);editText(selection.value.slice(0,selection.start)+textClipboard+selection.value.slice(selection.end),selection.start+textClipboard.length);
   textEvidence.add('paste');if(origin==='shortcut')textEvidence.add('shortcut-paste');tell('Texte collé à l’endroit du curseur.');return true;
 }
 if(command==='undo'){
   const previous=textHistory.pop();if(!previous||previous.value===selection.value){tell('Aucune modification à annuler.');return false}
   editText(previous.value,previous.start,previous.end);textEvidence.add('undo');if(origin==='shortcut')textEvidence.add('shortcut-undo');tell('La dernière modification est annulée.');return true;
 }
 return false;
}
function checkTextPractice(){
 const exercise=currentTextExercise();if(!exercise||completed)return;
 const value=$('docText').value.normalize('NFC'),exact=value===exercise.target.normalize('NFC'),has=(...keys)=>keys.every(key=>textEvidence.has(key));
 let valid=exact;
 if(['backspace','delete'].includes(exercise.skill))valid=exact&&has(exercise.skill);
 if(exercise.skill==='copy')valid=exact&&has('copy')&&textClipboard===exercise.target;
 if(exercise.skill==='copy-paste')valid=exact&&has('copy','paste')&&textClipboard==='Bonjour';
 if(exercise.skill==='cut-paste')valid=exact&&has('cut','paste')&&textClipboard==='rouge';
 if(exercise.skill==='select-all'){const selection=textSelection();valid=exact&&has('select-all')&&selection.start===0&&selection.end===selection.value.length;}
 if(exercise.skill==='shortcut-copy')valid=exact&&has('select-all','shortcut-copy','shortcut-paste')&&textClipboard==='Salut';
 if(exercise.skill==='shortcut-cut')valid=exact&&has('shortcut-cut','shortcut-paste')&&textClipboard==='chien';
 if(exercise.skill==='undo')valid=exact&&has('shortcut-undo');
 if(exercise.skill==='save')valid=false; // Réussite après un enregistrement effectif.
 if(valid)success();else{noteAttempt();tell(!exact?'Compare ton texte au modèle : vérifie chaque espace, lettre et accent.':'Le texte est correct. Utilise aussi le geste demandé dans la consigne, puis vérifie.')}
}
function initializeTextPractice(){
 const start=index=>{if(!mayLeaveDocument())return;stopSpeech();closeContextMenu();for(const id of ['dialog','docDialog','filePreview'])if($(id).open)$(id).close();seedDocumentFiles();step=index;prepareMission();mission();tell('À toi de jouer dans TAda !')};
 $('startWriting').onclick=()=>start(writingStart);$('startClipboard').onclick=()=>start(clipboardStart);$('startShortcuts').onclick=()=>start(shortcutStart);
 $('docRetry').onclick=()=>{noteAttempt();passedSteps.delete(step);prepareTextPractice();mission();tell('Le texte est prêt pour un nouvel essai.')};
 for(const [id,command] of [['docCopy','copy'],['docCut','cut'],['docPaste','paste'],['docUndo','undo']]){const button=$(id);button.onpointerdown=event=>event.preventDefault();button.onclick=()=>textCommand(command);}
 $('editorPanel').onkeydown=event=>{if(event.target.id!=='docText'&&(event.ctrlKey||event.metaKey)&&!event.altKey&&!event.shiftKey&&event.key.toLowerCase()==='s'){event.preventDefault();event.stopPropagation();textEvidence.add('shortcut-save');showDocumentDialog('save')}};
 const input=$('docText');
 // Le menu du navigateur peut aussi copier/couper/coller ; il ne valide pas un raccourci.
 for(const command of ['copy','cut'])input['on'+command]=event=>{const selection=textSelection(),part=selection.value.slice(selection.start,selection.end);if(!part||!event.clipboardData)return;event.preventDefault();event.clipboardData.setData('text/plain',part);textCommand(command,'native')};
 input.onpaste=event=>{if(!event.clipboardData)return;const value=event.clipboardData.getData('text/plain');if(!value)return;event.preventDefault();textClipboard=value;updateTextClipboard();textCommand('paste','native')};
 input.onkeydown=event=>{
   textKey=event.key==='Backspace'?'backspace':event.key==='Delete'?'delete':null;
   if(!(event.ctrlKey||event.metaKey)||event.altKey||event.shiftKey)return;
   const key=event.key.toLowerCase();if(!['a','c','x','v','z','s'].includes(key))return;event.preventDefault();event.stopPropagation();
   if(key==='a'){input.setSelectionRange(0,input.value.length);textEvidence.add('select-all');}
   else if(key==='s'){textEvidence.add('shortcut-save');showDocumentDialog('save');}
   else textCommand({c:'copy',x:'cut',v:'paste',z:'undo'}[key],'shortcut');
 };
 input.onkeyup=()=>{textKey=null};input.onblur=()=>{textKey=null;textChange=null};
 input.onbeforeinput=event=>{const selection=textSelection();textChange={...selection,type:event.inputType,key:textKey};};
 const changed=input.oninput;input.oninput=event=>{
   const change=textChange;textChange=null;
   if(change&&change.value!==input.value){rememberText(change);if(change.start===change.end){if(change.key==='backspace'&&change.type==='deleteContentBackward'&&change.start>0&&input.value===change.value.slice(0,change.start-1)+change.value.slice(change.start))textEvidence.add('backspace');if(change.key==='delete'&&change.type==='deleteContentForward'&&change.start<change.value.length&&input.value===change.value.slice(0,change.start)+change.value.slice(change.start+1))textEvidence.add('delete');}}
   changed(event);
 };
 // Les commandes copier/couper/coller utilisent un presse-papiers propre à TAda.
}
