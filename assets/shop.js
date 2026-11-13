(() => {
  "use strict";
  const KEY = "express-convenience-basket-v1";
  const LOCATION_KEY = "express-convenience-delivery-location-v1";
  const PRODUCTS = window.XpressDelivery.products;
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
    const cards=[...grid.querySelectorAll('.item')];
    const filters=[...document.querySelectorAll('[data-filter]')];
    const search=document.getElementById('global-query');
    const empty=document.getElementById('empty-search');
    const params=new URLSearchParams(location.search);
    let category=params.get('category')||'all';
    if(!filters.some(b=>b.dataset.filter===category))category='all';
    if(document.body.dataset.page==='products')search.value=params.get('q')||'';
    function filterCards(){
      const query=search.value.trim().toLowerCase();let visible=0;
      if(query&&document.getElementById('product-sort')?.value==='featured'){[...cards].sort((a,b)=>window.XpressSearch.score({id:b.querySelector('[data-add]')?.dataset.add,name:b.querySelector('h3').textContent,search:b.dataset.search},query)-window.XpressSearch.score({id:a.querySelector('[data-add]')?.dataset.add,name:a.querySelector('h3').textContent,search:a.dataset.search},query)).forEach(card=>grid.append(card));}
      cards.forEach(card=>{const match=(category==='all'||card.dataset.category===category)&&window.XpressSearch.score({id:card.querySelector('[data-add]')?.dataset.add,name:card.querySelector('h3').textContent,search:card.dataset.search},query)>0;card.hidden=!match;if(match)visible++;});
      if(empty){
        empty.hidden=visible!==0;
        const names={sneakers:'Sneakers & streetwear',gadgets:'Phones & gadgets',household:'Home & household',bulk:'Bulk buys'};
        const department=names[category];
        empty.querySelector('h2').textContent=department?department+' — source on request':'Not listed? Let’s look for it.';
        empty.querySelector('p').textContent=query?'Tell us the exact product, size or model. We’ll check sourcing options and send a quote.':'Describe what you need. We confirm stock, price and delivery before you commit.';
        const request=document.getElementById('request-product');
        if(request){const url=new URL('source.html',location.href);if(query)url.searchParams.set('q',search.value.trim());if(category!=='all')url.searchParams.set('category',category);request.href=url.href;request.textContent=department?'Request '+department.toLowerCase()+' →':'Request this product →';}
        document.getElementById('clear-filters').textContent='Browse listed essentials';
      }
      const result=document.getElementById('result-count');if(result)result.textContent=visible+' product'+(visible===1?'':'s');
      filters.forEach(button=>{const active=button.dataset.filter===category;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
      if(document.body.dataset.page==='products'){const url=new URL(location.href);category==='all'?url.searchParams.delete('category'):url.searchParams.set('category',category);query?url.searchParams.set('q',search.value.trim()):url.searchParams.delete('q');history.replaceState(null,'',url);}
    }
    filters.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.filter;filterCards();}));
    if(document.body.dataset.page==='products'){
      search.addEventListener('input',filterCards);
      search.form.addEventListener('submit',e=>{e.preventDefault();filterCards();});
      document.getElementById('clear-filters')?.addEventListener('click',()=>{search.value='';category='all';filterCards();search.focus();});
      document.getElementById('product-sort')?.addEventListener('change',e=>{const sorted=[...cards];if(e.target.value!=='featured')sorted.sort((a,b)=>a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent)*(e.target.value==='za'?-1:1));sorted.forEach(card=>grid.append(card));});
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
