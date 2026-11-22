(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.XpressDepartments=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const departments=[["food", "All groceries"], ["groceries", "Staples & baking"], ["fruit", "Fresh fruit"], ["vegetables", "Vegetables & salads"], ["dairy", "Dairy & eggs"], ["meat", "Meat & fish"], ["frozen", "Frozen food"], ["bakery", "Bread & bakery"], ["breakfast", "Breakfast & spreads"], ["tinned", "Tinned food & pulses"], ["condiments", "Oil, sauces & seasoning"], ["snacks", "Snacks & treats"], ["drinks", "Drinks, tea & coffee"], ["fresh", "Fresh & chilled"], ["household", "Cleaning & household"], ["personal-care", "Personal care"], ["oral-care", "Toothpaste & oral care"], ["skincare", "Skincare & face care"], ["fragrances", "Perfumes & fragrances"], ["baby", "Baby & kids"], ["beauty", "Makeup & skincare"], ["wigs", "Wigs, frontals & extensions"], ["haircare", "Haircare & accessories"], ["nails", "Nails & manicure"], ["beauty-tools", "Beauty tools & brushes"], ["eyewear", "Sunglasses & eyewear"], ["sneakers", "Sneakers"], ["clothing", "Clothing & streetwear"], ["fashion-accessories", "Bags & accessories"], ["jewellery", "Chains & jewellery"], ["watches", "Watches"], ["phones", "Phones"], ["computers", "Computers"], ["tablets", "Tablets"], ["televisions", "TVs & entertainment"], ["audio", "Audio"], ["wearables", "Smart watches"], ["accessories", "Tech accessories"], ["home", "Home & kitchen"], ["appliances", "Appliances"], ["sports", "Sports & outdoors"], ["stationery", "Stationery & office"], ["bulk", "Wholesale & bulk"]].map(([id,name])=>({id,name}));
const food=["groceries", "fruit", "vegetables", "dairy", "meat", "frozen", "bakery", "breakfast", "tinned", "condiments", "snacks", "drinks", "fresh"];
const tech=['phones','computers','tablets','audio','wearables','accessories','televisions'];
function classify(p){
const title=String(p.name||'').toLowerCase();
if(['personal-care','beauty'].includes(p.category)){
 if(/toothpaste|toothbrush|mouthwash|dental floss|interdental|oral.?b|aqua.?fresh|sensodyne/.test(title))return 'oral-care';
 if(/perfume|eau de |cologne|fragrance mist|perfumed body spray|kaleidoscope perfume/.test(title))return 'fragrances';
 if(/face (wash|cream|scrub|serum|moistur)|facial |micellar|gentle magic|pond.?s|cleansing (foam|water)|skincare/.test(title))return 'skincare';
}
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
function matches(product,category){const c=classify(product);return category==='all'||(category==='food'?food.includes(c):category==='gadgets'?tech.includes(c):category==='personal-care'?['personal-care','oral-care','fragrances','skincare'].includes(c):category==='beauty'?['beauty','skincare'].includes(c):c===category);}
function label(id){return departments.find(d=>d.id===id)?.name||'Electronics';}
return {departments,food,tech,classify,matches,label};
});
