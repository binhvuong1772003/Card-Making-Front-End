"""Import files downloaded through the real Chrome profile; no network requests."""
from pathlib import Path
import json,shutil,hashlib,re
from urllib.parse import unquote
for t in json.loads(Path('docs/references/clone-handoffs/next-ten-manifest.json').read_text())['templates']:
 s=t['slug'];base=Path('docs/references')/s;base.mkdir(exist_ok=True)
 shutil.copyfile('/tmp/'+s+'-source.json',base/'source-20261116.json')
 b=json.load(open('/tmp/'+s+'-assets-bundle.json'));items=[];extra=[]
 for a in b['assets']:
  if a['kind'] not in ('font','image') or 'google.com' in a['url']:continue
  src=Path(a['path']);digest=hashlib.sha256(src.read_bytes()).hexdigest();name=digest[:12]+'-'+re.sub(r'[^A-Za-z0-9._-]+','_',unquote(a['name']))
  folder=Path('public/fonts/source-invitations/batch-two') if a['kind']=='font' else Path('public/demo')/s/'source-assets';folder.mkdir(parents=True,exist_ok=True)
  target=folder/name;shutil.copyfile(src,target);local='/'+str(target.relative_to('public'))
  items.append({'source':a['url'],'local':local,'sha256':digest,'kind':a['kind']});extra.append({'url':a['url'],'local':local,'kind':a['kind']})
 (base/'assets.json').write_text(json.dumps({'assets':items,'failures':b.get('failures',[]),'missing':b.get('missing',[])},ensure_ascii=False,indent=2))
 (base/'additional-assets-20261116.json').write_text(json.dumps(extra,ensure_ascii=False,indent=2))
 print(s,len(items))
