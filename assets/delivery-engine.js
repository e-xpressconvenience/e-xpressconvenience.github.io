(function(root,factory){const api=factory(root.XpressImported);if(typeof module==='object'&&module.exports)module.exports=api;else root.XpressDelivery=api;})(typeof globalThis!=='undefined'?globalThis:this,function(imported){
  'use strict';
  // Net weights are not packed weights. Unknown dimensions/handling require review.
  const products=[];
  if(imported?.products)products.push(...imported.products);
  const allowed=new Set(products.map(p=>p.id));
  function cleanCart(raw){if(!raw||typeof raw!=='object'||Array.isArray(raw))return {};return Object.fromEntries(Object.entries(raw).filter(([id,n])=>allowed.has(id)&&Number.isInteger(n)&&n>0&&n<=99));}
  function validCoords(c){return !!c&&Number.isFinite(c.lat)&&Number.isFinite(c.lng)&&Math.abs(c.lat)<=90&&Math.abs(c.lng)<=180;}
  function recommend(raw){
    const cart=cleanCart(raw),items=products.filter(p=>cart[p.id]),count=Object.values(cart).reduce((a,b)=>a+b,0);
    if(!count)return {type:'empty',title:'Your delivery starts with your basket',reason:'Add your essentials to see the next delivery step.',count:0,lite:'pending'};
    const heavy=items.some(p=>p.heavy);
    if(heavy)return {type:'heavy',title:'Larger-vehicle quote recommended',reason:'This basket contains heavy items. This basket is not suitable for Delivery Lite. We will check a suitable vehicle and your route.',count,lite:'excluded',minimumKg:items.reduce((sum,p)=>sum+(p.netKg||0)*cart[p.id],0)};
    if(items.some(p=>['gadgets','phones','computers','tablets','audio','wearables','accessories'].includes(p.category)))return {type:'review',title:'Protected delivery for electronics',reason:'We confirm the exact model, condition, supplier stock and secure collection before arranging delivery. No bicycle eligibility or arrival time is assumed.',count,lite:'review'};
    return {type:'review',title:'Let’s check your basket for Lite',reason:'Bicycle delivery may suit a small nearby order. Pack sizes, packed weight, handling and your route need checking before we confirm the service.',count,lite:'review'};
  }
  return {products,cleanCart,validCoords,recommend};
});
