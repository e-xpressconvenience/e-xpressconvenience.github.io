"""Compile reviewed market references into Xpress's own customer catalogue.
References live under data/, outside the deployed dist/. They are benchmarks, not stock.
No demand score is invented. Customers approve availability and timing before payment.
"""
import json,hashlib,datetime,re
from decimal import Decimal,ROUND_HALF_UP,ROUND_CEILING
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist' if (ROOT/'dist').exists() else ROOT

def selling_price(reference,category):
 cost=int((Decimal(str(reference))*100).quantize(Decimal('1'),rounding=ROUND_HALF_UP))
 if category in ['clothing','fashion-accessories','jewellery','watches','sneakers','sports','home','appliances','audio','wearables','televisions','computers','tablets','accessories']:
  rate,handling={'clothing':('1.08',2500),'fashion-accessories':('1.08',2500),'jewellery':('1.08',2500),'watches':('1.05',2500),'sneakers':('1.08',5000),'sports':('1.05',1500),'home':('1.06',15000),'appliances':('1.06',2500)}.get(category,('1.03',2500))
  total=Decimal(cost)*Decimal(rate)+handling
  return int((total/1000).quantize(Decimal('1'),rounding=ROUND_HALF_UP))*1000
 return int(((Decimal(cost)+150)/100).quantize(Decimal('1'),rounding=ROUND_CEILING))*100

def build(records):
 products=[];seen=set()
 for r in records:
  if not r.get('sourceUrl','').startswith('https://') or not r.get('image','').startswith('https://'):raise ValueError('Evidence and actual product image required')
  if not r.get('reference') or r['reference']<=0:raise ValueError('Positive market reference required')
  identity=r['sourceUrl'];pid='xp-'+hashlib.sha256(identity.encode()).hexdigest()[:12]
  if pid in seen:continue
  seen.add(pid);name=r['name'];cat=r['category'];kg=re.search(r'(\d+(?:\.\d+)?)\s*kg',name,re.I);weight=float(kg[1]) if kg and cat in ['groceries','household','bulk'] else None
  products.append({'id':pid,'name':name,'category':cat,'image':r['image'],'priceMinor':selling_price(r['reference'],cat),'currency':'LSL','priceStatus':'xpress','sourcingRequired':True,'netKg':weight,'heavy':bool(r.get('bulky') or (weight and weight>=10)),'bulky':bool(r.get('bulky')),'coldChain':bool(r.get('coldChain')),'fulfilment':r.get('fulfilment','local_review'),'search':name+' '+r.get('searchTags',''),'optionLabel':r.get('optionLabel','Requested size(s)' if cat=='sneakers' else ''),'barcodes':r.get('barcodes',[]),'requiresSize':cat=='sneakers'})
 return products
if __name__=='__main__':
 records=json.loads((ROOT/'data/market-references.json').read_text());products=build(records)
 output={'version':'xpress-market-v1','products':products}
 (DIST/'assets/market-catalogue.js').write_text('window.XpressMarket='+json.dumps(output,ensure_ascii=False,separators=(',',':'))+';\n')
 print('Published market-priced records:',len(products))
