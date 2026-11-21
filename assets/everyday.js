(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.XpressEveryday=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
const aisles=[
{id:'pantry',name:'Salt, sugar & pantry',pattern:/salt|sugar|flour|rice|maize|pasta|spaghetti|cooking oil|sunflower oil/i},
{id:'bread',name:'Bread & breakfast',pattern:/bread|oats|weet.?bix|corn flakes|cornflakes|peanut butter|jam\b/i},
{id:'roll-on',name:'Roll-ons & deodorant',pattern:/roll\s*[- ]?\s*on|deodorant|anti.perspirant/i},
{id:'body',name:'Body lotion & soap',pattern:/body lotion|body cream|body moistur|petroleum jelly|body wash|shower gel|soap/i},
{id:'oral',name:'Teeth & daily hygiene',pattern:/toothpaste|toothbrush|mouthwash|sanitary|pantyliner|tampon|toilet paper/i},
{id:'snacks',name:'Chips, biscuits & treats',pattern:/simba|lays|lay.s|nik.?naks|doritos|pringles|biscuit|chocolate|popcorn|chips|crisps|sweets|crackers/i},
{id:'cleaning',name:'Laundry & cleaning',pattern:/detergent|washing powder|dishwash|bleach|cleaner|fabric softener|refuse bag/i},
{id:'baby',name:'Baby essentials',pattern:/napp|diaper|baby wipe|baby lotion|baby shampoo/i}
];
const matches=(p,id)=>{if(!id)return true;const a=aisles.find(a=>a.id===id);if(!a)return false;if(['pantry','bread','snacks'].includes(id)&&p.category&&!['groceries','bakery','breakfast','snacks','condiments','tinned','drinks'].includes(p.category))return false;return a.pattern.test(p.name);};
return {aisles,matches};
});
