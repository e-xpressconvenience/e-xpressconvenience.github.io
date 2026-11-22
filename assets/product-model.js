(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.XpressProductModel=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const groupKey=p=>p.familyId||p.id;
 const variants=(p,all)=>all.filter(x=>groupKey(x)===groupKey(p));
 const money=n=>'M '+(n/100).toLocaleString('en-ZA',{maximumFractionDigits:0});
 const promotion=(p,now=Date.now())=>p.promotion&&p.promotion.approved===true&&Number.isSafeInteger(p.promotion.wasMinor)&&p.promotion.wasMinor>p.priceMinor&&Date.parse(p.promotion.endsAt)>now?p.promotion:null;
 const relatedScore=(a,b)=>{const tokens=x=>x.name.toLowerCase().match(/[a-z]{3,}/g)||[];const aa=tokens(a),bb=tokens(b);return (aa[0]===bb[0]?5:0)+aa.filter(t=>bb.includes(t)).length;};
 return {groupKey,variants,money,promotion,relatedScore};
});
