(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.XpressDepartments=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const departments=[['phones','Phones'],['computers','Computers'],['tablets','Tablets'],['audio','Audio'],['wearables','Smart watches'],['accessories','Tech accessories'],['groceries','Groceries & pantry'],['fresh','Fresh & chilled'],['drinks','Soft drinks & water'],['household','Cleaning & household'],['beauty','Beauty & personal care'],['baby','Baby & kids'],['sneakers','Fashion & sneakers'],['home','Home & kitchen'],['appliances','Appliances'],['sports','Sports & outdoors'],['stationery','Stationery & office'],['bulk','Wholesale & bulk']].map(([id,name])=>({id,name}));
const tech=['phones','computers','tablets','audio','wearables','accessories'];
function classify(p){
if(p.category!=='gadgets')return p.category;
const n=p.name.toLowerCase(),tags=(p.search||'').toLowerCase();
if(/battery|charger|cable|cover|case|adapter|protector|power bank/.test(n))return 'accessories';
if(/airpods|earphones|headphones|earbuds|speaker/.test(n))return 'audio';
if(/watch/.test(n))return 'wearables';
if(/macbook|laptop|notebook|imac/.test(n)||/laptops|computers/.test(tags))return 'computers';
if(/ipad|tablet|galaxy tab/.test(n)||/tablets/.test(tags))return 'tablets';
if(/phones/.test(tags)||/iphone|samsung|huawei/.test(n))return 'phones';
return 'accessories';
}
function matches(product,category){return category==='all'||(category==='gadgets'?tech.includes(classify(product)):classify(product)===category);}
function label(id){return departments.find(d=>d.id===id)?.name||'Electronics';}
return {departments,tech,classify,matches,label};
});
