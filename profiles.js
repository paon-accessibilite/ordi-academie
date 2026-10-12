// Connexion pédagogique locale : aucun compte ni mot de passe du véritable OS.
const profilesKey='ordi-academie-profiles-v1';
const profileAvatars=['🦊','🐱','🐼','🐸','🦉','🐬','🦋','🚀'];
let studentProfiles=[],activeProfile=null,selectedProfileId=null,profilesAvailable=true,profilePage=0;
function profileProgressKey(){return activeProfile?'ordi-academie-student-'+activeProfile.id:progressKey}
function validatedProgress(source){
 const records={};if(!source||typeof source!=='object')return records;
 for(const record of Object.values(source)){const id=missions.findIndex(m=>m[0]===record?.title);if(id>=0&&Number.isFinite(Date.parse(record.date))&&Number.isInteger(record.help)&&record.help>=0&&Number.isInteger(record.attempts)&&record.attempts>=0)records[id]={title:record.title,date:record.date,help:record.help,attempts:record.attempts}}
 return records;
}
function writeProfiles(){try{window.localStorage.setItem(profilesKey,JSON.stringify(studentProfiles))}catch{profilesAvailable=false}renderProfileStorage()}
function renderProfileStorage(){$('profileStorage').textContent=profilesAvailable?'Tes profils et tes réussites sont gardés sur cet ordinateur, dans ce navigateur.':'La sauvegarde est indisponible : les profils restent disponibles pendant cette visite.'}
function readProfileProgress(profile){
 try{const stored=JSON.parse(window.localStorage.getItem('ordi-academie-student-'+profile.id)||'null');return validatedProgress([...Object.values(stored&&typeof stored==='object'?stored:{}),...Object.values(profile.records&&typeof profile.records==='object'?profile.records:{})])}catch{profilesAvailable=false;return validatedProgress(profile.records)}
}
function renderProfiles(){
 $('profileList').replaceChildren();
 for(const profile of studentProfiles.slice(profilePage*4,profilePage*4+4)){const button=document.createElement('button');button.type='button';button.className='login-profile'+(profile.id===selectedProfileId?' chosen':'');button.setAttribute('aria-pressed',String(profile.id===selectedProfileId));
 const avatar=document.createElement('span');avatar.className='profile-avatar';avatar.textContent=profile.avatar;
 const name=document.createElement('strong');name.textContent=profile.name;
 const detail=document.createElement('small');const count=Object.keys(readProfileProgress(profile)).length;detail.textContent=count?count+' / '+missions.length+' missions réussies':'Un nouveau bureau à explorer';button.append(avatar,name,detail);button.onclick=()=>{selectedProfileId=profile.id;renderProfiles();$('connectProfile').focus()};$('profileList').append(button)}
 $('profilePages').hidden=studentProfiles.length<=4;$('previousProfiles').disabled=profilePage===0;$('followingProfiles').disabled=(profilePage+1)*4>=studentProfiles.length;$('profilePageInfo').textContent='Page '+(profilePage+1)+' / '+Math.max(1,Math.ceil(studentProfiles.length/4));
 $('connectProfile').disabled=!studentProfiles.some(p=>p.id===selectedProfileId);$('profileEmpty').hidden=studentProfiles.length>0;renderProfileStorage();
}
function profileSnapshot(){return {mission:missions[step][0],completed,entries:JSON.parse(JSON.stringify(entries)),currentFolder,selected,serial,clipboard:clipboard?JSON.parse(JSON.stringify(clipboard)):null,draft:{...documentDraft},documentClosed,textTools:{clipboard:textClipboard,evidence:[...textEvidence],history:textHistory.slice(-100),selection:textSelection()},windows:Object.fromEntries(Object.entries(simWindows).map(([kind,state])=>[kind,{open:state.open,max:state.max,minimized:$(state.panel).hidden}]))}}
function saveActiveProfile(){
 if(!activeProfile)return;activeProfile.records=validatedProgress(progressRecords);activeProfile.session=profileSnapshot();
 try{window.localStorage.setItem(profileProgressKey(),JSON.stringify(activeProfile.records))}catch{profilesAvailable=false;progressAvailable=false}
 writeProfiles();
}
function validSession(session){
 if(!session||!missions.some(m=>m[0]===session.mission)||!Array.isArray(session.entries))return false;
 const ids=new Set();for(const e of session.entries){if(!e||typeof e.id!=='string'||ids.has(e.id)||['root','trash'].includes(e.id)||typeof e.name!=='string'||!['folder','text','image'].includes(e.type)||typeof e.parent!=='string'||e.content!==undefined&&typeof e.content!=='string')return false;ids.add(e.id)}
 for(const e of session.entries){let parent=e.parent;const seen=new Set([e.id]);while(!['root','trash'].includes(parent)){const folder=session.entries.find(x=>x.id===parent);if(!folder||folder.type!=='folder'||seen.has(parent))return false;seen.add(parent);parent=folder.parent}}
 return true;
}
function connectProfile(id){
 const profile=studentProfiles.find(p=>p.id===id);if(!profile)return;
 activeProfile=profile;resetDocumentDraft();$('reset').onclick();progressRecords=readProfileProgress(profile);progressAvailable=profilesAvailable;
 lastOpenedEntry=null;documentClosed=false;pathChoice='';
 for(const key of Object.keys(progressRecords))passedSteps.add(Number(key));
 const session=profile.session;
 if(validSession(session)){
   step=missions.findIndex(m=>m[0]===session.mission);entries=JSON.parse(JSON.stringify(session.entries));currentFolder=['root','trash'].includes(session.currentFolder)||entries.some(e=>e.id===session.currentFolder&&e.type==='folder')?session.currentFolder:'root';selected=entries.some(e=>e.id===session.selected)?session.selected:null;serial=Number.isInteger(session.serial)&&session.serial>=0?session.serial:0;
   clipboard=null; // Une nouvelle connexion repart sans opération de copie en attente.
   if(session.draft&&typeof session.draft.name==='string'&&typeof session.draft.content==='string')documentDraft={id:entries.some(e=>e.id===session.draft.id)?session.draft.id:null,name:session.draft.name,content:session.draft.content,dirty:!!session.draft.dirty,created:!!session.draft.created};
   mission();renderFiles();renderDocument();documentClosed=!!session.documentClosed;
   const tools=session.textTools;if(tools&&typeof tools.clipboard==='string'){textClipboard=tools.clipboard;textEvidence=new Set(Array.isArray(tools.evidence)?tools.evidence.filter(e=>typeof e==='string'):[]);textHistory=Array.isArray(tools.history)?tools.history.filter(h=>h&&typeof h.value==='string'&&Number.isInteger(h.start)&&Number.isInteger(h.end)&&h.start>=0&&h.end>=h.start&&h.end<=h.value.length).slice(-100):[];updateTextClipboard();const selection=tools.selection;if(selection&&Number.isInteger(selection.start)&&Number.isInteger(selection.end))$('docText').setSelectionRange(Math.max(0,Math.min(selection.start,documentDraft.content.length)),Math.max(0,Math.min(selection.end,documentDraft.content.length)))}
   for(const e of Object.entries(simWindows))hideSimWindow(e[0]);
   for(const kind of ['files','editor']){const state=session.windows?.[kind];if(state?.open){showSimWindow(kind);simWindows[kind].max=!!state.max;syncSimWindow(kind);if(state.minimized)$(simWindows[kind].panel).hidden=true}}
   const visible=['editor','files'].find(kind=>simWindows[kind].open&&!$(simWindows[kind].panel).hidden);if(visible)focusSimWindow(visible);else activeSimWindow=null;
   if(session.completed&&progressRecords[step]){completed=true;$('next').hidden=false;$('next').textContent=step===missions.length-1?'Terminer mon parcours ✨':'Mission suivante →';if(isMouseMission())renderMouseTarget()}
 }
 $('currentStudent').textContent=profile.avatar+' '+profile.name;$('badgeOwner').textContent='Carnet de '+profile.name;
 $('loginScreen').hidden=true;$('sessionShell').hidden=false;$('badgePanel').hidden=true;renderBadges();tell('Bienvenue '+profile.name+' ! Ton bureau est prêt.');$('logoutProfile').focus();
}
function disconnectProfile(){
 stopSpeech();closeContextMenu();saveActiveProfile();for(const id of ['dialog','docDialog','filePreview'])if($(id).open)$(id).close();
 resetDocumentDraft();resetSimWindows();activeProfile=null;progressRecords={};passedSteps.clear();lessonStats.clear();selectedProfileId=null;$('sessionShell').hidden=true;$('loginScreen').hidden=false;renderProfiles();$('addProfile').focus();
}
function initializeProfiles(){
 try{const loaded=JSON.parse(window.localStorage.getItem(profilesKey)||'[]');if(Array.isArray(loaded)){const ids=new Set();studentProfiles=loaded.filter(p=>p&&typeof p.id==='string'&&!ids.has(p.id)&&typeof p.name==='string'&&p.name.trim()&&p.name.length<=32&&profileAvatars.includes(p.avatar)&&(ids.add(p.id),true));}}catch{profilesAvailable=false}
 // L’ancien carnet partagé reste distinct des nouveaux élèves.
 if(Object.keys(progressRecords).length&&!studentProfiles.some(p=>p.id==='legacy')){studentProfiles.push({id:'legacy',name:'Ancien carnet',avatar:'🦉',records:validatedProgress(progressRecords)});writeProfiles()}
 const avatars=$('profileAvatar');avatars.replaceChildren();profileAvatars.forEach(avatar=>{const option=document.createElement('option');option.value=avatar;option.textContent=avatar;avatars.append(option)});avatars.value=profileAvatars[0];
 $('addProfile').onclick=()=>{$('profileError').textContent='';$('profileName').value='';$('profileDialog').showModal();$('profileName').focus()};$('cancelProfile').onclick=()=>{$('profileDialog').close()};
 $('profileForm').onsubmit=event=>{event.preventDefault();const name=$('profileName').value.trim().normalize('NFC').replace(/\s+/g,' ');if(!name||name.length>32){$('profileError').textContent='Écris un prénom ou un pseudo (32 caractères maximum).';return}if(studentProfiles.some(p=>sameName(p.name,name))){$('profileError').textContent='Ce nom existe déjà. Ajoute par exemple une initiale pour distinguer les élèves.';return}
   const avatar=profileAvatars.includes($('profileAvatar').value)?$('profileAvatar').value:profileAvatars[0];let id;do{id='student-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9)}while(studentProfiles.some(p=>p.id===id));studentProfiles.push({id,name,avatar,records:{}});selectedProfileId=id;profilePage=Math.floor((studentProfiles.length-1)/4);writeProfiles();renderProfiles();$('profileDialog').close();$('connectProfile').focus();
 };
 $('previousProfiles').onclick=()=>{profilePage=Math.max(0,profilePage-1);renderProfiles()};$('followingProfiles').onclick=()=>{profilePage=Math.min(Math.max(0,Math.ceil(studentProfiles.length/4)-1),profilePage+1);renderProfiles()};
 $('connectProfile').onclick=()=>connectProfile(selectedProfileId);$('logoutProfile').onclick=disconnectProfile;
 window.addEventListener('pagehide',saveActiveProfile);$('sessionShell').hidden=true;$('loginScreen').hidden=false;renderProfiles();
}

