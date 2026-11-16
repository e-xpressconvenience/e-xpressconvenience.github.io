(() => {
  "use strict";
  const KEY = "express-convenience-basket-v1";
  const LOCATION_KEY = "express-convenience-delivery-location-v1";
  const D = window.XpressDepartments;
  const PRODUCTS = window.XpressDelivery.products.map(p=>({...p,...window.XpressProductDetails?.[p.id],category:D.classify(p)}));
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
    const home=document.getElementById('department-grid');
    for(const department of [{id:'all',name:'All products'},...D.departments]){
      const count=department.id==='all'?PRODUCTS.length:counts[department.id];
      const target=document.getElementById('department-sidebar');
      if(target){const b=document.createElement('button');b.type='button';b.className='department-filter';b.dataset.filter=department.id;b.textContent=department.name+' · '+(count||'Request');target.append(b);}
      if(home&&['food','fruit','vegetables','dairy','meat','bakery','breakfast','condiments','household','personal-care','baby','wigs'].includes(department.id)){const a=document.createElement('a');a.href='products.html?category='+department.id;a.className='department-tile';const name=document.createElement('strong');name.textContent=department.name;const sub=document.createElement('span');sub.textContent=count?count+' listing'+(count===1?'':'s')+' →':'Request sourcing →';a.append(name,sub);home.append(a);}
    }
    const compact=document.getElementById('department-filters');
    if(compact){const label=document.createElement('label');label.textContent='Department ';const select=document.createElement('select');select.id='department-select';for(const d of [{id:'all',name:'All products'},...D.departments]){const o=document.createElement('option');o.value=d.id;o.textContent=d.name;select.append(o);}label.append(select);compact.append(label);}
    const featured=[];const used=new Set();
    for(const category of ['fruit','vegetables','groceries','dairy','meat','bakery','breakfast','tinned','condiments','drinks','household','baby']){const p=PRODUCTS.find(p=>category==='sneakers'?/Air Jordan 1/.test(p.name):category==='beauty'?/Sky High Mascara/.test(p.name):p.category===category);if(p){featured.push(p);used.add(p.id);}}
    const display=isShop?PRODUCTS:featured.slice(0,12);
    const edits=document.getElementById('style-edits');
    if(edits){
      const collections=[['YOUR HAIR EDIT','Make it your look.','wigs',p=>p.category==='wigs'],['NAILS & BEAUTY','The finishing touch.','nails',p=>p.category==='nails'],['SHADES ON','Find your frames.','eyewear',p=>p.category==='eyewear'],['THE SNEAKER EDIT','Step out your way.','sneakers',p=>/Air Jordan 1/.test(p.name)]];
      for(const [eyebrow,title,cat,test] of collections){const product=PRODUCTS.find(test);if(!product)continue;const link=document.createElement('a');link.className='style-edit';link.href='products.html?category='+cat;const img=document.createElement('img');img.src=product.image;img.alt=product.name;img.loading='lazy';const small=document.createElement('span');small.textContent=eyebrow;const h=document.createElement('h3');h.textContent=title;const cta=document.createElement('strong');cta.textContent='Shop the edit ↗';link.append(small,h,img,cta);edits.append(link);}
    }

        const hero=document.getElementById('hero-product');
    if(hero){for(const test of [p=>/Sunfoil.*2L/i.test(p.name),p=>p.category==='fruit'&&/banana/i.test(p.name),p=>p.category==='dairy'&&/eggs/i.test(p.name),p=>p.category==='bakery'&&/brown/i.test(p.name)]){const product=PRODUCTS.find(test);if(!product)continue;const box=document.createElement('div');const img=document.createElement('img');img.src=product.image;img.alt=product.name;const label=document.createElement('span');label.textContent=product.name;box.append(img,label);hero.append(box);}}
    for(const p of display){
      const card=document.createElement('article');card.className='item';card.dataset.category=p.category;card.dataset.price=p.priceMinor;card.dataset.search=(p.name+' '+p.search).toLowerCase();
      const pic=document.createElement('a');pic.href='product.html?id='+encodeURIComponent(p.id);pic.className='item-image';pic.setAttribute('aria-label','View '+p.name);const image=document.createElement('img');image.src=p.images?.[0]||p.image;image.alt=p.name;image.loading='lazy';image.width=image.height=300;image.onerror=()=>{image.onerror=null;image.src='assets/product-unavailable.svg';};pic.append(image);
      const copy=document.createElement('div');copy.className='item-copy';const tag=document.createElement('span');tag.className='item-tag';tag.textContent=D.label(p.category);const title=document.createElement('h3');const titleLink=document.createElement('a');titleLink.href=pic.href;titleLink.textContent=p.name;title.append(titleLink);
      const note=document.createElement('p');const fresh=Number.isSafeInteger(p.priceMinor)&&p.priceMinor>0;note.textContent=p.coldChain?'Fresh · handling to confirm':p.bulky?'Large item · delivery quoted':'Sourced to order';
      const bottom=document.createElement('div');bottom.className='item-bottom';const price=document.createElement('span');price.className='price-label';price.textContent=fresh?'M '+(p.priceMinor/100).toLocaleString('en-ZA',{minimumFractionDigits:0,maximumFractionDigits:0}):'Refresh price';const add=document.createElement('button');add.type='button';add.className='button';add.dataset.add=p.id;add.textContent='Add to basket';
      bottom.append(price,add);copy.append(tag,title);if(p.unitLabel){const unit=document.createElement('small');unit.className='product-unit';unit.textContent=p.unitLabel;copy.append(unit);}const family=window.XpressProductModel.variants(p,PRODUCTS);if(family.length>1){const options=document.createElement('a');options.href=pic.href;options.className='product-options';options.textContent=family.length+' listed options · view colours / configurations';copy.append(options);}else if(p.optionLabel){const options=document.createElement('a');options.href=pic.href;options.className='product-options';options.textContent='Choose size / shade preferences';copy.append(options);}copy.append(note,bottom);card.append(pic,copy);grid.append(card);
    }
    const cards=[...grid.querySelectorAll('.item')];
    const filters=[...document.querySelectorAll('[data-filter]')];
    const search=document.getElementById('global-query');
    const empty=document.getElementById('empty-search');
    const params=new URLSearchParams(location.search);let maxPrice=Number(params.get('max'))>0?Number(params.get('max')):null;const budget=document.createElement('button');budget.type='button';budget.className='budget-filter';if(maxPrice){budget.textContent='Under M'+maxPrice+' · Clear ×';grid.before(budget);budget.onclick=()=>{maxPrice=null;budget.remove();filterCards();};}
    let category=params.get('category')||'all';let visibleLimit=isShop?24:12;const more=document.createElement('button');more.type='button';more.className='button outline';more.textContent='Show more products';more.style.marginTop='24px';if(document.body.dataset.page==='products')grid.after(more);more.onclick=()=>{visibleLimit+=24;filterCards();};
    if(category!=='gadgets'&&category!=='all'&&!D.departments.some(d=>d.id===category))category='all';
    if(document.body.dataset.page==='products')search.value=params.get('q')||'';
    function filterCards(){
      const query=search.value.trim().toLowerCase();let visible=0;
      if(query&&document.getElementById('product-sort')?.value==='featured'){[...cards].sort((a,b)=>window.XpressSearch.score({id:b.querySelector('[data-add]')?.dataset.add,name:b.querySelector('h3').textContent,search:b.dataset.search},query)-window.XpressSearch.score({id:a.querySelector('[data-add]')?.dataset.add,name:a.querySelector('h3').textContent,search:a.dataset.search},query)).forEach(card=>grid.append(card));}
      [...grid.querySelectorAll('.item')].forEach(card=>{const match=(!maxPrice||Number(card.dataset.price)<maxPrice*100)&&D.matches({category:card.dataset.category},category)&&window.XpressSearch.score({id:card.querySelector('[data-add]')?.dataset.add,name:card.querySelector('h3').textContent,search:card.dataset.search},query)>0;if(match)visible++;card.hidden=!match||visible>visibleLimit;});
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
      const result=document.getElementById('result-count');if(result)result.textContent=visible+' listing'+(visible===1?'':'s')+' · includes exact model variants';
      const selector=document.getElementById('department-select');if(selector)selector.value=category;
      filters.forEach(button=>{const active=button.dataset.filter===category;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
      if(document.body.dataset.page==='products'){const url=new URL(location.href);category==='all'?url.searchParams.delete('category'):url.searchParams.set('category',category);query?url.searchParams.set('q',search.value.trim()):url.searchParams.delete('q');maxPrice?url.searchParams.set('max',maxPrice):url.searchParams.delete('max');history.replaceState(null,'',url);}
    }
    filters.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.filter;visibleLimit=24;filterCards();}));
    if(document.body.dataset.page==='products'){
      search.addEventListener('input',()=>{visibleLimit=24;filterCards();});
      search.form.addEventListener('submit',e=>{e.preventDefault();filterCards();});
      document.getElementById('clear-filters')?.addEventListener('click',()=>{search.value='';category='all';maxPrice=null;budget.remove();filterCards();search.focus();});
      document.getElementById('department-select')?.addEventListener('change',e=>{category=e.target.value;visibleLimit=24;filterCards();});
      document.getElementById('product-sort')?.addEventListener('change',e=>{const sorted=[...cards];const mode=e.target.value;if(mode.startsWith('price-'))sorted.sort((a,b)=>(Number(a.dataset.price)-Number(b.dataset.price))*(mode==='price-down'?-1:1));else if(mode!=='featured')sorted.sort((a,b)=>a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent)*(mode==='za'?-1:1));sorted.forEach(card=>grid.append(card));filterCards();});
      filterCards();
    }
    document.querySelectorAll('[data-add]').forEach(button=>{
      const id=button.dataset.add;if(!byId.has(id))return;
      const qty=document.createElement('div');qty.className='qty';qty.hidden=true;
      const minus=document.createElement('button');minus.type='button';minus.textContent='−';minus.setAttribute('aria-label','Remove one '+byId.get(id).name);
      const amount=document.createElement('span');amount.setAttribute('aria-live','polite');
      const plus=document.createElement('button');plus.type='button';plus.textContent='+';plus.setAttribute('aria-label','Add one '+byId.get(id).name);
      qty.append(minus,amount,plus);button.after(qty);
      function sync(){const n=readCart()[id]||0;button.hidden=n>0;qty.hidden=n===0;amount.textContent=n;plus.disabled=n>=99;}
      function change(delta){const cart=readCart();const n=Math.min(99,Math.max(0,(cart[id]||0)+delta));if(n)cart[id]=n;else delete cart[id];writeCart(cart);sync();if(n===0)button.focus();else if(delta>0&&n===1)plus.focus();}
      button.addEventListener('click',()=>{change(1);let toast=document.getElementById('basket-feedback');if(!toast){toast=document.createElement('div');toast.id='basket-feedback';toast.className='ec-toast';toast.setAttribute('role','status');document.body.append(toast);}toast.hidden=false;toast.textContent=byId.get(id).name+' added to your basket';clearTimeout(toast._timer);toast._timer=setTimeout(()=>toast.hidden=true,2200);});
      minus.addEventListener('click',()=>change(-1));plus.addEventListener('click',()=>change(1));window.addEventListener('storage',sync);sync();
    });updateCounts();
  }
  if (["products","home"].includes(document.body.dataset.page)) initProducts();

})();
