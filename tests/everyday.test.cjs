const assert=require('node:assert/strict');
const E=require('../assets/everyday.js');
assert(E.matches({name:'Nivea Pearl & Beauty Roll-On 50ml',category:'personal-care'},'roll-on'));
assert(E.matches({name:'Blue Ribbon Classic Brown Bread 700g',category:'bakery'},'bread'));
assert(E.matches({name:'Huletts Brown Sugar 2kg',category:'groceries'},'pantry'));
assert(!E.matches({name:'Colgate Active Salt Toothpaste',category:'personal-care'},'pantry'));
assert(!E.matches({name:'Samsung phone',category:'gadgets'},'snacks'));
assert(!E.matches({name:'Anything'},'unknown'));
console.log('Everyday aisles match essentials without mixing toothpaste into the pantry.');
