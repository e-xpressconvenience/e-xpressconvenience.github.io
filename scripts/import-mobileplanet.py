"""Read public WooCommerce Store API listings; publish facts and calculated estimates.
No seller verification, reservation, payment or unattended schedule is implied.
Run from repository root. --seed-dir uses previously downloaded public responses.
"""
import json,urllib.request,time,datetime,re,html,argparse,os
from pathlib import Path
from decimal import Decimal,ROUND_CEILING
ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist' if (ROOT/'dist').exists() else ROOT
API='https://mobileplanetls.com/wp-json/wc/store/v1/products'
def fetch(url):
 req=urllib.request.Request(url,headers={'User-Agent':'XpressCatalogue/1.0 (catalogue research; expressconvenience2.4.7@gmail.com)','Accept':'application/json'})
 with urllib.request.urlopen(req,timeout=30) as r:return json.load(r)
def collect(kind,seed):
 result=[]
 for page in range(1,11):
  cached=Path(seed)/({'parent':'mp-products','variation':'mp-variants'}[kind]+('' if page==1 else str(page))+'.json') if seed else None
  if cached and cached.exists():batch=json.loads(cached.read_text())
  else:batch=fetch(API+f'?per_page=100&page={page}'+('&type=variation' if kind=='variation' else ''));time.sleep(.35)
  if not isinstance(batch,list):raise ValueError('Unexpected source response; previous catalogue retained')
  result.extend(batch)
  if len(batch)<100:return result
 raise ValueError('Pagination limit reached; refusing incomplete replacement')
def text(value):return html.unescape(re.sub('<[^>]*>','',str(value or ''))).strip()
def minor(p):
 pr=p['prices'];digits=pr['currency_minor_unit']
 if pr['currency_code']!='ZAR' or not isinstance(digits,int) or digits not in range(5):raise ValueError('Unexpected currency/unit')
 value=Decimal(pr['price'])*Decimal(100)/(Decimal(10)**digits)
 if value<=0 or value!=value.to_integral():raise ValueError('Invalid price')
 return int(value)
def build(parents,variants,policy,now):
 byid={p['id']:p for p in parents};records=[];review=[];seen=set()
 for p in [x for x in parents if x['type']=='simple']+variants:
  if p['id'] in seen:continue
  seen.add(p['id']);parent=byid.get(p.get('parent'),p)
  try:
   cost=minor(p);name=text(parent['name']);variant=text(p.get('variation'))
   if re.search(r'M1.*2025',name,re.I):raise ValueError('Model/year needs manual verification')
   imgs=p.get('images') or parent.get('images') or [];image=imgs[0].get('thumbnail') or imgs[0]['src'] if imgs else 'assets/favicon.svg'
   if not image.startswith(('https://mobileplanetls.com/','assets/')):raise ValueError('Unexpected image origin')
   price=cost+(cost*policy['markupBps']+9999)//10000+policy['handlingMinor']
   records.append({'id':'mp-'+str(p['id']),'name':name+(' · '+variant if variant else ''),'image':image,'category':'gadgets','netKg':None,'sourceId':'mobileplanet','sourceProductId':p['id'],'sourceUrl':parent['permalink'],'supplierPriceMinor':cost,'sourceCurrency':'ZAR','priceMinor':price,'currency':'LSL','variant':variant,'supplierListedStock':bool(p.get('is_in_stock')),'sellerVerified':False,'priceStatus':'estimate','checkedAt':now.isoformat(),'expiresAt':(now+datetime.timedelta(hours=policy['freshHours'])).isoformat(),'search':text(' '.join(c['name'] for c in parent.get('categories',[]))),'barcodes':[]})
  except (ValueError,KeyError,TypeError) as e:review.append({'id':p.get('id'),'name':text(p.get('name')),'reason':str(e)})
 return records,review
if __name__=='__main__':
 args=argparse.ArgumentParser();args.add_argument('--seed-dir');a=args.parse_args();policy=json.loads((ROOT/'config/pricing.json').read_text());now=datetime.datetime.now(datetime.timezone.utc)
 parents=collect('parent',a.seed_dir);variants=collect('variation',a.seed_dir);records,review=build(parents,variants,policy,now)
 if not records:raise ValueError('Empty import; previous catalogue retained')
 output={'updatedAt':now.isoformat(),'source':'https://mobileplanetls.com/','sourceName':'Mobile Planet','policy':policy,'parentCount':len(parents),'products':records}
 dest=DIST/'assets/imported-catalogue.js';tmp=dest.with_suffix('.tmp');tmp.write_text('window.XpressImported='+json.dumps(output,ensure_ascii=False,separators=(',',':'))+';\n');os.replace(tmp,dest)
 (ROOT/'data/import-report.json').write_text(json.dumps({'updatedAt':now.isoformat(),'sourceParents':len(parents),'publishedExactListings':len(records),'review':review,'sourceStatus':{'mobileplanet':'public listings imported; commercial relationship and fulfilment unverified','shoprite':'403 on homepage; no current feed imported','sefalana':'online prices found in BWP; Lesotho feed not established'}},indent=2))
 print(json.dumps({'parents':len(parents),'exactListings':len(records),'reviewCount':len(review)}))
