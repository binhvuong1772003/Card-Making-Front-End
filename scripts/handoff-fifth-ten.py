"""Persist measured source/local evidence and content-only handoff."""
from pathlib import Path
import json,shutil
manifest=json.load(open('docs/references/clone-handoffs/fifth-ten-manifest.json'));rows=[];total=0
for t in manifest['templates']:
 s=t['slug'];base=Path('docs/references')/s;spec=json.load(open('lib/cards/demos/'+s+'.measured.json'));v=json.load(open(base/'verification-20261117.json'));audit=json.load(open(base/'assembly-audit.json'));comparison={};total+=len(spec['nodes'])
 for mode in ['desktop','mobile']:
  for ext in ['json','png']:shutil.copyfile('/tmp/'+s+'-local-'+mode+'.'+ext,base/('local-'+mode+'-20261117.'+ext))
  d=json.load(open(base/('local-'+mode+'-20261117.json')));by={e['id']:e for e in d['nodes']};column=by[t['prefix']+'-column'];expected_width=900 if mode=='desktop' else 375
  assert abs(column['rect'][2]-expected_width)<1, (s,mode,column['rect'])
  diffs=[]
  for n in spec['nodes']:
   a=by.get(n['id'])
   if not a:continue
   r=a['rect'];actual=[r[0]-column['rect'][0],r[1]-column['rect'][1],r[2],r[3]];expected=n['rect' if mode=='desktop' else 'phone']
   diffs.append({'id':n['id'],'type':n['type'],'sourceLayout':expected,'localBBox':actual,'maxGeometryDelta':round(max(abs(x-y) for x,y in zip(expected,actual)),3),'rotatedBBox':abs(n['rotation' if mode=='desktop' else 'phoneRotation'])>.001})
  comparison[mode]={'viewport':d['viewport'],'columnSize':column['rect'][2:],'nodes':diffs,'brokenImages':[i['src'] for i in d['images'] if i.get('complete') and not i['loaded']],'pendingImages':[i['src'] for i in d['images'] if not i.get('complete')]}
 (base/'local-comparison.json').write_text(json.dumps(comparison,ensure_ascii=False,indent=2))
 gaps=[str(len(v['unsupportedPhoneOverrides']))+' source mobile property overrides lack native per-device controls; typography needs refinement.','Guestbook uses the native Form; preview rows differ from source data. Visible source countdowns use a native Countdown; targets inferred from captured duration and time are recorded in countdown-evidence.json.','Background derivatives preserve artwork separately. Blend, exact repetition, rounded corner combinations, border-image, SVG decoration and custom photo crop still need visual refinement.','Cover/popups/motion remain outside this content-only handoff; concurrent finishTemplate additions to routes/modules were preserved. Catalog and published snapshots are not verified by this pass.']
 gaps += list(dict.fromkeys(u['issue'] for u in audit['unmapped']))
 if s=='long-phung-lam':gaps.append('Source has a third mobile-only background ornament; sibling paths were mapped but the extra ornament remains pending.')
 (base/'handoff.md').write_text('# '+t['title']+' — content draft\n\nSource: '+t['demo']+'\n\nLocal: http://localhost:3001/demo/'+s+'\n\nExport: `'+t['export']+'`, single page `invitation`; '+str(len(spec['nodes']))+' native blocks, Album '+str(audit['albumPhotos'])+' source photos.\n\nPage/schema/local-file validation passed. Desktop/mobile captured with actual 900px/375px columns; DOM differences in `local-comparison.json`. No complete-clone visual sign-off.\n\nRemaining:\n\n'+''.join('- '+g+'\n' for g in gaps))
 (Path('docs/references')/(s+'-elements.md')).write_text('# '+t['title']+'\n\nSource: '+t['demo']+'\n\n- [Desktop/mobile source DOM]('+s+'/source-20261117.json).\n- [Source → local → hash mapping]('+s+'/assets.json).\n- [Background recipes]('+s+'/derived-backgrounds.json).\n- [Native node mapping]('+s+'/node-mapping.json).\n- [Local DOM comparison]('+s+'/local-comparison.json).\n- [Handoff / gaps]('+s+'/handoff.md).\n')
 rows.append('| '+t['title']+' | [Local](http://localhost:3001/demo/'+s+') | [Source]('+t['demo']+') | '+str(len(spec['nodes']))+' | Content draft |')
 print(s,'desktop/mobile evidence saved',flush=True)
Path('docs/references/clone-handoffs/fifth-ten-progress.md').write_text('# Fifth ten content drafts\n\nSource listing: '+manifest['source']+'; positions 21–30. All existing routes were excluded before selection; source/route enrichment added concurrently is preserved. '+str(total)+' native nodes total.\n\n| Template | Local | Source | Nodes | Status |\n|---|---|---|---:|---|\n'+'\n'.join(rows)+'\n\nAll ten pass schema/local-file validation. Desktop/mobile browser DOM and screenshots are recorded; native typography, textures/crop, controls and catalog gaps remain in each handoff. No publication/seed/commit/push.\n')
Path('docs/references/clone-handoffs/fifth-ten-source-links.txt').write_text('\n\n'.join(t['title']+'\n'+t['demo'] for t in manifest['templates'])+'\n')
