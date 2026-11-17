import fs from 'node:fs';
import sharp from 'sharp';
const templates=JSON.parse(fs.readFileSync('docs/references/clone-handoffs/fifth-ten-manifest.json')).templates;
for(const t of templates){
 const base=`docs/references/${t.slug}`;const doc=JSON.parse(fs.readFileSync(`${base}/source-20261117.json`));const assets=JSON.parse(fs.readFileSync(`${base}/assets.json`)).assets;const out=[];
 const es=doc.desktop.elements;
 for(const [i,e] of es.entries()){
  const css=e.css;const match=css.backgroundImage.match(/url\("?([^"\)]+)/);if(!match)continue;
  const url=match[1];let href=url;let iw=314.254,ih=53.2163;
  if(!url.startsWith('data:')){const a=assets.find(a=>a.source===url);if(!a)throw Error(`missing background ${url}`);const bytes=fs.readFileSync('public'+a.local);const meta=await sharp(bytes).metadata();iw=meta.width;ih=meta.height;href=`data:image/${a.local.endsWith('.svg')?'svg+xml':meta.format};base64,${bytes.toString('base64')}`;}
  const w=e.rect[2],h=e.rect[3];let sw=iw,sh=ih;const size=css.backgroundSize.split(',').at(-1).trim();
  if(size==='cover'||size==='contain'){let scale=(size==='cover'?Math.max:Math.min)(w/iw,h/ih);sw=iw*scale;sh=ih*scale;}
  else {const p=size.split(' ');if(p[0].endsWith('%'))sw=w*parseFloat(p[0])/100;else if(p[0].endsWith('px'))sw=parseFloat(p[0]);if(p[1]?.endsWith('%'))sh=h*parseFloat(p[1])/100;else if(p[1]?.endsWith('px'))sh=parseFloat(p[1]);else sh=sw/iw*ih;}
  const pos=css.backgroundPosition.split(',').at(-1).trim().split(' ');const offset=(p,dim,sdim)=>p?.endsWith('%')?(dim-sdim)*parseFloat(p)/100:parseFloat(p)||0;const x=offset(pos[0],w,sw),y=offset(pos[1],h,sh);
  const underlying=[...es].reverse().find(a=>e.xpath.startsWith(a.xpath+'/')&&a.css.backgroundColor!=='rgba(0, 0, 0, 0)');const multiply=css.mixBlendMode==='multiply';const color=underlying?.css.backgroundColor||'#fff';const opacity=multiply?parseFloat(css.opacity):1;
  let corners='';if(css.backgroundImage.startsWith('radial-gradient'))for(const [cx,cy]of [[0,0],[w,0],[0,h],[w,h]])corners+=`<circle cx="${cx}" cy="${cy}" r="35" fill="rgb(104,14,14)"/>`;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><pattern id="p" x="${x}" y="${y}" width="${sw}" height="${sh}" patternUnits="userSpaceOnUse"><image href="${href.replaceAll('&','&amp;')}" width="${sw}" height="${sh}" preserveAspectRatio="none"/></pattern></defs>${multiply?`<rect width="100%" height="100%" fill="${color}"/>`:''}<rect width="100%" height="100%" opacity="${opacity}" fill="url(#p)" style="mix-blend-mode:${multiply?'multiply':'normal'}"/>${corners}</svg>`;
  const local=`/demo/${t.slug}/source-assets/background-${i}.png`;await sharp(Buffer.from(svg)).png().toFile('public'+local);out.push({xpath:e.xpath,local,bakedOpacity:multiply,source:css.backgroundImage,recipe:{size,position:css.backgroundPosition,mixBlendMode:css.mixBlendMode,opacity:css.opacity}});
 }
 fs.writeFileSync(`${base}/derived-backgrounds.json`,JSON.stringify(out,null,2));console.log(t.slug,out.length);
}
