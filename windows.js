const windowExercises=[
 ['Réduis une fenêtre','Clique sur le bouton Réduire (—) de la fenêtre Mes images.','Réduire cache la fenêtre sans la fermer. Elle reste disponible dans la barre du bas.'],
 ['Retrouve une fenêtre réduite','Clique sur Mes images dans la barre du bas pour retrouver la fenêtre.','La barre des tâches garde les fenêtres ouvertes, même lorsqu’elles sont réduites.'],
 ['Agrandis puis restaure','Agrandis Mes images avec le bouton carré, puis clique à nouveau pour retrouver sa taille normale.','Le carré agrandit la fenêtre dans le bureau simulé. Une fois agrandie, le bouton devient Restaurer.'],
 ['Ferme une fenêtre','Ferme Mes images avec la croix (×).','Fermer retire la fenêtre de la barre des tâches. Tu pourras rouvrir Mes images depuis son icône du bureau.']
];
let basicStart=0,windowStart=0,activeSimWindow=null,windowLayer=1,windowEnlarged=false;
const simWindows={files:{panel:'window',task:'taskFiles',max:false,open:false},editor:{panel:'editorPanel',task:'taskEditor',max:false,open:false}};
function isWindowMission(){return step>=windowStart&&step<windowStart+windowExercises.length}
function focusSimWindow(kind){activeSimWindow=kind;$(simWindows[kind].panel).style.zIndex=String(++windowLayer)}
function syncSimWindow(kind){const state=simWindows[kind];$(state.task).hidden=!state.open;$(state.panel).classList.toggle('maximized',state.max);const button=$(kind==='files'?'maximizeFiles':'maximizeEditor');button.textContent=state.max?'❐':'□';button.setAttribute('aria-label',state.max?'Restaurer la taille de la fenêtre':'Agrandir la fenêtre');button.title=state.max?'Restaurer la taille':'Agrandir'}
function showSimWindow(kind){const state=simWindows[kind];state.open=true;$(state.panel).hidden=false;focusSimWindow(kind);syncSimWindow(kind)}
function hideSimWindow(kind){const state=simWindows[kind];state.open=false;state.max=false;$(state.panel).hidden=true;syncSimWindow(kind);if(activeSimWindow===kind)activeSimWindow=null}
function minimizeSimWindow(kind){const state=simWindows[kind];if(!state.open||$(state.panel).hidden)return;$(state.panel).hidden=true;if(activeSimWindow===kind)activeSimWindow=null;stopSpeech();if(kind==='files'&&isWindowMission()&&step===windowStart)success()}
function restoreSimWindow(kind){const state=simWindows[kind];if(!state.open)return;const wasHidden=$(state.panel).hidden;showSimWindow(kind);if(kind==='files'&&wasHidden&&isWindowMission()&&step===windowStart+1)success()}
function maximizeSimWindow(kind){const state=simWindows[kind];if(!state.open)return;state.max=!state.max;focusSimWindow(kind);syncSimWindow(kind);if(kind==='files'&&isWindowMission()&&step===windowStart+2){if(state.max)windowEnlarged=true;else if(windowEnlarged)success()}}
function closeFilesWindow(){closeContextMenu();hideSimWindow('files');if(isWindowMission()&&step===windowStart+3)success()}
function resetSimWindows(){hideSimWindow('files');hideSimWindow('editor');windowEnlarged=false}
function prepareWindowMission(){if(!isWindowMission())return false;resetSimWindows();currentFolder='root';selected=null;renderFiles();showSimWindow('files');if(step===windowStart+1)minimizeSimWindow('files');return true}
function initializeWindows(){
 $('minimizeFiles').onclick=()=>minimizeSimWindow('files');$('maximizeFiles').onclick=()=>maximizeSimWindow('files');$('close').onclick=closeFilesWindow;
 $('minimizeEditor').onclick=()=>minimizeSimWindow('editor');$('maximizeEditor').onclick=()=>maximizeSimWindow('editor');
 $('taskFiles').onclick=()=>restoreSimWindow('files');$('taskEditor').onclick=()=>restoreSimWindow('editor');
 for(const kind of ['files','editor'])$(simWindows[kind].panel).addEventListener('pointerdown',()=>focusSimWindow(kind));
 $('startWindows').onclick=()=>{if(!mayLeaveDocument())return;resetDocumentDraft();step=windowStart;prepareMission();mission();tell('Apprends à utiliser les trois boutons de la fenêtre.')};resetSimWindows();
}
