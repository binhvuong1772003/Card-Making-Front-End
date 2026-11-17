"""Assemble four content drafts from their own measured DOM, never makeDocument.

Run from CMFE. Only local files are written. Source/local visual verification
and catalog publication are separate gates; a successful run is not sign-off.
"""
import hashlib
import json
import math
import re
from pathlib import Path
from datetime import datetime,timedelta
from urllib.parse import parse_qs, urlparse

TEMPLATES = {t['slug']:(t['title'],t['export'],t['prefix']) for t in json.loads(Path('docs/references/clone-handoffs/fourth-ten-manifest.json').read_text())['templates']}
font_rules = {}

def num(value, default=0):
    m=re.match(r'-?[\d.]+(?:e[+-]?\d+)?',str(value),re.I);return float(m.group()) if m else default

def color(s):
    if s.startswith('#'):return s
    if s.startswith('oklch'):
        L,C,H=map(float,re.findall(r'-?[\d.]+',s)[:3]);a=C*math.cos(math.radians(H));b=C*math.sin(math.radians(H))
        l=(L+.3963377774*a+.2158037573*b)**3;m=(L-.1055613458*a-.0638541728*b)**3;ss=(L-.0894841775*a-1.291485548*b)**3
        rgb=[4.0767416621*l-3.3077115913*m+.2309699292*ss,-1.2684380046*l+2.6097574011*m-.3413193965*ss,-.0041960863*l-.7034186147*m+1.707614701*ss]
        return '#'+''.join(f'{round(max(0,min(1,12.92*v if v<=.0031308 else 1.055*max(0,v)**(1/2.4)-.055))*255):02x}' for v in rgb)
    values=re.findall(r'-?[\d.]+',s)
    if s.startswith('rgb') and len(values)>=3:return '#'+''.join(f'{max(0,min(255,round(float(v)))):02x}' for v in values[:3])
    if s.startswith('color(srgb'):return '#'+''.join(f'{max(0,min(255,round(float(v)*255))):02x}' for v in values[:3])
    raise ValueError('Unconverted source color: '+s)

def alpha(s):
    if s.startswith('rgba'):return float(re.findall(r'[\d.]+',s)[3])
    if s.startswith('color(srgb') and '/' in s:return float(s.split('/')[-1].strip(' )'))
    return 1

def matrix(e):
    c=e['css'];s=c['transform'];r=c.get('rotate','none');angle=num(r) if r!='none' else 0
    ca=math.cos(math.radians(angle));sa=math.sin(math.radians(angle));m=[ca,sa,-sa,ca]
    match=re.fullmatch(r'matrix\(([^)]+)\)',s)
    if match:
        a,b,cc,d,*_=map(float,match.group(1).split(','));m=[m[0]*a+m[2]*b,m[1]*a+m[3]*b,m[0]*cc+m[2]*d,m[1]*cc+m[3]*d]
    elif s not in ('none',''):raise ValueError('Non-affine transform outside native Album: '+s)
    return m

for slug,(title,export,prefix) in TEMPLATES.items():
    base=Path('docs/references')/slug
    source=json.loads((base/'source-20261116.json').read_text())
    assert source['desktop']['viewport']==[1440,1000] and source['mobile']['viewport']==[390,844], 'Unverified viewport'
    es=source['desktop']['elements']; ds={e['xpath']:e for e in es};ps={e['xpath']:e for e in source['mobile']['elements']}
    if slug=='long-phung-xanh':
        # Source inserts a third paper ornament only on mobile, shifting later div siblings.
        root=next(e['xpath'] for e in es if 'data-showcase-root' in e['attrs'])
        remapped={}
        for old,e in ps.items():
            match=re.match(re.escape(root)+r'/div\[(\d+)\]',old)
            key=old
            if match and int(match.group(1))>=4:
                key=root+'/div['+str(int(match.group(1))-1)+']'+old[match.end():]
                e=dict(e);e['xpath']=key
                e['parent']=re.sub(re.escape(root)+r'/div\[\d+\]',root+'/div['+str(int(match.group(1))-1)+']',e['parent'],count=1)
            if not (match and int(match.group(1))==3):remapped[key]=e
        ps=remapped
    column=next(e for e in es if 'data-showcase-root' in e['attrs']);cp=ps[column['xpath']]
    origin=column['rect'][:2];phone_origin=cp['rect'][:2]
    manifest=json.loads((base/'assets.json').read_text());extra=json.loads((base/'additional-assets-20261116.json').read_text())
    urls={a['source']:a['local'] for a in manifest['assets']};urls.update({a['url']:a['local'] for a in extra if a['kind']=='image'})
    font_files={a['url']:a['local'] for a in extra if a['kind']=='font'}
    for rule in source['desktop'].get('fontFacesAndKeyframes',[]):
        if not rule.startswith('@font-face'):continue
        family=re.search(r'font-family:\s*([^;]+)',rule).group(1).strip(' "\'')
        match=re.search(r'url\("?([^"\)]+)',rule)
        if not match or family=='ChungDoiIndic':continue
        url=match.group(1);url='https://chungdoi.com'+url if url.startswith('/') else url
        if url not in font_files:continue
        alias='Reference '+family
        font_rules[family]=rule.replace('font-family: '+re.search(r'font-family:\s*([^;]+)',rule).group(1),"font-family: '"+alias+"'").replace(match.group(1),font_files[url])

    def font(stack):
        parts=[p.strip().strip('"\'') for p in stack.split(',') if p.strip()!='ChungDoiIndic']
        return ', '.join("'Reference "+p+"'" if p in font_rules else ("'"+p+"'" if ' ' in p else p) for p in parts)

    stages=[e for e in es if 'touch-pan-y' in e['attrs'].get('class','')]
    stage=stages[0] if stages else None
    if stage:
        gallery_images=[e for e in es if e.get('image') and e['xpath'].startswith(stage['xpath']+'/') and '/photo-library/' in e['image']['src']]
        gallery=ds[stage['parent']]
    else:
        gallery_images=[e for e in es if e.get('image') and re.match(r'^Wedding photo \d+',e['attrs'].get('alt',''))]
        gallery=max((e for e in es if all(i['xpath'].startswith(e['xpath']+'/') for i in gallery_images)),key=lambda e:len(e['xpath']))
    cal_title=next(e for e in es if re.match(r'^(?:Tháng \d+ / \d{4}|(?:January|February|March|April|May|June|July|August|September|October|November|December) \d{4})$',e['text'].strip()))
    calendar=ds[cal_title['parent']]
    map_section=next(e for e in es if e['attrs'].get('data-landing-screenshot-id')=='invite-map')
    map_link=next(e for e in es if e['tag']=='a' and e['xpath'].startswith(map_section['xpath']+'/') and 'maps/dir' in e['attrs'].get('href',''))
    iframe=next(e for e in es if e['tag']=='iframe' and e['xpath'].startswith(map_section['xpath']+'/'))
    rsvp_section=next(e for e in es if e['attrs'].get('data-landing-screenshot-id')=='invite-rsvp')
    rsvp=next(e for e in es if e['tag']=='button' and e['xpath'].startswith(rsvp_section['xpath']+'/'))
    guestbook=next(e for e in es if e['attrs'].get('data-landing-screenshot-id')=='invite-guestbook')
    form=next(e for e in es if e['tag']=='form' and e['xpath'].startswith(guestbook['xpath']+'/'))
    # Source list is the next sibling subtree after its form, not ordinary Text.
    list_root=next(e for e in es if e['parent']==guestbook['xpath'] and e['rect'][1]>form['rect'][1]+form['rect'][3]-1 and e['tag']=='div')
    cal_link=next(e for e in es if e['tag']=='a' and 'calendar/render' in e['attrs'].get('href',''))
    q=parse_qs(urlparse(cal_link['attrs']['href']).query);dates=q['dates'][0];date=dates[:4]+'-'+dates[4:6]+'-'+dates[6:8]
    destination=parse_qs(urlparse(map_link['attrs']['href']).query)['destination'][0]
    swatches=[e for e in es if num(e['css']['borderRadius'])>10000 and e['tag']=='div' and 24<=e['rect'][2]<=88 and 24<=e['rect'][3]<=88 and abs(e['rect'][2]-e['rect'][3])<1 and e['css']['backgroundColor']!='rgba(0, 0, 0, 0)']
    swatch_row=ds[swatches[0]['parent']]
    blocked=[gallery['xpath'],calendar['xpath'],cal_link['xpath'],rsvp['xpath'],iframe['xpath'],map_link['xpath'],form['xpath'],list_root['xpath'],swatch_row['xpath']]
    nodes=[];mapping=[];limitations=[]

    def under(path,parent):return path==parent or path.startswith(parent+'/')

    def geometry(e,phone=False,text=False):
        table=ps if phone else ds;o=phone_origin if phone else origin;r=e['rect'];w,h=r[2:]
        if text:
            if e['css']['display']=='inline':h=max(h,num(e['css']['lineHeight']))
            return [round(r[0]-o[0],4),round(r[1]-o[1]-(h-r[3])/2,4),round(w,4),round(h,4)],0,False
        a,b,c,d=1,0,0,1
        ancestors=[x for x in table.values() if under(e['xpath'],x['xpath']) and under(x['xpath'],column['xpath'])]
        for item in sorted(ancestors,key=lambda x:len(x['xpath'])):
            aa,bb,cc,dd=matrix(item);a,b,c,d=a*aa+c*bb,b*aa+d*bb,a*cc+c*dd,b*cc+d*dd
        sx=math.hypot(a,b);sy=math.hypot(c,d);flip=a*d-b*c<0
        angle=math.degrees(math.atan2(-b,-a) if flip else math.atan2(b,a))
        # CSS width/height retain fractions that offsetWidth rounds away.
        if abs(angle)>0.0001 or abs(sx-1)>0.0001 or abs(sy-1)>0.0001:
            w=e['layout'][2]*sx;h=e['layout'][3]*sy
        return [round(r[0]-o[0]+(r[2]-w)/2,4),round(r[1]-o[1]+(r[3]-h)/2,4),round(w,4),round(h,4)],round(angle,5),flip

    def add(e,kind,props,phone_props=None,styles=None,name=None,text=False):
        p=ps.get(e['xpath'])
        if not p:limitations.append({'xpath':e['xpath'],'issue':'missing mobile node'});return
        r,angle,flip=geometry(e,text=text);pr,pa,pf=geometry(p,True,text)
        if kind in ('Decoration','PhotoFrame') and flip:props['flipX']=True if kind=='Decoration' else props.get('flipX',False)
        node_styles=dict(styles or {})
        ancestors=[a for a in ds.values() if e['xpath'].startswith(a['xpath']+'/') and under(a['xpath'],column['xpath'])]
        inherited_opacity=math.prod(float(a['css']['opacity']) for a in ancestors)
        node_styles['opacity']=round(node_styles.get('opacity',float(e['css']['opacity'])*100)*inherited_opacity,4)
        node={'id':prefix+'-'+str(len(nodes)+1).zfill(3),'type':kind,'name':name or e['text'].strip()[:60] or kind,'rect':r,'phone':pr,'rotation':angle,'phoneRotation':pa,'props':props,'phoneProps':phone_props or {},'styles':node_styles}
        if kind=='PhotoFrame' and flip:node['styles']['flipX']=True;node['props'].pop('flipX',None)
        nodes.append(node);mapping.append({'nodeId':node['id'],'sourceXPath':e['xpath'],'role':kind})
        return node

    def txt(e):
        c=e['css'];value=e['text'];value=value.upper() if c['textTransform']=='uppercase' else value
        return {'text':value,'font':font(c['fontFamily']),'size':min(400,num(c['fontSize'])),'fontWeight':c['fontWeight'],'bold':int(c['fontWeight'])>=600,'italic':c['fontStyle']=='italic','underline':False,'lineHeight':min(400,num(c['lineHeight'])),'letterSpacing':num(c['letterSpacing']),'color':color(c['color']),'align':'center' if c['justifyContent']=='center' else {'start':'left','end':'right'}.get(c['textAlign'],c['textAlign'])}

    background=color(column['css']['backgroundColor']);root_styles={'background':background,'borderWidth':0,'borderRadius':0}
    root_bg=column['css']['backgroundImage']
    if root_bg!='none':
        url=re.search(r'url\("?([^"\)]+)',root_bg).group(1);root_styles.update(backgroundImage=urls[url],backgroundSize='contain',backgroundRepeat='repeat',backgroundPosition='top')
    for e in es:
        path=e['xpath'];c=e['css']
        if e is column or not under(path,column['xpath']) or not ps.get(path) or any(under(path,b) for b in blocked):continue
        if re.search(r'\d+ ngày \d+ giờ',e['text']) or e['text'].strip()=='Đang tính toán...':continue
        if c['backgroundImage']!='none':
            derived=json.loads((base/'derived-backgrounds.json').read_text())
            bg=next((a for a in derived if a['xpath']==path),None)
            if bg:
                add(e,'Decoration',{'src':bg['local'],'alt':'Chất liệu / hoa văn nguồn','fit':'cover','motion':False,'floatMotion':False},styles={'opacity':100 if bg['bakedOpacity'] else round(float(c['opacity'])*100),'borderRadius':min(500,num(c['borderRadius']))},name='Chất liệu / hoa văn nguồn')
            else:limitations.append({'xpath':path,'issue':'background without file URL'})
        if e.get('image'):
            src=e['image']['src']
            if src not in urls:
                if '/giftbox/mini/' in src:
                    limitations.append({'xpath':path,'issue':'Missing source gift miniature (source failed to load): '+src});continue
                raise ValueError(slug+' missing source asset '+src)
            photo='/photo-library/' in src
            props={'src':urls[src],'alt':e['attrs'].get('alt') or src.split('/')[-1]}
            if photo:
                props.update(shape='rectangle',zoom=100,posX=50,posY=50,frameWidth=0,frameColor='#ffffff')
                if slug=='lien-hoa-v2-xanh' and e['rect'][1]<1400:
                    outline=next(x for x in es if x['tag']=='svg' and x['attrs'].get('viewBox')=='0 0 1 1')
                    raw=re.search(r'<path d="([^"]+)"',outline['svg']).group(1)
                    normalized=re.sub(r'(?<![A-Za-z])[-+]?(?:\d*\.)?\d+',lambda m:str(round(float(m.group())*100,4)),raw)
                    props['shape']={'id':'lien-hoa-source','geometry':'rectangle','maskPath':normalized}

            else:props.update(fit=c['objectFit'] if c['objectFit'] in ('cover','contain') else 'contain',motion=False,floatMotion=False)
            add(e,'PhotoFrame' if photo else 'Decoration',props,styles={'opacity':round(float(c['opacity'])*100)},name=('Ảnh '+e['attrs'].get('alt','')) if photo else src.split('/')[-1]);continue
        if e['tag']=='svg':
            if e['attrs'].get('viewBox')=='0 0 1 1':
                svg=e['svg'].replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ',1)
                local=f'/demo/{slug}/source-assets/hero-outline.svg';Path('public'+local).write_text(svg)
                add(e,'Decoration',{'src':local,'alt':'Viền khung nguồn','fit':'cover','motion':False,'floatMotion':False},name='Viền khung ảnh');continue
            if slug=='long-phung-v3-do' and 'hero-clip-v3r' in e.get('svg',''):
                svg=e['svg'];src=re.findall(r'<image href="([^"]+)"',svg)[-1]
                pathdata=re.findall(r'<path d="([^"]+)"',svg)[-1]
                count=[0]
                def norm(m):
                    n=count[0];count[0]+=1;v=float(m.group());return str(round(((v-369.5)*.98091+369.5+7.5)/754*100 if n%2==0 else ((v-553.5)*.98804+553.5)/1099*100,4))
                normalized=re.sub(r'[-+]?(?:\d*\.)?\d+',norm,pathdata)
                add(e,'PhotoFrame',{'src':urls[src],'alt':'Ảnh cưới trong khung nguồn','shape':{'id':'long-phung-v3-source','geometry':'rectangle','maskPath':normalized},'zoom':100,'posX':50,'posY':50,'frameWidth':0,'frameColor':'#ffffff'},name='Ảnh cưới – khung đo từ SVG');continue
            limitations.append({'xpath':path,'issue':'inline SVG not mapped; interactive SVG is covered by native Calendar/Map/Album'});continue
        bg=c['backgroundColor']
        if bg not in ('rgba(0, 0, 0, 0)','transparent') and e['tag'] not in ('button','input','textarea'):
            try:fill=color(bg)
            except ValueError:limitations.append({'xpath':path,'issue':'unsupported source color '+bg});continue
            style={'opacity':round(alpha(bg)*float(c['opacity'])*100),'borderRadius':min(500,num(c['borderRadius']))}
            add(e,'Shape',{'shape':'ellipse' if num(c['borderRadius'])>10000 else 'rectangle','fill':fill},styles=style,name='Nền / đường phân cách')
        if e['text'].strip():
            if num(c['fontSize'])>400:limitations.append({'xpath':path,'issue':'Source font '+c['fontSize']+' exceeds editable Text maximum 400px; clamped and needs native scale control'})
            add(e,'Text',txt(e),txt(ps[path]),text=True)

    # A live countdown is a native block, never a frozen copy of its sampled digits.
    countdown_evidence=[]
    for counter in es:
        match=re.fullmatch(r'(\d+) ngày (\d+) giờ (\d+) phút (\d+) giây',counter['text'].strip())
        if not match:continue
        captured=datetime.fromisoformat(source['desktop']['capturedAt'].replace('Z','+00:00'))
        days,hours,minutes,seconds=map(int,match.groups())
        target=captured+timedelta(days=days,hours=hours,minutes=minutes,seconds=seconds)
        # Source updates once per second. Round the derived instant to its minute,
        # then express it in Vietnam time as the existing Countdown block requires.
        target=(target+timedelta(seconds=30)).replace(second=0,microsecond=0)+timedelta(hours=7)
        c=counter['css']
        props={'date':target.strftime('%Y-%m-%d'),'time':target.strftime('%H:%M'),'showSeconds':True,'dayLabel':'ngày','hourLabel':'giờ','minuteLabel':'phút','secondLabel':'giây','doneText':'Đến ngày vui rồi!','size':max(10,min(96,num(c['fontSize']))),'color':color(c['color']),'font':font(c['fontFamily']),'bold':int(c['fontWeight'])>=600,'align':{'start':'left','end':'right'}.get(c['textAlign'],c['textAlign'])}
        add(counter,'Countdown',props,name='Đếm ngược – mốc đọc từ nguồn')
        countdown_evidence.append({'xpath':counter['xpath'],'sample':counter['text'],'capturedAt':source['desktop']['capturedAt'],'inferredVietnamTarget':target.strftime('%Y-%m-%d %H:%M'),'method':'visible remaining duration + browser capture timestamp, rounded to nearest minute; Vietnam UTC+7'})
    (base/'countdown-evidence.json').write_text(json.dumps(countdown_evidence,ensure_ascii=False,indent=2)+'\n')

    # Native replacements retain source rectangles and use their real props.
    photos=[urls[e['image']['src']] for e in gallery_images]
    gr=gallery['rect'];spread=max(0,(column['rect'][2]-gr[2])/2)
    if stage:
        add(gallery,'Album',{'images':photos,'autoplay':False,'interval':2,'lightbox':True,'radius':16,'dotColor':color(gallery_images[0]['css']['color']),'startAt':1,'spread':round(spread,3)},{'spread':0},name=f'Album {len(photos)} ảnh – thứ tự DOM')
    else:
        add(gallery,'AlbumGrid',{'images':photos,'columns':2,'gap':16,'radius':12,'lightbox':True},name=f'Album lưới {len(photos)} ảnh')
        if slug=='lau-dai-xanh':limitations.append({'xpath':gallery['xpath'],'issue':'Source asymmetric grid has unequal cells; native AlbumGrid uses equal cells'})
    day=next(e for e in es if under(e['xpath'],calendar['xpath']) and e['text'].strip()=='1')
    cal_props={'date':date,'sundayFirst':False,'weekOnly':False,'showTitle':True,'lines':False,'innerFrame':False,'markShape':'Tim đầy','markColor':color(cal_title['css']['color']),'markTextColor':'#ffffff','color':color(day['css']['color']),'weekColor':color(day['css']['color']),'font':font(day['css']['fontFamily']),'titleFont':font(cal_title['css']['fontFamily']),'size':num(day['css']['fontSize']),'titleSize':num(cal_title['css']['fontSize']),'titleWeight':cal_title['css']['fontWeight'],'titleSpacing':num(cal_title['css']['letterSpacing']),'weekSize':11,'weekWeight':'500','dayWeight':day['css']['fontWeight'],'markWeight':'700','markSize':12,'eventButton':'Thêm vào lịch','eventStyle':'Liên kết','eventColor':color(cal_link['css']['color']),'eventTitle':q.get('text',[''])[0],'eventTime':f'{(int(dates[9:11])+7)%24:02d}:{dates[11:13]}','eventPlace':destination}
    n=add(calendar,'Calendar',cal_props,{'size':num(ps[day['xpath']]['css']['fontSize']),'titleSize':num(ps[cal_title['xpath']]['css']['fontSize'])},name='Lịch ngày cưới')
    for key,el in [('rect',cal_link),('phone',ps[cal_link['xpath']])]:
        o=phone_origin if key=='phone' else origin;n[key][3]=el['rect'][1]+el['rect'][3]-o[1]-n[key][1]
    label=next(e for e in es if under(e['xpath'],rsvp['xpath']) and e['text'].strip())
    add(rsvp,'Button',{'label':label['text'],'fill':color(rsvp['css']['backgroundColor']),'textColor':color(label['css']['color']),'shape':'rounded','size':num(label['css']['fontSize']),'font':font(label['css']['fontFamily']),'href':'','action':'','payload':{}},{'size':num(ps[label['xpath']]['css']['fontSize'])},name='RSVP – chờ popup')
    n=add(iframe,'Map',{'name':destination.split(',')[0],'address':destination,'showText':False,'heading':'','divider':False,'innerFrame':False,'padding':0,'button':'Chỉ đường','color':color(map_link['css']['color']),'zoom':15},styles={'borderWidth':0,'borderRadius':0},name='Bản đồ địa điểm')
    for key,el in [('rect',map_link),('phone',ps[map_link['xpath']])]:
        o=phone_origin if key=='phone' else origin;n[key][3]=el['rect'][1]+el['rect'][3]-o[1]-n[key][1]
    gap=swatches[1]['rect'][0]-swatches[0]['rect'][0]-swatches[0]['rect'][2] if len(swatches)>1 else 0
    add(swatch_row,'DressCode',{'heading':'','subtitle':'','headingColor':background,'subtitleColor':background,'swatchShape':'circle','swatchSize':swatches[0]['rect'][2],'swatchGap':gap,'colors':[color(e['css']['backgroundColor']) for e in swatches]},name='Mẫu màu trang phục')
    field=next(e for e in es if e['tag']=='input' and under(e['xpath'],form['xpath']) and e['attrs'].get('type')!='hidden')
    button=next(e for e in es if e['tag']=='button' and under(e['xpath'],form['xpath']) and re.search(r'GỬI|SEND', ''.join(x['text'] for x in es if under(x['xpath'],e['xpath']))))
    samples=len([e for e in es if e['parent']==list_root['xpath']])
    n=add(form,'Form',{'formId':prefix+'-wishes','heading':'','intro':'','button':''.join(x['text'] for x in es if under(x['xpath'],button['xpath'])).strip(),'color':color(button['css']['backgroundColor']),'fieldColor':color(field['css']['color']),'fieldBorderColor':color(field['css']['borderColor']),'font':font(field['css']['fontFamily']),'padding':0,'compact':True,'previewSampleCount':min(10,samples)},styles={'borderWidth':0,'borderRadius':0},name='Sổ lưu bút – biểu mẫu thật')
    for key,el in [('rect',guestbook),('phone',ps[guestbook['xpath']])]:
        o=phone_origin if key=='phone' else origin;n[key][3]=el['rect'][1]+el['rect'][3]-o[1]-n[key][1]
    data={'source':source['desktop']['url'],'desktopSize':[column['rect'][2],column['rect'][3]],'phoneSize':[cp['rect'][2],cp['rect'][3]],'columnStyles':root_styles,'nodes':nodes}
    Path(f'lib/cards/demos/{slug}.measured.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    (base/'node-mapping.json').write_text(json.dumps(mapping,ensure_ascii=False,indent=2)+'\n')
    (base/'assembly-audit.json').write_text(json.dumps({'sourceViewport':source['desktop']['viewport'],'mobileViewport':source['mobile']['viewport'],'nodes':len(nodes),'albumPhotos':len(photos),'date':date,'sourceSampleCount':samples,'unmapped':limitations,'status':'working draft; no visual sign-off'},ensure_ascii=False,indent=2)+'\n')
    # Keep route and document exports explicit, so the seed can select one exact
    # document later without importing modules which have not been built.
    ts=Path('scripts/invitation-measured-document.ts.template').read_text()
    for key,value in {'__SLUG__':slug,'__EXPORT__':export,'__PREFIX__':prefix,'__TITLE__':title,'__PRIMARY__':color(cal_title['css']['color']),'__SECONDARY__':color(day['css']['color']),'__PAPER__':background}.items():
        ts=ts.replace(key,value)
    Path(f'lib/cards/demos/{slug}.ts').write_text(ts)
    route=Path('app/demo')/slug;route.mkdir(exist_ok=True)
    (route/'page.tsx').write_text(f'''import {{ InvitationContentDemo }} from "@/components/demos/invitation-content-demo";
import {{ {export} }} from "@/lib/cards/demos/{slug}";

export default function Page() {{
  return <InvitationContentDemo document={{{export}}} title="{title}" route="/demo/{slug}" outerBackground="#ffffff" />;
}}
''')
    print(slug, len(nodes),'blocks;',len(photos),'photos')

Path('public/fonts/source-invitations/batch-four-fonts.css').write_text('\n'.join(font_rules.values())+'\n')
