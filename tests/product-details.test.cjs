const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{}};for(const f of ['product-details-data','market-catalogue','imported-catalogue'])vm.runInNewContext(fs.readFileSync('assets/'+f+'.js','utf8'),ctx);
const M=require('../assets/product-model.js'),data=ctx.window.XpressProductDetails;
const all=[...ctx.window.XpressMarket.products,...ctx.window.XpressImported.products].map(p=>({...p,...data[p.id]}));
assert.equal(Object.keys(data).length,all.length);assert(all.filter(p=>p.images.length>1).length>=56);
for(const p of all){assert(p.images.length);assert(p.images.every(x=>x.startsWith('https://')||x==='assets/product-unavailable.svg'));const family=M.variants(p,all);assert(family.some(x=>x.id===p.id));}
const phone=all.find(p=>p.id==='mp-3866');assert(M.variants(phone,all).length>1);assert.equal(M.promotion({priceMinor:10000}),null);
const deal={priceMinor:10000,promotion:{approved:true,wasMinor:12000,endsAt:'2026-12-01T00:00:00Z'}};assert(M.promotion(deal,Date.parse('2026-11-15')));assert.equal(M.promotion(deal,Date.parse('2027-01-01')),null);deal.promotion.wasMinor=9000;assert.equal(M.promotion(deal,Date.parse('2026-11-15')),null);
assert(!JSON.stringify(data).includes('sourceUrl'));assert(!JSON.stringify(data).includes('supplierPrice'));
console.log('Details, real galleries, family identity and promotion guards passed.');
