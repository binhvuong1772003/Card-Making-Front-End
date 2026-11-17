() => {
 const fields=['alignItems','animation','backgroundBlendMode','backgroundColor','backgroundImage','backgroundPosition','backgroundSize','backgroundRepeat','border','borderBottomWidth','borderColor','borderImageRepeat','borderImageSlice','borderImageSource','borderImageWidth','borderLeftWidth','borderRadius','borderRightWidth','borderTopWidth','boxShadow','boxSizing','clipPath','color','display','filter','fontFamily','fontSize','fontStyle','fontWeight','gap','justifyContent','letterSpacing','lineHeight','margin','maskImage','maskPosition','maskSize','mixBlendMode','objectFit','objectPosition','opacity','overflow','overflowX','overflowY','padding','position','rotate','scale','textAlign','textTransform','transform','transformOrigin','translate','visibility','whiteSpace','wordSpacing','zIndex'];
 const xp=e=>e?xp(e.parentElement)+'/'+e.tagName.toLowerCase()+'['+(Array.from(e.parentElement?.children||[e]).filter(x=>x.tagName===e.tagName).indexOf(e)+1)+']':'';
 const css=c=>Object.fromEntries(fields.map(k=>[k,c[k]]));let elements=[];
 for(const e of [document.querySelector('main'),...document.querySelectorAll('main *')]){
  if(!e||e.closest('dialog,[role=dialog],defs')||['script','style','path','rect','g','image','stop','lineargradient','radialgradient','filter','title'].includes(e.tagName.toLowerCase()))continue;
  let c=getComputedStyle(e),r=e.getBoundingClientRect();if(c.display==='none'||(!r.width&&!r.height))continue;
  if(e.tagName==='IMG'&&/qr-png|qr-code|vietqr/i.test(e.src))continue;
  let pseudo={};for(let p of ['::before','::after']){let pc=getComputedStyle(e,p);if(pc.content!=='none'&&pc.content!=='normal')pseudo[p]={...css(pc),content:pc.content,width:pc.width,height:pc.height,top:pc.top,left:pc.left,bottom:pc.bottom,right:pc.right};}
  let row={xpath:xp(e),parent:xp(e.parentElement),tag:e.tagName.toLowerCase(),attrs:Object.fromEntries(Array.from(e.attributes).filter(a=>a.name!=='srcset').map(a=>[a.name,a.value])),text:Array.from(e.childNodes).filter(n=>n.nodeType===3).map(n=>n.textContent).join(''),rect:[r.x+scrollX,r.y+scrollY,r.width,r.height],layout:[e.offsetLeft||0,e.offsetTop||0,e.offsetWidth||0,e.offsetHeight||0],css:css(c),pseudo};
  if(e.tagName==='IFRAME'&&row.attrs.src){try{let u=new URL(row.attrs.src,location.origin);u.searchParams.delete('key');row.attrs.src=u.href;}catch{}}
  if(e.tagName==='IMG')row.image={src:e.currentSrc||e.src,natural:[e.naturalWidth,e.naturalHeight],complete:e.complete};if(e.tagName.toLowerCase()==='svg')row.svg=e.outerHTML;elements.push(row);
 }
 let rules=[];for(let s of document.styleSheets)try{rules.push(...Array.from(s.cssRules).filter(r=>[5,7].includes(r.type)).map(r=>r.cssText))}catch{}
 return {url:location.href,capturedAt:new Date().toISOString(),viewport:[innerWidth,innerHeight],scroll:[scrollX,scrollY],documentSize:[document.documentElement.scrollWidth,document.documentElement.scrollHeight],elements,fontFacesAndKeyframes:rules};
}
