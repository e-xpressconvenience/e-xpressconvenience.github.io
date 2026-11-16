"""Join evidence to stable IDs. Do not infer stock or invent extra views."""
import json,hashlib
from pathlib import Path
R=Path(__file__).resolve().parents[1];D=R/'dist' if (R/'dist').exists() else R
market=json.loads((R/'data/market-references.json').read_text())
raw=(D/'assets/imported-catalogue.js').read_text(); imported=json.loads(raw.split('=',1)[1].rstrip(';\n'))['products']
items={}
for p in imported:
 items[p['id']]={'familyId':'family-'+hashlib.sha256(p['sourceUrl'].encode()).hexdigest()[:12],'variantLabel':p.get('variant',''),'images':[p['image'] if p['image']!='assets/favicon.svg' else 'assets/product-unavailable.svg'],'specs':[]}
for p in market:
 pid='xp-'+hashlib.sha256(p['sourceUrl'].encode()).hexdigest()[:12]
 base=p['sourceUrl'].split('?variant=')[0]
 items[pid]={'familyId':'family-'+hashlib.sha256(base.encode()).hexdigest()[:12],'variantLabel':p['name'].split(' — ')[-1] if ' — ' in p['name'] else p['name'],'images':[p['image'] if p['image']!='assets/favicon.svg' else 'assets/product-unavailable.svg'],'specs':[]}
p=R/'data/research/product-enrichment.json'
if p.exists():
 for e in json.loads(p.read_text())['products']:
  for pid in e.get('productIds',[e['id']]):
   if pid not in items:continue
   existing=items[pid];imgs=e['images']
   if pid.startswith('mp-'):imgs=existing['images']+imgs
   existing.update(images=list(dict.fromkeys(imgs)),description=e['description'],specs=[[k,str(v)] for k,v in e.get('specifications',{}).items() if v and v not in ['Vietnamese','Peruvian']],galleryNote=e.get('galleryNote',''),options=e.get('options',[]))
(D/'assets/product-details-data.js').write_text('window.XpressProductDetails='+json.dumps(items,separators=(',',':'),ensure_ascii=False)+';\n')
print('Base detail records',len(items))
