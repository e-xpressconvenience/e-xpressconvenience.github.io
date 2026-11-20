(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.XpressProductModel=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const groupKey=p=>p.familyId||p.id;
 const variants=(p,all)=>all.filter(x=>groupKey(x)===groupKey(p));
 const money=n=>'M '+(n/100).toLocaleString('en-ZA',{maximumFractionDigits:0});
 const promotion=(p,now=Date.now())=>p.promotion&&p.promotion.approved===true&&Number.isSafeInteger(p.promotion.wasMinor)&&p.promotion.wasMinor>p.priceMinor&&Date.parse(p.promotion.endsAt)>now?p.promotion:null;
 return {groupKey,variants,money,promotion};
});
