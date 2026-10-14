(async()=>{
 const checks=[];const assert=(value,label)=>{if(!value)throw Error(label);checks.push(label)};
 window.__ordiSkipDemos=true;
 const report={version:'0.3.0',ok:false,checks};
 try{
  assert(missions.length===59,'59 missions chargées dans le moteur embarqué');
  assert(!$('loginScreen').hidden&&$('sessionShell').hidden,'Écran de connexion au démarrage');
  const create=name=>{let profile=studentProfiles.find(p=>p.name===name);if(profile)return profile;$('addProfile').onclick();$('profileName').value=name;$('profileAvatar').value='🦊';$('profileForm').onsubmit({preventDefault(){}});return studentProfiles.find(p=>p.name===name)};
  const first=create('Test bureau A'),second=create('Test bureau B');
  connectProfile(first.id);report.existingSuccesses=Object.keys(progressRecords).length;
  // Le brouillon du précédent test est volontairement abandonné dans ce profil isolé.
  documentDraft.dirty=false;
  $('startFileClipboard').onclick();selected='clip-poster';copySelected();assert(completed,'Copie de fichier');
  $('next').onclick();selected='clip-poster';copySelected();openFolder('clip-class');pasteClipboard();assert(completed,'Collage conserve l’original');
  $('next').onclick();selected='clip-story';cutSelected();openFolder('clip-class');pasteClipboard();assert(completed&&clipboard===null,'Couper-coller du fichier');
  $('startWriting').onclick();$('docText').value='le chat dort';$('docText').oninput({});$('docCheck').onclick();assert(completed,'Saisie et validation dans TAda');
  const before=Object.keys(progressRecords).length;disconnectProfile();connectProfile(second.id);assert(Object.keys(progressRecords).length===0,'Profils Windows séparés');disconnectProfile();connectProfile(first.id);assert(Object.keys(progressRecords).length===before&&$('docText').value==='le chat dort','Bureau et brouillon restaurés');
  const desktop=$('desktop').getBoundingClientRect();assert(desktop.width/innerWidth>.7&&desktop.height/innerHeight>.7,'Affichage 720p');
  assert(document.documentElement.scrollHeight<=innerHeight&&$('editorPanel').scrollHeight===$('editorPanel').clientHeight,'Aucun défilement du parcours');
  assert(typeof window.__TAURI__.core.invoke==='function','Interface native disponible');
  const savedCount=Object.keys(progressRecords).length;
  for(let i=0;i<missions.length;i++){
    documentDraft.dirty=false;replayMission(i);
    assert(!completed,'Mission rejouable : '+missions[i][0]);
    for(const e of entries.filter(e=>e.type==='folder'))folderPath(e.id);
    const lesson=document.querySelector('.lesson-panel').getBoundingClientRect();
    const instruction=$('instruction').getBoundingClientRect(),actions=document.querySelector('.lesson-actions').getBoundingClientRect();
    assert(instruction.bottom<=actions.top+1&&actions.bottom<=lesson.bottom+1,'Consigne et validation visibles : '+missions[i][0]);
    const aside=document.querySelector('aside');assert(aside.scrollHeight<=aside.clientHeight+1,'Parcours sans défilement : '+missions[i][0]);
  }
  assert(Object.keys(progressRecords).length===savedCount,'Rejouer conserve les acquis');
  for(const badge of badgeDefinitions()){
    documentDraft.dirty=false;replayMission(badge.steps[0]);openDemo('badge');
    const panel=$('tutorialPanel').getBoundingClientRect(),area=$('desktop').getBoundingClientRect();
    assert(panel.left>=area.left&&panel.right<=area.right&&panel.bottom<=area.bottom,'Présentation dans le PC : '+badge.name);
    assert($('tutorialPanel').scrollHeight<=$('tutorialPanel').clientHeight+1,'Présentation sans défilement : '+badge.name);
    for(let i=0;i<demo.scenes.length;i++){demo.index=i;renderDemoFrame();const caption=$('tutorialCaption').getBoundingClientRect(),controls=document.querySelector('.tutorial-controls').getBoundingClientRect();assert(caption.bottom<=controls.top+1&&controls.bottom<=panel.bottom,'Sous-titres visibles : '+badge.name+' '+i)}
    finishDemo(false);
  }
  replayMission(basicStep(2));const beforeDemo=JSON.stringify(entries);openDemo('folder');demo.voice=false;await playDemoFrame();assert(demo.playing,'Démonstration locale démarrée');finishDemo(false);assert(!demo&&JSON.stringify(entries)===beforeDemo,'Démonstration arrêtée sans modifier les fichiers');
  replayMission(organizerSelectionStart+1);selectFile('multi-chat');selectFile('multi-fox',{ctrlKey:true});selectFile('multi-notes',{ctrlKey:true});assert(selectionIds().length===3,'Ctrl sélectionne trois éléments');moveSelection('multi-album');assert(completed,'Déplacement de groupe validé');
  replayMission(mouseStart+5);const area=$('files').getBoundingClientRect(),cards=Array.from($('files').children).map(el=>el.getBoundingClientRect());
  const left=Math.min(...cards.map(r=>r.left))-3,top=Math.min(...cards.map(r=>r.top))-3,right=Math.max(...cards.map(r=>r.right))+3,bottom=Math.max(...cards.map(r=>r.bottom))+3;
  $('files').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0,pointerId:22,clientX:left,clientY:top}));
  $('files').dispatchEvent(new PointerEvent('pointermove',{bubbles:true,button:0,pointerId:22,clientX:right,clientY:bottom}));
  $('files').dispatchEvent(new PointerEvent('pointerup',{bubbles:true,button:0,pointerId:22,clientX:right,clientY:bottom}));
  assert(selectionIds().length===3&&completed,'Rectangle de sélection dans le moteur Windows');

  documentDraft.dirty=false;replayMission(basicStep(4));
  assert(typeof document.querySelector('.file[data-entry-id="photo"]').onpointerdown==='function','Glissement de fichier relié au pointeur');
  replayMission(windowStart+9);snapWindow('files','left');snapWindow('editor','right');
  assert(completed&&simWindows.files.rect.w+simWindows.editor.rect.w===$('desktop').clientWidth,'Deux fenêtres sur les deux moitiés du bureau');
  assert(document.querySelectorAll('.resize-handle').length===16,'Huit poignées sur chaque fenêtre');
  assert(typeof document.querySelector('.titlebar').onpointerdown==='function'&&typeof document.querySelector('.tada-heading').onpointerdown==='function','Barres de titre déplaçables');
  assert($('editorPanel').scrollHeight===$('editorPanel').clientHeight,'TAda tient en demi-écran');
  documentDraft.dirty=false;replayMission(basicStep(2));
  if($('badgeCelebration').open)$('badgeCelebration').close();
  const rightClick=async target=>{
    await new Promise(resolve=>setTimeout(resolve,150));
    const rect=target.getBoundingClientRect();
    const point={x:Math.round(rect.left+rect.width/2),y:Math.round(rect.top+rect.height/2)};
    const hitBefore=document.elementFromPoint(point.x,point.y);
    const clickTrace={point,target:target.id||target.className,hit:hitBefore?.id||hitBefore?.className,events:[]};
    (report.rightClicks??=[]).push(clickTrace);
    const trace=event=>clickTrace.events.push({type:event.type,button:event.button,target:event.target.id||event.target.className,hidden:contextMenu.hidden});
    for(const name of ['pointerdown','pointerup','contextmenu','scroll'])document.addEventListener(name,trace,true);
    const native=await window.__TAURI__.core.invoke('desktop_smoke_right_click',{x:Math.round(rect.left+rect.width/2),y:Math.round(rect.top+rect.height/2)});
    if(!native)target.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2,clientX:rect.left+10,clientY:rect.top+10}));
    await new Promise(resolve=>setTimeout(resolve,150));
    for(const name of ['pointerdown','pointerup','contextmenu','scroll'])document.removeEventListener(name,trace,true);
    assert(!contextMenu.hidden,'Clic droit : menu visible après le relâchement');
    const item=contextMenu.children[0],hit=item.getBoundingClientRect();
    assert(contextMenu.contains(document.elementFromPoint(hit.left+hit.width/2,hit.top+hit.height/2)),'Menu au-dessus de la fenêtre et accessible au clic');
    return native;
  };
  const chooseMenuItem=async()=>{
    const item=contextMenu.children[0],rect=item.getBoundingClientRect();
    const native=await window.__TAURI__.core.invoke('desktop_smoke_right_click',{x:Math.round(rect.left+rect.width/2),y:Math.round(rect.top+rect.height/2),button:1});
    if(!native)item.click();
    await new Promise(resolve=>setTimeout(resolve,150));
  };
  // Un espace vide de la grille, en dehors des icônes.
  const grid=$('files').getBoundingClientRect();
  const blankPoint={getBoundingClientRect(){return {left:grid.right-28,top:grid.bottom-28,width:4,height:4}},dispatchEvent:event=>$('files').dispatchEvent(event)};
  report.nativeRightClick=await rightClick(blankPoint);
  assert(contextMenu.children[0].textContent==='Nouveau dossier','Clic droit dans Organisateur : Nouveau dossier');
  await chooseMenuItem();assert($('dialog').open,'Clic droit ouvre la création de dossier');$('dialog').close();
  replayMission(basicStep(3));await rightClick(document.querySelector('.file[data-entry-id="photo"]'));
  assert(selected==='photo'&&contextMenu.children[0].textContent==='Renommer','Clic droit sur le fichier : Renommer');
  await chooseMenuItem();assert($('dialog').open,'Clic droit ouvre le renommage');$('dialog').close();
  documentDraft.dirty=false;replayMission(basicStep(2));showDialog('create');$('name').value='Animaux';$('form').onsubmit({preventDefault(){}});
  tell('Après la réussite');assert($('feedback').textContent.includes('Mission réussie'),'Réussite reste affichée');
  celebrateBadge('Premier bureau');assert($('badgeCelebration').open&&$('celebrationSkills').textContent.includes('sous-dossier'),'Félicitations avec compétences');
  $('collectBadge').onclick();assert(!$('badgeCelebration').open,'Collecte du badge');
  assert(await window.__TAURI__.core.invoke('desktop_fullscreen',{enabled:null})===false,'Commande plein écran native');
  report.voices=window.speechSynthesis?.getVoices().map(v=>({lang:v.lang,local:v.localService}))||[];
  const wav=await window.__TAURI__.core.invoke('desktop_speech',{text:'Bienvenue dans Ordi Académie. Crée un dossier.'});
  if(wav){
    assert(wav.length>1000&&String.fromCharCode(...wav.slice(0,4))==='RIFF','Voix française embarquée : audio généré');report.audioBytes=wav.length;
    await readAloud('Bonjour.',$('readInstruction'));
    assert(nativeSpeechAudio&&!nativeSpeechAudio.paused,'Bouton haut-parleur : lecture audio démarrée');
    stopSpeech();assert(nativeSpeechAudio===null,'Bouton haut-parleur : arrêt audio');
  }
  report.geometry={width:innerWidth,height:innerHeight,desktopWidth:desktop.width,desktopHeight:desktop.height};
  disconnectProfile();
  const disposable=create('Test suppression 0.2');showProfileMenu({clientX:100,clientY:100,preventDefault(){},stopPropagation(){}},disposable);profileMenu.children[0].onclick();
  submitProfileDeletion();assert(pendingProfileDeletion.stage===1&&studentProfiles.some(p=>p.id===disposable.id),'Première confirmation ne supprime pas');
  $('deleteProfileName').value=disposable.name;submitProfileDeletion();assert(pendingProfileDeletion.stage===2&&studentProfiles.some(p=>p.id===disposable.id),'Nom confirmé : dernière étape encore nécessaire');
  submitProfileDeletion();assert(!studentProfiles.some(p=>p.id===disposable.id)&&studentProfiles.some(p=>p.id===first.id)&&studentProfiles.some(p=>p.id===second.id),'Suppression confirmée du seul profil de test');
  const intro=create('Test présentations 0.3');intro.introductionsShown=[];
  window.__ordiSkipDemos=false;connectProfile(intro.id);
  assert(demo?.kind==='badge'&&!$('tutorialPanel').hidden,'Présentation proposée au début du premier badge');
  finishDemo();assert(intro.introductionsShown.includes('Souris agile'),'Présentation mémorisée pour ce profil');
  disconnectProfile();connectProfile(intro.id);assert(!demo,'Présentation déjà vue : reprise directe des missions');
  window.__ordiSkipDemos=true;disconnectProfile();
  showProfileMenu({clientX:100,clientY:100,preventDefault(){},stopPropagation(){}},intro);profileMenu.children[0].onclick();submitProfileDeletion();$('deleteProfileName').value=intro.name;submitProfileDeletion();submitProfileDeletion();
  assert(!studentProfiles.some(p=>p.id===intro.id)&&studentProfiles.some(p=>p.id===first.id),'Seul le profil de présentation de test est retiré');
  report.ok=true;
 }catch(error){report.error=String(error.stack||error)}
 await window.__TAURI__.core.invoke('desktop_smoke_report',{report});
})()
