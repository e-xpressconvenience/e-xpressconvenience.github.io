const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{}};for(const f of ['imported-catalogue','market-catalogue'])vm.runInNewContext(fs.readFileSync('assets/'+f+'.js','utf8'),ctx);
global.XpressImported=ctx.window.XpressImported;global.XpressMarket=ctx.window.XpressMarket;
const d=require('../assets/delivery-engine.js');
assert(d.products.length>514);assert(d.products.some(p=>p.category==='groceries'));assert(d.products.filter(p=>p.category==='sneakers').length>=25);
for(const p of d.products){assert(Number.isSafeInteger(p.priceMinor));assert(p.priceMinor>0);assert.equal(p.priceMinor%100,0);if(p.category==='gadgets')assert.equal(p.priceMinor%1000,0);}
assert(!fs.readFileSync('assets/shop.js','utf8').includes('Price & source'));
assert(!fs.readFileSync('assets/checkout.js','utf8').includes('p.sourceUrl'));
const oil=d.products.find(p=>/Sunfoil.*2L/i.test(p.name));assert(oil);assert(d.cleanCart({[oil.id]:2})[oil.id]===2);
console.log('Market prices, whole-number rounding, catalogue and source-free UI passed:',d.products.length);
