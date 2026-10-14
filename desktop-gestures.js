// Gestes locaux au bureau simulé, sans glisser-déposer natif du navigateur.
function enableFilePointerDrag(button,id){
 button.draggable=false;button.ondragstart=event=>event.preventDefault();
 let pointer=null,start=null,ghost=null,ignoreClick=false;
 const suppressClick=event=>{if(ignoreClick){event.preventDefault();event.stopImmediatePropagation()}};
 button.addEventListener('click',suppressClick,true);button.addEventListener('dblclick',suppressClick,true);
 const clear=()=>{ghost?.remove();ghost=null;pointer=null;start=null};
 button.onpointerdown=event=>{
  if(event.button!==0||currentFolder==='trash')return;
  ignoreClick=false;button.onclick();focusSimWindow('files');pointer=event.pointerId;start={x:event.clientX,y:event.clientY};button.setPointerCapture(pointer);
 };
 button.onpointermove=event=>{
  if(event.pointerId!==pointer||Math.hypot(event.clientX-start.x,event.clientY-start.y)<6&&!ghost)return;
  event.preventDefault();if(!ghost){ghost=button.cloneNode(true);ghost.className='file file-drag-ghost';ghost.removeAttribute('id');ghost.setAttribute('aria-hidden','true');document.body.append(ghost)}
  ghost.style.left=event.clientX+12+'px';ghost.style.top=event.clientY+12+'px';
 };
 button.onpointerup=event=>{
  if(event.pointerId!==pointer)return;const dragged=!!ghost;
  const folder=dragged?document.elementsFromPoint(event.clientX,event.clientY).map(el=>el.closest?.('.file')).find(el=>entries.some(e=>e.id===el?.dataset.entryId&&e.type==='folder')):null;
  ignoreClick=dragged;clear();button.releasePointerCapture(event.pointerId);
  if(dragged){event.preventDefault();if(folder)moveFile(id,folder.dataset.entryId);else tell('Dépose cet élément sur un dossier. Il reste à sa place.')}
 };
 button.onpointercancel=clear;button.onlostpointercapture=clear;
}
function desktopBounds(){const el=$('desktop');return {width:el.clientWidth||el.offsetWidth,height:(el.clientHeight||el.offsetHeight)-44}}
function windowRect(kind){const area=$('desktop').getBoundingClientRect(),rect=$(simWindows[kind].panel).getBoundingClientRect();return {x:rect.left-area.left,y:rect.top-area.top,w:rect.width,h:rect.height}}
function constrainWindow(kind,rect){
 const area=desktopBounds(),w=Math.max(Math.min(kind==='editor'?380:340,area.width),Math.min(area.width,rect.w)),h=Math.max(Math.min(kind==='editor'?360:280,area.height),Math.min(area.height,rect.h));
 return {x:Math.max(0,Math.min(area.width-w,rect.x)),y:Math.max(0,Math.min(area.height-h,rect.y)),w,h};
}
function setWindowRect(kind,rect){simWindows[kind].rect=constrainWindow(kind,rect);syncSimWindow(kind)}
function snapWindow(kind,side,validate=true){
 const state=simWindows[kind],area=desktopBounds();if(!state.snap&&!state.max)state.restoreRect=state.rect||windowRect(kind);
 state.max=false;state.snap=side;state.rect={x:side==='left'?0:area.width/2,y:0,w:area.width/2,h:area.height};syncSimWindow(kind);if(validate)checkWindowGeometry(kind,'snap');
}
function checkWindowGeometry(kind,gesture,before){
 if(!isWindowMission())return;const n=step-windowStart,rect=simWindows[kind].rect;
 if(kind==='files'&&gesture==='resize'&&before&&rect&&(n===4&&Math.abs(rect.w-before.w)>=40||n===5&&Math.abs(rect.w-before.w)>=30&&Math.abs(rect.h-before.h)>=30))success();
 if(kind==='files'&&gesture==='snap'&&(n===6&&simWindows.files.snap==='left'||n===7&&simWindows.files.snap==='right'))success();
 if(kind==='files'&&gesture==='move'&&n===8&&before===true&&!simWindows.files.snap&&!simWindows.files.max)success();
 if(n===9&&simWindows.files.open&&simWindows.editor.open&&!$('window').hidden&&!$('editorPanel').hidden&&simWindows.files.snap&&simWindows.editor.snap&&simWindows.files.snap!==simWindows.editor.snap)success();
}
function enableWindowGesture(kind,handle,edge=null){
 let pointer=null,initial=null,start=null,moved=false,wasDocked=false,backup=null;
 handle.onpointerdown=event=>{
  if(event.button!==0||event.target.closest?.('button:not(.resize-handle),input,select'))return;
  const state=simWindows[kind];if(edge&&state.max)return;event.preventDefault();focusSimWindow(kind);
  pointer=event.pointerId;initial=windowRect(kind);backup={rect:state.rect,max:state.max,snap:state.snap,restoreRect:state.restoreRect};start={x:event.clientX,y:event.clientY};moved=false;wasDocked=!!(state.snap||state.max);handle.setPointerCapture(pointer);
 };
 handle.onpointermove=event=>{
  if(event.pointerId!==pointer)return;event.preventDefault();const dx=event.clientX-start.x,dy=event.clientY-start.y;
  if(!moved&&Math.hypot(dx,dy)<5)return;
  const state=simWindows[kind];
  if(!moved&&wasDocked&&!edge){const area=$('desktop').getBoundingClientRect(),saved=state.restoreRect||{x:100,y:40,w:600,h:380};state.snap=null;state.max=false;
   initial=constrainWindow(kind,{...saved,x:event.clientX-area.left-saved.w/2,y:event.clientY-area.top-16});start={x:event.clientX,y:event.clientY};
  }
  moved=true;state.snap=null;state.max=false;
  if(!edge)setWindowRect(kind,{...initial,x:initial.x+event.clientX-start.x,y:initial.y+event.clientY-start.y});
  else{
   const area=desktopBounds(),minW=Math.min(kind==='editor'?380:340,area.width),minH=Math.min(kind==='editor'?360:280,area.height);
   let left=initial.x,top=initial.y,right=initial.x+initial.w,bottom=initial.y+initial.h;
   if(edge.includes('w'))left=Math.max(0,Math.min(right-minW,left+dx));if(edge.includes('n'))top=Math.max(0,Math.min(bottom-minH,top+dy));
   if(edge.includes('e'))right=Math.min(area.width,Math.max(left+minW,right+dx));if(edge.includes('s'))bottom=Math.min(area.height,Math.max(top+minH,bottom+dy));
   setWindowRect(kind,{x:left,y:top,w:right-left,h:bottom-top});
  }
 };
 handle.onpointerup=event=>{
  if(event.pointerId!==pointer)return;pointer=null;handle.releasePointerCapture(event.pointerId);if(!moved)return;
  if(edge){checkWindowGeometry(kind,'resize',initial);return}
  const area=$('desktop').getBoundingClientRect(),x=event.clientX-area.left;
  if(x<=28)snapWindow(kind,'left');else if(x>=area.width-28)snapWindow(kind,'right');else checkWindowGeometry(kind,'move',wasDocked);
 };
 const cancel=()=>{pointer=null;if(moved&&backup){Object.assign(simWindows[kind],backup);syncSimWindow(kind)}};handle.onpointercancel=cancel;handle.onlostpointercapture=()=>{if(pointer!==null)cancel()};
}
function initializeDesktopGestures(){
 for(const kind of ['files','editor']){
  const panel=$(simWindows[kind].panel),title=panel.querySelector?.(kind==='files'?'.titlebar':'.tada-heading');if(title)enableWindowGesture(kind,title);
  for(const edge of ['n','s','e','w','ne','nw','se','sw']){
   const handle=document.createElement('button');handle.type='button';handle.className='resize-handle resize-'+edge;handle.setAttribute('aria-label','Redimensionner la fenêtre : '+({n:'haut',s:'bas',e:'droite',w:'gauche',ne:'coin supérieur droit',nw:'coin supérieur gauche',se:'coin inférieur droit',sw:'coin inférieur gauche'}[edge]));
   handle.onkeydown=event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)||simWindows[kind].max)return;event.preventDefault();const r=windowRect(kind);setWindowRect(kind,{...r,w:r.w+(event.key==='ArrowRight'?20:event.key==='ArrowLeft'?-20:0),h:r.h+(event.key==='ArrowDown'?20:event.key==='ArrowUp'?-20:0)})};
   enableWindowGesture(kind,handle,edge);panel.append(handle);
  }
 }
 window.addEventListener('resize',()=>{for(const kind of ['files','editor']){const state=simWindows[kind];if(state.snap)snapWindow(kind,state.snap,false);else if(state.rect)setWindowRect(kind,state.rect)}});
}
