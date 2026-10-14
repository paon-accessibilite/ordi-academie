(async()=>{
 const checks=[];const assert=(value,label)=>{if(!value)throw Error(label);checks.push(label)};
 const report={version:'0.2.0',ok:false,checks};
 try{
  assert(missions.length===49,'49 missions chargées dans le moteur embarqué');
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
  disconnectProfile();report.ok=true;
 }catch(error){report.error=String(error.stack||error)}
 await window.__TAURI__.core.invoke('desktop_smoke_report',{report});
})()
