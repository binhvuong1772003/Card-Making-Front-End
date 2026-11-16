"""One-off measured document data. Run from CMFE; no browser or database writes.

The source record comes from the real Chrome profile. Desktop and mobile use
independent measurements. Generated values remain an unverified working draft
until compared with CardPlayer; this script does not certify visual fidelity.
"""
import hashlib
import json
import math
import re
from pathlib import Path

SLUG = 'song-hy-v2-do'
BASE = Path('docs/references') / SLUG
source = json.loads((BASE / 'source-20261116.json').read_text())
desktop = source['desktop']['elements']
mobile = {e['xpath']: e for e in source['mobile']['elements']}
lookup = {e['xpath']: e for e in desktop}
column = next(e for e in desktop if 'data-showcase-root' in e['attrs'])
origin = column['rect'][:2]
phone_origin = mobile[column['xpath']]['rect'][:2]
manifest = json.loads((BASE / 'assets.json').read_text())
urls = {a['source']: a['local'] for a in manifest['assets']}
urls['https://chungdoi.com/images/envelope/song_hy_v2_red.webp'] = f'/demo/{SLUG}/source-assets/song_hy_v2_red.webp'
nodes = []
mapping = []
panels = []

def number(s):
    return float(re.match(r'-?[\d.]+', str(s)).group()) if re.match(r'-?[\d.]+', str(s)) else 0

def paint(s):
    if s.startswith('#'):
        return s
    nums = re.findall(r'[\d.]+', s)
    if s.startswith('rgb') and len(nums) >= 3:
        return '#' + ''.join(f'{round(float(v)):02x}' for v in nums[:3])
    if s.startswith('color(srgb'):
        return '#' + ''.join(f'{round(float(v)*255):02x}' for v in nums[:3])
    return '#920002'

def rect(e, phone=False, inline=False):
    # Text inline ink boxes do not have their CSS line-height. Use the containing
    # line box when it contains only this run; otherwise center a line box on ink.
    r = list(e['rect'])
    c = e['css']
    if inline:
        line = number(c['lineHeight'])
        r[1] -= (line-r[3])/2
        r[3] = max(line,r[3])
        if c['justifyContent'] == 'center':
            pass
    o = phone_origin if phone else origin
    return [round(r[0]-o[0],4),round(r[1]-o[1],4),round(r[2],4),round(r[3],4)]

def add(e, kind, props, phone_props=None, styles=None, inline=False, name=None):
    p = mobile.get(e['xpath'])
    if p is None:
        return None
    ident = f'shv2-{len(nodes)+1:03d}'
    n = dict(id=ident,type=kind,name=name or e['text'].strip()[:60] or kind,
             rect=rect(e,inline=inline),phone=rect(p,True,inline),props=props,
             phoneProps=phone_props or {},styles=styles or {},rotation=0)
    nodes.append(n)
    mapping.append({'nodeId':ident,'sourceXPath':e['xpath'],'role':kind})
    return n

def font(s):
    return s.replace('ChungDoiIndic, ', '').replace('"','\'').replace("'Ms Madi'", "'Ms Madi Ampersand'").replace('Fraunces,', "'Fraunces Soft',")

def text_props(e):
    c=e['css']; value=e['text']
    if c['textTransform']=='uppercase': value=value.upper()
    return {'text':value,'font':font(c['fontFamily']),'size':number(c['fontSize']),
            'fontWeight':c['fontWeight'],'bold':int(c['fontWeight'])>=600,
            'italic':c['fontStyle']=='italic','underline':False,
            'lineHeight':number(c['lineHeight']),'letterSpacing':number(c['letterSpacing']),
            'color':paint(c['color']),'align':'center' if c['justifyContent']=='center' else {'start':'left','end':'right'}.get(c['textAlign'],c['textAlign'])}

# Compound photo clip from the source SVG. A custom mask is retained on the
# native PhotoFrame, rather than baking the photograph into decorative artwork.
def roundrect(x,y,w,h,rx,ry):
    sx=100/321;sy=100/527
    x*=sx;w*=sx;rx*=sx;y*=sy;h*=sy;ry*=sy
    return f'M{x+rx},{y}H{x+w-rx}A{rx},{ry} 0 0 1 {x+w},{y+ry}V{y+h-ry}A{rx},{ry} 0 0 1 {x+w-rx},{y+h}H{x+rx}A{rx},{ry} 0 0 1 {x},{y+h-ry}V{y+ry}A{rx},{ry} 0 0 1 {x+rx},{y}Z'

for e in desktop:
    path=e['xpath'];c=e['css'];p=mobile.get(path)
    if not p or e is column or len(path)<=len(column['xpath']): continue
    # Replace the internals of interactive blocks with native components below.
    if '/section[2]/' in path and '/div[2]/div[1]' in path: continue
    if '/section[3]/' in path and ('/div[2]/div[6]' in path or '/div[2]/a[' in path or '/button[' in path): continue
    if '/section[4]/' in path and ('/iframe[' in path or '/a[' in path): continue
    if '/section[5]/' in path: continue
    if '/section[7]/' in path and ('/form[' in path or '/div[2]/div[' in path): continue
    if '/section[8]/' in path and '/button[1]' in path: continue
    if 'borderImageSource' in c and c['borderImageSource']!='none':
        idx=len(panels)+1
        n=add(e,'Decoration',{'src':f'/demo/{SLUG}/panel-{idx}-desktop.png','alt':'Nền panel gốc, dựng theo border-image','fit':'contain','motion':False},
              {'src':f'/demo/{SLUG}/panel-{idx}-mobile.png'},name=f'Nền panel {idx}')
        panels.append({'id':idx,'desktop':e,'mobile':p})
        continue
    if e['tag']=='svg' and '/header[' in path:
        svg=e['svg']; src=re.search(r'<image[^>]+href="([^"]+)"',svg).group(1)
        mask=roundrect(31.5,3,258,521,21.5,23)+roundrect(3,30,315,467,24.5,20)
        add(e,'PhotoFrame',{'src':urls[src],'alt':'Ảnh cưới Trung Hiếu và Thanh Hà','shape':{'id':'rectangle','geometry':'rectangle','maskPath':mask},'frameWidth':2.7,'frameColor':'#8c0000','zoom':100,'posX':50,'posY':50},name='Ảnh hero – khung ghép gốc')
        continue
    if e.get('image'):
        src=e['image']['src']
        if src not in urls: raise ValueError(f'Asset unmapped: {src}')
        # Layout motion is handed off separately. Remove parallax translation
        # while retaining the source horizontal mirror at its layout position.
        n=add(e,'Decoration',{'src':urls[src],'alt':src.split('/')[-1],'fit':c['objectFit'] if c['objectFit'] in ('cover','contain') else 'contain','flipX':'matrix(-1,' in c['transform'],'motion':False,'floatMotion':False},styles={'opacity':round(float(c['opacity'])*100)},name=src.split('/')[-1])
        for mode,src_e in [('rect',e),('phone',p)]:
            match=re.fullmatch(r'matrix\(([^)]+)\)',src_e['css']['transform'])
            if match:
                vals=list(map(float,match.group(1).split(',')))
                n[mode][0]-=vals[4];n[mode][1]-=vals[5]
        continue
    bg=c['backgroundColor']
    if bg not in ('rgba(0, 0, 0, 0)','transparent') and e['tag'] not in ('button','input','textarea'):
        alpha=float(re.findall(r'[\d.]+',bg)[3]) if bg.startswith('rgba') else 1
        if 'color(srgb' in bg and '/' in bg:alpha=float(bg.split('/')[-1].strip(' )'))
        add(e,'Shape',{'shape':'ellipse' if number(c['borderRadius'])>10000 else 'rectangle','fill':paint(bg)},styles={'borderRadius':min(500,number(c['borderRadius'])),'opacity':round(alpha*100)},name='Nền / đường phân cách')
    if e['text'].strip():
        # The countdown requires a live component; do not freeze a time-dependent
        # count into an ordinary text node and present it as functional.
        if re.search(r'\d+ ngày \d+ giờ',e['text']):continue
        add(e,'Text',text_props(e),text_props(p),inline=c['display']=='inline',name=e['text'].strip()[:60])

# Native Album: preserve actual DOM order, which differs from old local numbering.
gallery=next(e for e in desktop if e.get('image') and '/section[2]/' in e['xpath'] and '/photo-library/' in e['image']['src'])
gallery_path=gallery['xpath'].split('/img[')[0].rsplit('/div[',1)[0]
gallery_box=lookup[gallery_path.rsplit('/div[',1)[0]]
photos=[urls[e['image']['src']] for e in desktop if e.get('image') and '/section[2]/' in e['xpath'] and '/photo-library/' in e['image']['src']]
add(gallery_box,'Album',{'images':photos,'autoplay':False,'interval':2,'lightbox':True,'radius':8,'dotColor':'#ffe8a4','startAt':1,'spread':149},{'spread':0},name='Album 9 ảnh – đúng thứ tự nguồn')

cal=next(e for e in desktop if e['text']=='Tháng 1 / 2027')
calbox=lookup[cal['parent']]
add(calbox,'Calendar',{'date':'2027-01-04','sundayFirst':False,'showTitle':True,'lines':False,'innerFrame':False,'markShape':'Tim đầy','markColor':'#920002','markTextColor':'#fff9e6','color':'#920002','weekColor':'#920002','font':'system-ui, sans-serif','titleFont':"'The Nautigal', cursive",'size':13,'titleSize':34,'titleWeight':'600','titleSpacing':0.85,'weekSize':11,'weekWeight':'500','dayWeight':'300','markWeight':'700','markSize':12,'eventButton':'Thêm vào lịch','eventStyle':'Liên kết','eventColor':'#2f0000','eventTitle':'Đám cưới Hồ Trung Hiếu & Đặng Thanh Hà','eventTime':'19:00','eventPlace':'Sen Vang Palace, Phú Thọ'},{'size':12,'titleSize':25,'weekSize':10,'markSize':11},name='Lịch cưới')
rsvp=next(e for e in desktop if e['tag']=='button' and '/section[3]/' in e['xpath'])
add(rsvp,'Button',{'label':'XÁC NHẬN THAM DỰ','href':'','action':'','payload':{},'fill':'#920002','textColor':'#fff9e6','shape':'rounded','size':16,'font':"'Times New Roman', serif"},{'size':14},name='Xác nhận tham dự – chờ popup')
iframe=next(e for e in desktop if e['tag']=='iframe')
add(iframe,'Map',{'name':'Sen Vang Palace','address':'Phú Thọ','showText':False,'heading':'','divider':False,'innerFrame':False,'padding':0,'button':'Chỉ đường','color':'#ffe8a4','zoom':16},styles={'borderWidth':0,'borderRadius':0},name='Bản đồ Sen Vang Palace')
swatch_parent=next(e for e in desktop if '/section[5]/' in e['xpath'] and e['css']['backgroundColor']=='rgb(47, 42, 38)')
swatches=lookup[swatch_parent['parent']]
add(swatches,'DressCode',{'heading':'','subtitle':'','headingColor':'#ffe8a4','subtitleColor':'#ffe8a4','swatchShape':'circle','swatchSize':48,'swatchGap':24,'colors':['#2f2a26','#a08b74','#f4efe7']},{'swatchSize':36,'swatchGap':16},name='Màu trang phục')
# Headings remain editable Text; native DressCode is only the swatch row.
for e in desktop:
    if '/section[5]/' in e['xpath'] and e['text'].strip():add(e,'Text',text_props(e),text_props(mobile[e['xpath']]),inline=e['css']['display']=='inline')
form=next(e for e in desktop if e['tag']=='form' and '/section[7]/' in e['xpath'])
add(form,'Form',{'formId':'shv2-wishes','heading':'','intro':'','button':'GỬI LỜI CHÚC','color':'#ffe8a4','fieldColor':'#ffe8a4','fieldBorderColor':'#ffe8a4','font':"'Helvetica Neue', Helvetica, Arial, sans-serif",'padding':0,'compact':True,'previewSampleCount':8},styles={'borderWidth':0,'borderRadius':0},name='Sổ lưu bút – biểu mẫu thật')
# The reference has TWO independently transformed envelope images. A single
# static Decoration does not draw a pair (motionStyle only runs with motion).
gift_images=[e for e in desktop if '/section[8]/' in e['xpath'] and e.get('image') and '/envelope/' in e['image']['src']]
assert len(gift_images)==2, 'Source must contain both envelopes'
for index,e in enumerate(gift_images):
    back=index==0
    n=add(e,'Decoration',{'src':urls[e['image']['src']],'alt':'Bao lì xì phía sau' if back else 'Bao lì xì phía trước','fit':'contain','flipX':back,'motion':False,'floatMotion':False},name='Quà mừng – bao sau' if back else 'Quà mừng – bao trước')
    n['rotation']=15 if back else -10
    for mode,source_e in [('rect',e),('phone',mobile[e['xpath']])]:
        x,y,w,h=n[mode]; factor=.8 if back else 1
        nw=source_e['layout'][2]*factor;nh=source_e['layout'][3]*factor
        n[mode]=[x+w/2-nw/2,y+h/2-nh/2,nw,nh]
for e in desktop:
    if '/section[8]/' in e['xpath'] and e['text'].strip() in ('✦','Nhấn để mở'):
        add(e,'Text',text_props(e),text_props(mobile[e['xpath']]),inline=e['css']['display']=='inline',name='Quà mừng – '+e['text'].strip())

result={'source':source['desktop']['url'],'desktopSize':[900,column['rect'][3]],'phoneSize':[mobile[column['xpath']]['rect'][2],mobile[column['xpath']]['rect'][3]],'nodes':nodes}
Path('lib/cards/demos/song-hy-v2-do.measured.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
(BASE/'node-mapping.json').write_text(json.dumps(mapping,ensure_ascii=False,indent=2)+'\n')
(BASE/'panel-derivatives.json').write_text(json.dumps(panels,ensure_ascii=False,indent=2)+'\n')
print(f'Generated {len(nodes)} editable blocks; {len(panels)} source panels. Requires visual verification.')
