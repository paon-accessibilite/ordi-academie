const windowExercises=[
 ['Réduis une fenêtre','Clique sur le bouton Réduire (—) de la fenêtre Mes images.','Réduire cache la fenêtre sans la fermer. Elle reste disponible dans la barre du bas.'],
 ['Retrouve une fenêtre réduite','Clique sur Mes images dans la barre du bas pour retrouver la fenêtre.','La barre des tâches garde les fenêtres ouvertes, même lorsqu’elles sont réduites.'],
 ['Agrandis puis restaure','Agrandis Mes images avec le bouton carré, puis clique à nouveau pour retrouver sa taille normale.','Le carré agrandit la fenêtre dans le bureau simulé. Une fois agrandie, le bouton devient Restaurer.'],
 ['Ferme une fenêtre','Ferme Mes images avec la croix (×).','Fermer retire la fenêtre de la barre des tâches. Tu pourras rouvrir Mes images depuis son icône du bureau.'],
 ['Change la largeur','Maintiens une poignée latérale de Mes images et déplace-la pour changer la largeur.','Les poignées se trouvent sur les bords et dans les coins. Réduis ou augmente la largeur.'],
 ['Redimensionne par un coin','Avec le coin inférieur droit, change à la fois la largeur et la hauteur de Mes images.','Maintiens le clic gauche sur la poignée du coin, puis déplace-la en diagonale.'],
 ['Place la fenêtre à gauche','Glisse la barre de titre de Mes images jusqu’au bord gauche du bureau, puis relâche.','La fenêtre occupera automatiquement la moitié gauche du bureau simulé.'],
 ['Place la fenêtre à droite','Glisse la barre de titre de Mes images jusqu’au bord droit du bureau, puis relâche.','Maintiens le clic sur la barre de titre, sans utiliser les boutons de la fenêtre.'],
 ['Libère une fenêtre accrochée','Mes images occupe un demi-écran. Glisse sa barre de titre vers le centre pour retrouver une fenêtre libre.','Saisis la barre de titre et éloigne-la du bord, puis relâche au centre du bureau.'],
 ['Deux fenêtres côte à côte','Place Mes images sur une moitié du bureau et TAda sur l’autre moitié.','Glisse chaque barre de titre vers un bord différent. Utilise la barre des tâches pour retrouver une fenêtre cachée derrière l’autre.']
];
let basicStart=0,windowStart=0,activeSimWindow=null,windowLayer=1,windowEnlarged=false;
const simWindows={files:{panel:'window',task:'taskFiles',max:false,open:false},editor:{panel:'editorPanel',task:'taskEditor',max:false,open:false}};
function isWindowMission(){return step>=windowStart&&step<windowStart+windowExercises.length}
function focusSimWindow(kind){activeSimWindow=kind;windowLayer=3;for(const name of ['files','editor'])$(simWindows[name].panel).style.zIndex=name===kind?'3':'2'}
function syncSimWindow(kind){const state=simWindows[kind],panel=$(state.panel);$(state.task).hidden=!state.open;panel.classList.toggle('maximized',state.max);const r=!state.max&&state.rect;Object.assign(panel.style,{left:r?r.x+'px':'',top:r?r.y+'px':'',width:r?r.w+'px':'',height:r?r.h+'px':'',right:r?'auto':'',bottom:r?'auto':''});const button=$(kind==='files'?'maximizeFiles':'maximizeEditor');button.textContent=state.max||state.snap?'❐':'□';button.setAttribute('aria-label',state.max||state.snap?'Restaurer la taille de la fenêtre':'Agrandir la fenêtre');button.title=state.max||state.snap?'Restaurer la taille':'Agrandir'}
function showSimWindow(kind){const state=simWindows[kind];state.open=true;$(state.panel).hidden=false;focusSimWindow(kind);syncSimWindow(kind)}
function hideSimWindow(kind){const state=simWindows[kind];state.open=false;state.max=false;state.snap=null;state.rect=null;state.restoreRect=null;$(state.panel).hidden=true;syncSimWindow(kind);if(activeSimWindow===kind)activeSimWindow=null}
function minimizeSimWindow(kind){const state=simWindows[kind];if(!state.open||$(state.panel).hidden)return;$(state.panel).hidden=true;if(activeSimWindow===kind)activeSimWindow=null;stopSpeech();if(kind==='files'&&isWindowMission()&&step===windowStart)success()}
function restoreSimWindow(kind){const state=simWindows[kind];if(!state.open)return;const wasHidden=$(state.panel).hidden;showSimWindow(kind);if(kind==='files'&&wasHidden&&isWindowMission()&&step===windowStart+1)success()}
function maximizeSimWindow(kind){const state=simWindows[kind];if(!state.open)return;if(state.snap){state.snap=null;state.rect=state.restoreRect;state.max=false}else state.max=!state.max;focusSimWindow(kind);syncSimWindow(kind);if(kind==='files'&&isWindowMission()&&step===windowStart+2){if(state.max)windowEnlarged=true;else if(windowEnlarged)success()}}
function closeFilesWindow(){closeContextMenu();hideSimWindow('files');if(isWindowMission()&&step===windowStart+3)success()}
function resetSimWindows(){hideSimWindow('files');hideSimWindow('editor');windowEnlarged=false}
function prepareWindowMission(){if(!isWindowMission())return false;resetSimWindows();currentFolder='root';selected=null;renderFiles();showSimWindow('files');if(step===windowStart+1)minimizeSimWindow('files');if(step===windowStart+8)snapWindow('files','left');if(step===windowStart+9){resetDocumentDraft();documentDraft.content='Deux fenêtres pour travailler !';renderDocument();showSimWindow('editor')}return true}
function initializeWindows(){
 $('minimizeFiles').onclick=()=>minimizeSimWindow('files');$('maximizeFiles').onclick=()=>maximizeSimWindow('files');$('close').onclick=closeFilesWindow;
 $('minimizeEditor').onclick=()=>minimizeSimWindow('editor');$('maximizeEditor').onclick=()=>maximizeSimWindow('editor');
 $('taskFiles').onclick=()=>restoreSimWindow('files');$('taskEditor').onclick=()=>restoreSimWindow('editor');
 for(const kind of ['files','editor'])$(simWindows[kind].panel).addEventListener('pointerdown',()=>focusSimWindow(kind));
 $('startWindows').onclick=()=>{if(!mayLeaveDocument())return;resetDocumentDraft();step=windowStart;prepareMission();mission();tell('Apprends à utiliser les boutons, les poignées et les bords du bureau.')};resetSimWindows();initializeDesktopGestures();
}
