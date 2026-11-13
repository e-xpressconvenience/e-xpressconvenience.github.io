(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.XpressDelivery=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  // Net weights are not packed weights. Unknown dimensions/handling require review.
  const products=[
    {id:'itau',name:'Itau Papa 12.5 kg',image:'assets/itau.webp',netKg:12.5,heavy:true},
    {id:'ginger',name:'Ginger Smash 500 ml',image:'assets/ginger.webp',netKg:null,liquid:true},
    {id:'rama',name:'Rama Original',image:'assets/rama.webp',netKg:null},
    {id:'salt',name:'Salt',image:'assets/salt.webp',netKg:null},
    {id:'sugar',name:'Sugar',image:'assets/sugar.webp',netKg:null},
    {id:'tea',name:'Tea bags',image:'assets/tea.webp',netKg:null}
  ];
  const allowed=new Set(products.map(p=>p.id));
  function cleanCart(raw){if(!raw||typeof raw!=='object'||Array.isArray(raw))return {};return Object.fromEntries(Object.entries(raw).filter(([id,n])=>allowed.has(id)&&Number.isInteger(n)&&n>0&&n<=99));}
  function validCoords(c){return !!c&&Number.isFinite(c.lat)&&Number.isFinite(c.lng)&&Math.abs(c.lat)<=90&&Math.abs(c.lng)<=180;}
  function recommend(raw){
    const cart=cleanCart(raw),items=products.filter(p=>cart[p.id]),count=Object.values(cart).reduce((a,b)=>a+b,0);
    if(!count)return {type:'empty',title:'Your delivery starts with your basket',reason:'Add your essentials to see the next delivery step.',count:0,lite:'pending'};
    const heavy=items.some(p=>p.heavy);
    if(heavy)return {type:'heavy',title:'Larger-vehicle quote recommended',reason:'Itau Papa is 12.5 kg per bag. This basket is not suitable for Delivery Lite. We will check a suitable vehicle and your route.',count,lite:'excluded',minimumKg:cart.itau*12.5};
    return {type:'review',title:'Let’s check your basket for Lite',reason:'Bicycle delivery may suit a small nearby order. Pack sizes, packed weight, handling and your route need checking before we confirm the service.',count,lite:'review'};
  }
  return {products,cleanCart,validCoords,recommend};
});
