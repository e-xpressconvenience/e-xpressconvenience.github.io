(() => {
  "use strict";
  const KEY = "express-convenience-basket-v1";
  const LOCATION_KEY = "express-convenience-delivery-location-v1";
  const PRODUCTS = [
  {
    "id": "bread",
    "name": "Blue Ribbon White Bread",
    "image": "assets/bread-studio.webp"
  },
  {
    "id": "itau",
    "name": "Itau Papa 12.5 kg",
    "image": "assets/itau.webp"
  },
  {
    "id": "ginger",
    "name": "Ginger Smash",
    "image": "assets/ginger.webp"
  },
  {
    "id": "rama",
    "name": "Rama Original",
    "image": "assets/rama.webp"
  },
  {
    "id": "eggs",
    "name": "Eggs",
    "image": "assets/eggs-studio.webp"
  },
  {
    "id": "sausages",
    "name": "Russian sausages",
    "image": "assets/sausages-studio.webp"
  },
  {
    "id": "drinks",
    "name": "Coca-Cola Original",
    "image": "assets/drinks-studio.webp"
  },
  {
    "id": "snacks",
    "name": "Bakers Topper Chocolate",
    "image": "assets/snacks-studio.webp"
  },
  {
    "id": "salt",
    "name": "Salt",
    "image": "assets/salt.webp"
  },
  {
    "id": "sugar",
    "name": "Sugar",
    "image": "assets/sugar.webp"
  },
  {
    "id": "tea",
    "name": "Tea bags",
    "image": "assets/tea.webp"
  },
  {
    "id": "tissue",
    "name": "Household tissue",
    "image": "assets/household-studio.webp"
  }
];
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
      cards.forEach(card=>{const match=(category==='all'||card.dataset.category===category)&&query.split(/\s+/).every(word=>card.dataset.search.includes(word));card.hidden=!match;if(match)visible++;});
      if(empty)empty.hidden=visible!==0;
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
  function initCheckout() {
    const list = document.getElementById("cart-items");
    const send = document.getElementById("send-enquiry");
    const summary = document.getElementById("summary-note");
    function render() {
      const cart = readCart();
      list.replaceChildren();
      const entries = PRODUCTS.filter(p => cart[p.id]);
      send.disabled = entries.length === 0;
      summary.hidden = entries.length === 0;
      if (!entries.length) {
        const empty = document.createElement("div");
        empty.className = "empty-cart";
        const message = document.createElement("p");
        message.textContent = "Your basket is waiting. Add your everyday essentials to get started.";
        const link = document.createElement("a");
        link.className = "button";
        link.href = "products.html";
        link.textContent = "Browse products";
        empty.append(message,link);
        list.append(empty);
      }
      for (const p of entries) {
        const row = document.createElement("div");
        row.className = "cart-line";
        const image = document.createElement("img");
        image.src = p.image; image.alt = ""; image.width = 66; image.height = 66;
        const detail = document.createElement("div");
        const name = document.createElement("strong"); name.textContent = p.name;
        const note = document.createElement("small"); note.textContent = "Price confirmed after enquiry";
        const remove = document.createElement("button");
        remove.type = "button"; remove.className = "remove"; remove.textContent = "Remove";
        remove.addEventListener("click",() => change(p.id,0));
        detail.append(name,note,remove);
        const qty = document.createElement("div"); qty.className = "qty";
        const minus = document.createElement("button");
        minus.type = "button"; minus.setAttribute("aria-label","Remove one "+p.name);
        minus.textContent = "−"; minus.addEventListener("click",() => change(p.id,cart[p.id]-1));
        const amount = document.createElement("span"); amount.textContent = String(cart[p.id]);
        const plus = document.createElement("button");
        plus.type = "button"; plus.setAttribute("aria-label","Add one "+p.name);
        plus.textContent = "+"; plus.disabled = cart[p.id] >= 99;
        plus.addEventListener("click",() => change(p.id,cart[p.id]+1));
        qty.append(minus,amount,plus);
        row.append(image,detail,qty);
        list.append(row);
      }
      updateCounts(cart);
    }
    function change(id,qty) {
      const cart = readCart();
      if (qty <= 0) delete cart[id];
      else cart[id] = Math.min(qty,99);
      writeCart(cart);
      render();
    }
    send.addEventListener("click",() => {
      const cart = readCart();
      const entries = PRODUCTS.filter(p => cart[p.id]);
      if (!entries.length) return;
      const payment = document.querySelector('input[name="payment"]:checked')?.value || "Not selected";
      const delivery = {address:addressInput?.value.trim(),notes:notesInput?.value.trim(),coords:deliveryCoords};
      const message = [
        "Hi Express Convenience, I would like to enquire about these products:",
        ...entries.map(p => "- "+p.name+" x "+cart[p.id]),
        "",
        "Preferred payment method: "+payment,
        "Delivery address: "+(delivery.address||"not provided"),
        "GPS location: "+(delivery.coords ? delivery.coords.lat+", "+delivery.coords.lng+" (accuracy "+delivery.coords.accuracy+"m)" : "not provided"),
        "Delivery notes: "+(delivery.notes||"none"),
        "Please calculate delivery distance and estimated delivery time before confirming the order.",
        "Please confirm availability, prices, total, delivery and payment instructions before I pay."
      ].join("\n");
      window.location.href = "https://wa.me/26663540048?text=" + encodeURIComponent(message);
    });
    const useLocation = document.getElementById("use-location");
    const locationResult = document.getElementById("location-result");
    const addressInput = document.getElementById("delivery-address");
    const notesInput = document.getElementById("delivery-notes");
    let savedLocation={};
    try { savedLocation=JSON.parse(localStorage.getItem(LOCATION_KEY)||'{}')||{}; } catch {}
    if(addressInput)addressInput.value=typeof savedLocation.address==='string'?savedLocation.address:'';
    if(notesInput)notesInput.value=typeof savedLocation.notes==='string'?savedLocation.notes:'';
    let deliveryCoords=savedLocation.coords||null;
    if(locationResult && (addressInput?.value || deliveryCoords))locationResult.textContent=deliveryCoords?'Saved GPS location is included.':'Your saved address is ready.';
    const clearLocation=document.createElement('button');clearLocation.type='button';clearLocation.className='remove';clearLocation.textContent='Remove saved GPS location';
    clearLocation.hidden=!deliveryCoords;locationResult?.after(clearLocation);
    clearLocation.addEventListener('click',()=>saveLocation(null));
    function saveLocation(coords) {
      deliveryCoords=coords;clearLocation.hidden=!coords;
      const value = {address: addressInput?.value.trim() || "", notes: notesInput?.value.trim() || "", coords};
      try { localStorage.setItem(LOCATION_KEY, JSON.stringify(value)); } catch {}
      if (locationResult) locationResult.textContent = coords ? "Precise location saved for delivery planning." : "Address saved.";
    }
    if (useLocation) useLocation.addEventListener("click", () => {
      if (!navigator.geolocation) { locationResult.textContent = "Location services unavailable. Enter your address instead."; return; }
      locationResult.textContent = "Requesting precise location permission…";
      navigator.geolocation.getCurrentPosition(p => {
        saveLocation({lat:Number(p.coords.latitude.toFixed(6)),lng:Number(p.coords.longitude.toFixed(6)),accuracy:Math.round(p.coords.accuracy)});
      }, () => { locationResult.textContent = "Location was not shared. Enter your delivery address instead."; }, {enableHighAccuracy:true,timeout:15000,maximumAge:0});
    });
    [addressInput,notesInput].forEach(input => input?.addEventListener("input", () => {
      saveLocation(deliveryCoords);
    }));
    render();
  }
  if (["products","home"].includes(document.body.dataset.page)) initProducts();
  if (document.body.dataset.page === "checkout") initCheckout();
})();
