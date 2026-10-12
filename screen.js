function initializeScreen(){
 let nativeFullscreen=false;
 const nativeInvoke=window.__TAURI__?.core?.invoke;
 const showFullscreen=value=>{for(const id of ['fullscreen','loginFullscreen']){$(id).textContent=value?'⛶ Quitter le plein écran':'⛶ Plein écran';$(id).setAttribute('aria-label',value?'Quitter le plein écran':'Passer en plein écran')}};
 $('previousSteps').onclick=()=>{stepsPage=Math.max(0,stepsPage-1);renderSteps(false)};
 $('followingSteps').onclick=()=>{stepsPage=Math.min(Math.floor((missions.length-1)/5),stepsPage+1);renderSteps(false)};
 $('fullscreen').onclick=$('loginFullscreen').onclick=async()=>{try{if(nativeInvoke){nativeFullscreen=await nativeInvoke('desktop_fullscreen',{enabled:!nativeFullscreen});showFullscreen(nativeFullscreen)}else if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{tell('Le plein écran est indisponible ici. Tu peux utiliser F11 dans ton navigateur.')}};
 document.addEventListener('fullscreenchange',()=>showFullscreen(!!document.fullscreenElement));
 if(nativeInvoke){
  nativeInvoke('desktop_fullscreen',{enabled:null}).then(value=>{nativeFullscreen=value;showFullscreen(value)}).catch(()=>{});
  document.addEventListener('keydown',async event=>{if(event.key!=='Escape'||event.defaultPrevented||!nativeFullscreen||['dialog','docDialog','profileDialog','filePreview'].some(id=>$(id).open))return;event.preventDefault();try{nativeFullscreen=await nativeInvoke('desktop_fullscreen',{enabled:false});showFullscreen(nativeFullscreen)}catch{}});
  // Sauvegarde régulière des profils même si Windows ferme la fenêtre directement.
  window.setInterval(()=>saveActiveProfile(),2000);
 }
}
