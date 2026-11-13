const assert=require('node:assert/strict');
const d=require('../assets/delivery-engine.js');
assert.deepEqual(d.cleanCart({itau:2,tea:1,unknown:5,salt:-1,rama:1.2,ginger:100}),{itau:2,tea:1});
assert.deepEqual(d.cleanCart(null),{});assert.deepEqual(d.cleanCart([]),{});
assert.equal(d.recommend({}).type,'empty');
assert.equal(d.recommend({itau:1,tea:1}).lite,'excluded');
assert.equal(d.recommend({itau:2}).minimumKg,25);
assert.equal(d.recommend({tea:1}).type,'review');
assert.equal(d.recommend({ginger:99}).lite,'review'); // Never grant eligibility from item count.
assert.equal(d.recommend({itau:-1}).type,'empty');
assert(d.validCoords({lat:0,lng:0}));assert(!d.validCoords({lat:NaN,lng:27}));assert(!d.validCoords({lat:-91,lng:27}));assert(!d.validCoords({lat:'-29',lng:27}));
console.log('Delivery rules: 12 assertions passed.');
