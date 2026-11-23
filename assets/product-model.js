(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.XpressProductModel=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 const iphoneModel=p=>{
   if(!['phones','gadgets'].includes(p.category))return null;
   const n=String(p.name||'').trim();
   // iPhone 16, iPhone 16 Plus, 16 Pro, 16 Pro Max and 16e are separate models.
   const m=n.match(/^(?:apple\s+)?iphone\s*(\d{1,2})(e|\s+pro\s+max|\s+pro|\s+plus)?(?=\s|\s*·|$)/i);
   if(!m)return null;
   const suffix=String(m[2]||'').trim().toLowerCase().replace(/\s+/g,'-');
   const model=m[1]+(suffix==='e'?'e':suffix?'-'+suffix:'');
   return model;
 };
 const groupKey=p=>{
   const iphone=iphoneModel(p);if(iphone)return 'apple-iphone-'+iphone;
   return p.familyId||p.canonicalId||('single-'+String(p.name||p.id).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));
 };
 const displayTitle=p=>{
   const iphone=iphoneModel(p);
   if(iphone)return 'Apple iPhone '+iphone.replace(/^(\d+)(e?)($|-)/,(_,n,e,sep)=>n+(e||'')+(sep==='-'?' ':'')).replace('pro-max','Pro Max').replace('pro','Pro').replace('plus','Plus');
   if(p.familyId&&String(p.name||'').includes(' · '))return p.name.split(' · ')[0];
   return p.name;
 };
 const variants=(p,all)=>all.filter(x=>groupKey(x)===groupKey(p));
 const variantParts=p=>{
   const label=String(p.variant||p.variantLabel||p.name||'');
   const storage=label.match(/(?:storage\s*:\s*|\b)(\d+(?:\s*TB|\s*GB))\b/i);
   const colour=label.match(/(?:colour|color)\s*:\s*([^,|]+)/i);
   return {storage:storage?storage[1].replace(/\s+/g,'').toUpperCase():null,color:colour?colour[1].trim():null};
 };
 const money=n=>'M '+(n/100).toLocaleString('en-ZA',{maximumFractionDigits:0});
 const promotion=(p,now=Date.now())=>p.promotion&&p.promotion.approved===true&&Number.isSafeInteger(p.promotion.wasMinor)&&p.promotion.wasMinor>p.priceMinor&&Date.parse(p.promotion.endsAt)>now?p.promotion:null;
 const relatedScore=(a,b)=>{const tokens=x=>x.name.toLowerCase().match(/[a-z]{3,}/g)||[];const aa=tokens(a),bb=tokens(b);return (aa[0]===bb[0]?5:0)+aa.filter(t=>bb.includes(t)).length;};
 return {groupKey,displayTitle,iphoneModel,variants,variantParts,money,promotion,relatedScore};
});
