const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const D=require('../assets/departments.js');const context={window:{}};vm.runInNewContext(fs.readFileSync('assets/imported-catalogue.js','utf8'),context);
const products=context.window.XpressImported.products;
assert(products.length>400);
const counts={};for(const p of products){const id=D.classify(p);assert(D.departments.some(d=>d.id===id));counts[id]=(counts[id]||0)+1;assert(D.matches(p,'gadgets'));}
assert.equal(D.classify({category:'gadgets',name:'iPhone Battery Pack',search:'Accessories all Chargers'}),'accessories');
assert.equal(D.classify({category:'gadgets',name:'iPad Mini',search:''}),'tablets');
assert(!D.matches({category:'groceries'},'gadgets'));
for(const page of ['index','products']){const html=fs.readFileSync(''+page+'.html','utf8');assert(!/data-add="(?:itau|salt|sugar|tea|rama|ginger)"/.test(html));}
console.log('Department classification and starter removal passed:',counts);
