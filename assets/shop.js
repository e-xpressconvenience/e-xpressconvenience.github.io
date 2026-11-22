(() => {
  "use strict";
  const KEY = "express-convenience-basket-v1";
  const LOCATION_KEY = "express-convenience-delivery-location-v1";
  const D = window.XpressDepartments;
  const PRODUCTS = window.XpressDelivery.products.map(p=>({...p,...window.XpressProductDetails?.[p.id],category:D.classify(p)}));
  const everyday=window.XpressEveryday;
  const aisleNav=document.getElementById('everyday-aisles');if(aisleNav&&everyday){for(const a of everyday.aisles){const link=document.createElement('a');link.href='products.html?aisle='+a.id;link.textContent=a.name;aisleNav.append(link);}}
  const byId = new Map(PRODUCTS.map(p => [p.id,p]));
  let fallbackCart = {};

  function readCart() {
    let raw;
    try { raw = JSON.parse(localStorage.getItem(KEY) || "{}"); }
    catch { raw = fallbackCart; }
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    const clean = {};
    for (const [id,qty] of Object.entries(raw)) {
      if (byId.has(id) && Number.isInteger(qty) && qty > 0 && qty <= 99) clean[id] = qty;
    }
    return clean;
  }
  function writeCart(cart) {
    fallbackCart = {...cart};
    try { localStorage.setItem(KEY,JSON.stringify(cart)); } catch {}
    updateCounts(cart);
  }
  function updateCounts(cart=readCart()) {
    const count = Object.values(cart).reduce((sum,qty) => sum + qty,0);
    document.querySelectorAll("[data-cart-count]").forEach(el => { el.textContent=String(count); });
    document.querySelectorAll(".mobile-cart").forEach(el=>el.hidden=count===0);
  }
  function initProducts() {
    const grid=document.querySelector('.catalogue');
    const isShop=document.body.dataset.page==='products';
    const counts=Object.fromEntries(D.departments.map(d=>[d.id,PRODUCTS.filter(p=>D.matches(p,d.id)).length]));
    const home=document.getElementById('department-grid');const sidebar=document.getElementById('department-sidebar');const groupTargets={};if(sidebar){for(const [key,name] of [['daily','Everyday essentials'],['style','Beauty & style'],['other','Tech, home & more']]){const group=document.createElement('details');group.className='department-group';group.open=key==='daily';const summary=document.createElement('summary');summary.textContent=name;const target=document.createElement('div');group.append(summary,target);sidebar.append(group);groupTargets[key]=target;}}
    for(const department of [{id:'all',name:'All products'},...D.departments]){
      const count=department.id==='all'?PRODUCTS.length:counts[department.id];
      const target=document.getElementById('department-sidebar');
      if(target){const b=document.createElement('button');b.type='button';b.className='department-filter';b.dataset.filter=department.id;b.textContent=department.name+' · '+(count||'Request');if(department.id==='all')target.prepend(b);else{const key=['food',...D.food,'household','personal-care','baby','bulk'].includes(department.id)?'daily':['beauty','wigs','haircare','nails','beauty-tools','eyewear','sneakers','clothing','fashion-accessories','jewellery','watches'].includes(department.id)?'style':'other';groupTargets[key].append(b);}}
      if(home&&['food','groceries','fruit','vegetables','dairy','bakery','breakfast','snacks','drinks','household','personal-care','oral-care','skincare','fragrances','baby','beauty','sneakers','clothing','phones','appliances'].includes(department.id)){
        const a=document.createElement('a');a.href='products.html?category='+department.id;a.className='department-tile';
        const collage=document.createElement('div');collage.className='department-preview';
        const candidates=PRODUCTS.filter(p=>D.matches(p,department.id)&&/^https?:\/\//.test(p.image||''));
        const selected=[],usedBrands=new Set();
        for(const p of candidates){const brand=p.name.split(/\s+/)[0].toLowerCase();if(usedBrands.has(brand))continue;selected.push(p);usedBrands.add(brand);if(selected.length===4)break;}
        for(const p of candidates){if(selected.length===4)break;if(!selected.some(s=>s.id===p.id))selected.push(p);}
        for(const p of selected){const img=document.createElement('img');img.src=p.image;img.alt='';img.loading='lazy';img.onerror=()=>{img.onerror=null;img.src='assets/product-unavailable.svg';};collage.append(img);}
        const label=document.createElement('strong');label.textContent=department.name;
        const sub=document.createElement('span');sub.textContent=count?count+' products to explore →':'Ask us to source →';
        a.append(collage,label,sub);home.append(a);
      }
    }
    const compact=document.getElementById('department-filters');
    if(compact){const label=document.createElement('label');label.textContent='Department ';const select=document.createElement('select');select.id='department-select';for(const d of [{id:'all',name:'All products'},...D.departments]){const o=document.createElement('option');o.value=d.id;o.textContent=d.name;select.append(o);}label.append(select);compact.append(label);}
    const featuredPatterns=[
      /Blue Ribbon Classic Brown Bread 700/i,/Huletts Sunsweet Brown Sugar 2KG/i,
      /Colgate Triple Action Toothpaste/i,/Gentle Magic The Skincare Soap/i,
      /POND'S Perfect Colour Complex/i,/Yardley Lace Perfume Body Spray/i,
      /Baby Soft Fresh White 2-Ply Toilet Paper/i,/Sunfoil Sunflower Oil 2L/i,
      /Nivea Rich Nourishing Body Lotion 400ml/i,/Tastic Long Grain Parboiled Rice 2kg/i,
      /OMO Superlift Auto Washing Powder/i,/Clover.*Milk/i
    ];
    const featured=[],used=new Set();
    for(const re of featuredPatterns){const p=PRODUCTS.find(p=>re.test(p.name));if(p&&!used.has(p.id)){featured.push(p);used.add(p.id);}}
    for(const category of ['dairy','fruit','bakery','household','groceries','skincare','oral-care','fragrances']){if(featured.length>=12)break;const p=PRODUCTS.find(p=>D.matches(p,category)&&!used.has(p.id)&&/^https?:\/\//.test(p.image||''));if(p){featured.push(p);used.add(p.id);}}
    const display=isShop?PRODUCTS:featured.slice(0,12);
    const edits=document.getElementById('style-edits');
    if(edits){
      const collections=[['Your hair edit','Make it your look.','wigs',p=>p.category==='wigs'],['Nails & beauty','The finishing touch.','nails',p=>p.category==='nails'],['Shades on','Find your frames.','eyewear',p=>p.category==='eyewear'],['The sneaker edit','Step out your way.','sneakers',p=>/Air Jordan 1/.test(p.name)]];
      for(const [eyebrow,title,cat,test] of collections){const product=PRODUCTS.find(test);if(!product)continue;const link=document.createElement('a');link.className='style-edit';link.href='products.html?category='+cat;const img=document.createElement('img');img.src=product.image;img.alt=product.name;img.loading='lazy';const small=document.createElement('span');small.textContent=eyebrow;const h=document.createElement('h3');h.textContent=title;const cta=document.createElement('strong');cta.textContent='Shop the edit ↗';link.append(small,h,img,cta);edits.append(link);}
    }

        const shopFloor=document.getElementById('shop-floor-shelves');
    if(shopFloor){
      const collections=[
        {title:'Bread, sugar & pantry',intro:'The things on every household shopping list.',href:'products.html?category=food',wanted:[/Blue Ribbon Classic Brown Bread/i,/Blue Ribbon Toaster White Bread/i,/Huletts Sunsweet Brown Sugar 2KG/i,/Selati Brown Sugar 2KG/i,/Tastic Long Grain Parboiled Rice 2kg/i,/Sunfoil Sunflower Oil 2L/i],cats:['bakery','groceries','breakfast']},
        {title:'Bathroom essentials',intro:'Toothpaste, soap, body care and daily hygiene.',href:'products.html?category=personal-care',wanted:[/Colgate Triple Action Toothpaste/i,/Aquafresh All In One Protection/i,/Baby Soft Fresh White/i,/Vaseline Blue Seal Original/i,/Lifebuoy Total 10/i,/Nivea Deodorant Roll-On Fresh Sensation/i],cats:['oral-care','personal-care','household']},
        {title:'Skincare people know',intro:'Gentle Magic, POND’S, Garnier and more.',href:'products.html?category=skincare',wanted:[/Gentle Magic The Skincare Soap/i,/POND'S Perfect Colour Complex/i,/Gentle Magic The Skincare Cream Jar/i,/POND'S Flawless Radiance Even Tone/i,/Garnier Micellar Cleansing Water/i,/Nivea.*Body Lotion/i],cats:['skincare','beauty','personal-care']},
        {title:'Perfumes & body sprays',intro:'Everyday fragrances and something special.',href:'products.html?category=fragrances',wanted:[/Yardley Lace Perfume/i,/Lentheric Solo Original/i,/Coty Exclamation Cologne/i,/Yardley English Blazer Eau de Toilette/i,/Yardley Gorgeous Perfume/i,/Lentheric Kaleidoscope Perfume/i],cats:['fragrances']},
        {title:'The cleaning cupboard',intro:'Laundry, dishes, household hygiene and tissue.',href:'products.html?category=household',wanted:[/OMO Superlift Auto Washing Powder/i,/Sunlight Original Dishwashing Liquid/i,/Baby Soft Fresh White/i,/Dettol Original Antiseptic Liquid/i,/Sunlight Hand Washing Powder Tropical/i,/Sunlight Washing powder Tropical/i],cats:['household']},
        {title:'The grocery top-up',intro:'Meals, breakfast and small everyday extras.',href:'products.html?category=food',wanted:[/KOO Baked Beans/i,/Bokomo Weet-Bix/i,/Clover.*Milk/i,/Eggs/i,/Blue Ribbon Classic Brown Bread/i,/Ricoffy/i],cats:['tinned','breakfast','dairy','groceries','fruit']}
      ];
      for(const collection of collections){
        const section=document.createElement('section');section.className='shop-floor-shelf';
        const heading=document.createElement('div');heading.className='shop-floor-shelf-head';
        const h=document.createElement('h3');h.textContent=collection.title;
        const see=document.createElement('a');see.href=collection.href;see.textContent='See all →';
        const lead=document.createElement('p');lead.textContent=collection.intro;heading.append(h,see,lead);
        const rail=document.createElement('div');rail.className='shop-floor-rail';const picked=[],seen=new Set();
        const add=p=>{if(!p||seen.has(p.id)||!/^https?:\/\//.test(p.image||''))return;seen.add(p.id);picked.push(p);};
        for(const regex of collection.wanted)add(PRODUCTS.find(p=>regex.test(p.name)));
        if(picked.length<6)for(const p of PRODUCTS){if(picked.length>=6)break;if(collection.cats.some(c=>D.matches(p,c)))add(p);}
        for(const p of picked.slice(0,6)){
          const link=document.createElement('a');link.href='product.html?id='+encodeURIComponent(p.id);link.className='shop-floor-item';
          const photo=document.createElement('div');photo.className='shop-floor-photo';const img=document.createElement('img');img.src=p.image;img.alt=p.name;img.loading='lazy';img.onerror=()=>{img.onerror=null;img.src='assets/product-unavailable.svg';};photo.append(img);
          const name=document.createElement('strong');name.textContent=p.name;
          const cost=document.createElement('span');cost.textContent=p.priceMinor>0?'Indicative M '+Math.round(p.priceMinor/100).toLocaleString('en-ZA'):'Ask for price';
          link.append(photo,name,cost);rail.append(link);
        }
        section.append(heading,rail);shopFloor.append(section);
      }
    }

    const hero=document.getElementById('hero-product');
    if(hero){for(const test of [p=>/Sunfoil.*2L/i.test(p.name),p=>p.category==='fruit'&&/banana/i.test(p.name),p=>p.category==='dairy'&&/eggs/i.test(p.name),p=>p.category==='bakery'&&/brown/i.test(p.name)]){const product=PRODUCTS.find(test);if(!product)continue;const box=document.createElement('div');const img=document.createElement('img');img.src=product.image;img.alt=product.name;const label=document.createElement('span');label.textContent=product.name;box.append(img,label);hero.append(box);}}
    function createCard(p){
      const card=document.createElement('article');card.className='item';card.dataset.category=p.category;card.dataset.productId=p.id;card.dataset.price=p.priceMinor;card.dataset.search=(p.name+' '+p.search).toLowerCase();
      const pic=document.createElement('a');pic.href='product.html?id='+encodeURIComponent(p.id);pic.className='item-image';pic.setAttribute('aria-label','View '+p.name);const image=document.createElement('img');image.src=p.images?.[0]||p.image;image.alt=p.photoStatus==='reference'?'Category illustration; exact product photo pending':p.name;image.loading='lazy';image.width=image.height=300;image.onerror=()=>{image.onerror=null;image.src='assets/product-unavailable.svg';};pic.append(image);
      const copy=document.createElement('div');copy.className='item-copy';const tag=document.createElement('span');tag.className='item-tag';tag.textContent=D.label(p.category);const title=document.createElement('h3');const titleLink=document.createElement('a');titleLink.href=pic.href;titleLink.textContent=p.name;title.append(titleLink);
      const note=document.createElement('p');const fresh=Number.isSafeInteger(p.priceMinor)&&p.priceMinor>0;note.textContent=p.priceStatus==='quote_required'?'Sourced on request · stock and delivery to confirm':p.coldChain?'Fresh · handling to confirm':p.bulky?'Large item · delivery quoted':'Sourced to order';
      const bottom=document.createElement('div');bottom.className='item-bottom';const price=document.createElement('span');price.className='price-label';price.textContent=fresh?'M '+(p.priceMinor/100).toLocaleString('en-ZA',{minimumFractionDigits:0,maximumFractionDigits:0}):'Request quote';const add=document.createElement('a');add.className='button';add.href=pic.href;add.textContent='View product';
      bottom.append(price,add);copy.append(tag,title);if(p.unitLabel){const unit=document.createElement('small');unit.className='product-unit';unit.textContent=p.unitLabel;copy.append(unit);}const family=window.XpressProductModel.variants(p,PRODUCTS);if(family.length>1){const options=document.createElement('a');options.href=pic.href;options.className='product-options';options.textContent=family.length+' listed options · view colours / configurations';copy.append(options);}else if(p.optionLabel){const options=document.createElement('a');options.href=pic.href;options.className='product-options';options.textContent='Choose size / shade preferences';copy.append(options);}copy.append(note,bottom);card.append(pic,copy);card.addEventListener('click',e=>{if(!e.target.closest('a,button,input,select'))location.href=pic.href;});return card;
    }
    
    const filters=[...document.querySelectorAll('[data-filter]')];
    const search=document.getElementById('global-query');
    const empty=document.getElementById('empty-search');
    const params=new URLSearchParams(location.search);let aisle=everyday?.aisles.some(a=>a.id===params.get('aisle'))?params.get('aisle'):null;const aisleChip=document.createElement('button');if(aisle){aisleChip.type='button';aisleChip.className='budget-filter';aisleChip.textContent=everyday.aisles.find(a=>a.id===aisle).name+' · Clear ×';grid.before(aisleChip);aisleChip.onclick=()=>{aisle=null;aisleChip.remove();filterCards();};}let maxPrice=Number(params.get('max'))>0?Number(params.get('max')):null;const budget=document.createElement('button');budget.type='button';budget.className='budget-filter';if(maxPrice){budget.textContent='Under M'+maxPrice+' · Clear ×';grid.before(budget);budget.onclick=()=>{maxPrice=null;budget.remove();filterCards();};}
    let category=params.get('category')||'all';let visibleLimit=isShop?24:12;const more=document.createElement('button');more.type='button';more.className='button outline';more.textContent='Show more products';more.style.marginTop='24px';if(document.body.dataset.page==='products')grid.after(more);more.onclick=()=>{visibleLimit+=24;filterCards();};
    if(category!=='gadgets'&&category!=='all'&&!D.departments.some(d=>d.id===category))category='all';
    if(document.body.dataset.page==='products')search.value=params.get('q')||'';
    function filterCards(){
      const query=search.value.trim().toLowerCase(),sortMode=document.getElementById('product-sort')?.value||'featured';
      const ranked=display.map(p=>({p,score:window.XpressSearch.score(p,query)})).filter(({p,score})=>
        (!aisle||everyday.matches(p,aisle))&&(!maxPrice||(p.priceMinor>0&&p.priceMinor<maxPrice*100))&&D.matches(p,category)&&score>0);
      if(sortMode==='price-up'||sortMode==='price-down')ranked.sort((a,b)=>{const av=a.p.priceMinor>0?a.p.priceMinor:Infinity,bv=b.p.priceMinor>0?b.p.priceMinor:Infinity;return av===Infinity&&bv===Infinity?0:av===Infinity?1:bv===Infinity?-1:(av-bv)*(sortMode==='price-down'?-1:1);});
      else if(sortMode==='za'||sortMode==='az')ranked.sort((a,b)=>a.p.name.localeCompare(b.p.name)*(sortMode==='za'?-1:1));
      else if(query)ranked.sort((a,b)=>b.score-a.score);
      const visible=ranked.length,frag=document.createDocumentFragment();
      for(const {p}of ranked.slice(0,visibleLimit))frag.append(createCard(p));
      grid.replaceChildren(frag);
      more.hidden=visible<=visibleLimit;
      if(empty){
        empty.hidden=visible!==0;
        const department=category==='all'?null:D.label(category);
        empty.querySelector('h2').textContent=department?department+' — source on request':'Not listed? Let’s look for it.';
        empty.querySelector('p').textContent=query?'Tell us the exact product, size or model. We’ll check sourcing options and send a quote.':'Describe what you need. We confirm stock, price and delivery before you commit.';
        const request=document.getElementById('request-product');
        if(request){const url=new URL('source.html',location.href);if(query)url.searchParams.set('q',search.value.trim());if(category!=='all')url.searchParams.set('category',category);request.href=url.href;request.textContent=department?'Request '+department.toLowerCase()+' →':'Request this product →';}
        document.getElementById('clear-filters').textContent='Browse all listings';
      }
      const result=document.getElementById('result-count');if(result)result.textContent=visible+' listing'+(visible===1?'':'s')+' · item prices and delivery confirmed before payment';
      const selector=document.getElementById('department-select');if(selector)selector.value=category;
      filters.forEach(button=>{const active=button.dataset.filter===category;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
      if(isShop){const url=new URL(location.href);category==='all'?url.searchParams.delete('category'):url.searchParams.set('category',category);query?url.searchParams.set('q',search.value.trim()):url.searchParams.delete('q');maxPrice?url.searchParams.set('max',maxPrice):url.searchParams.delete('max');aisle?url.searchParams.set('aisle',aisle):url.searchParams.delete('aisle');history.replaceState(null,'',url);}
    }
    filters.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.filter;visibleLimit=24;filterCards();}));
    if(document.body.dataset.page==='products'){
      search.addEventListener('input',()=>{visibleLimit=24;filterCards();});
      search.form.addEventListener('submit',e=>{e.preventDefault();filterCards();});
      document.getElementById('clear-filters')?.addEventListener('click',()=>{search.value='';category='all';maxPrice=null;aisle=null;aisleChip.remove();budget.remove();filterCards();search.focus();});
      document.getElementById('department-select')?.addEventListener('change',e=>{category=e.target.value;visibleLimit=24;filterCards();});
      document.getElementById('product-sort')?.addEventListener('change',filterCards);
      filterCards();
    }
    if(!isShop)filterCards();
    updateCounts();
  }
  if (["products","home"].includes(document.body.dataset.page)) initProducts();

})();
