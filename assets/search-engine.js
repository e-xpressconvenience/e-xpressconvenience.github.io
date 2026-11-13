(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.XpressSearch=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const aliases={itau:'itau papa maize meal mielie meal phoofo',ginger:'ginger smash khemere ginger beer',rama:'rama original margarine spread',salt:'salt letswai seasoning',sugar:'sugar tsoekere white sugar',tea:'tea bags teabags tee'};
 const normalise=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/(\d)\s*(kg|ml|gb)\b/g,'$1$2').replace(/[^a-z0-9.]+/g,' ').trim();
 function distance(a,b){const row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let prev=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const old=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));prev=old;}}return row[b.length];}
 function score(product,query){const q=normalise(query).split(' ').filter(Boolean);if(!q.length)return 1;const name=normalise(product.name);const words=normalise([product.name,product.search,aliases[product.id]].join(' ')).split(' ');let points=0;for(const token of q){if(words.includes(token)){points+=10;continue;}if(words.some(w=>w.startsWith(token))){points+=6;continue;}if(token.length>=4&&words.some(w=>w.length>=4&&distance(token,w)<=1)){points+=3;continue;}return 0;}return points+(name===normalise(query)?20:0);}
 function validBarcode(value){const s=String(value||'').replace(/[\s-]/g,'');if(!/^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(s))return null;let sum=0;for(let i=s.length-2,weight=3;i>=0;i--,weight=4-weight)sum+=Number(s[i])*weight;return (10-sum%10)%10===Number(s.at(-1))?s:null;}
 function barcodeMatches(product,code){const v=validBarcode(code);return !!v&&(product.barcodes||[]).some(b=>validBarcode(b)&&b.padStart(14,'0')===v.padStart(14,'0'));}
 // All values are integer lisente. Fee basis points apply to the final product price.
 // Never infer verified status or prices from scraped copy. Offers must come from a trusted publishing process.
 function quote(offer,policy,now=Date.now()){
  if(!offer||!policy||offer.sellerVerified!==true||offer.stockStatus!=='in_stock'||offer.currency!=='LSL'||!offer.productId||!offer.variantKey||!offer.sellerId||!offer.sourceUrl)return null;
  const checked=Date.parse(offer.checkedAt),expires=Date.parse(offer.expiresAt);
  if(!Number.isFinite(checked)||!Number.isFinite(expires)||checked>now||expires<=now||expires<=checked)return null;
  const vals=[offer.supplierCostMinor,policy.handlingMinor,policy.fixedMarkupMinor,policy.markupBps,policy.paymentFeeBps];
  if(vals.some(v=>!Number.isSafeInteger(v)||v<0)||offer.supplierCostMinor===0||policy.paymentFeeBps>=10000||policy.markupBps>100000)return null;
  const markup=Math.ceil(offer.supplierCostMinor*policy.markupBps/10000)+policy.fixedMarkupMinor;
  const total=Math.ceil((offer.supplierCostMinor+policy.handlingMinor+markup)*10000/(10000-policy.paymentFeeBps));
  if(!Number.isSafeInteger(total))return null;
  return {productId:offer.productId,variantKey:offer.variantKey,sellerId:offer.sellerId,priceMinor:total,currency:'LSL',checkedAt:offer.checkedAt,expiresAt:offer.expiresAt,deliveryIncluded:false};
 }
 function bestOffer(offers,policy,productId,variantKey,now=Date.now()){return offers.filter(o=>o.productId===productId&&o.variantKey===variantKey).map(o=>quote(o,policy,now)).filter(Boolean).sort((a,b)=>a.priceMinor-b.priceMinor)[0]||null;}
 return {normalise,score,validBarcode,barcodeMatches,quote,bestOffer};
});
