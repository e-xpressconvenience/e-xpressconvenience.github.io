// Offline operator utility. Input contains private supplier costs; keep it outside the repository.
// This calculates a review report, not an order confirmation or a stock reservation.
const fs=require('node:fs');
const {bestOffer}=require('../assets/search-engine.js');
const input=process.argv[2];
if(!input){console.error('Usage: node scripts/price-offers.cjs /absolute/private-offers.json');process.exit(1);}
const {offers,requests,policies}=JSON.parse(fs.readFileSync(input,'utf8'));
if(!Array.isArray(offers)||!Array.isArray(requests)||!policies)throw new Error('Expected offers, requests and policies');
const report=requests.map(({productId,variantKey,policyKey})=>({productId,variantKey,quote:bestOffer(offers,policies[policyKey],productId,variantKey),note:'Delivery is quoted for the basket and route; supplier stock must be reserved before payment.'}));
console.log(JSON.stringify(report,null,2));
