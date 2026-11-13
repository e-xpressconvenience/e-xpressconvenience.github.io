(() => {
 'use strict';
 if(document.body.dataset.page!=='checkout')return;
 const engine=window.XpressDelivery, products=engine.products;
 const CART='express-convenience-basket-v1', DETAILS='xpress-delivery-details-v2',SESSION='xpress-delivery-session-v2';
 const $=id=>document.getElementById(id);
 let memoryCart={},coords=null,map=null,marker=null,locationRequest=0,mapLoading=null;
 const inputs=['delivery-address','delivery-notes','recipient-name','recipient-phone'];
 const read=(store,key,fallback={})=>{try{return JSON.parse(store.getItem(key))||fallback;}catch{return fallback;}};
 const getCart=()=>{try{return engine.cleanCart(JSON.parse(localStorage.getItem(CART)||'{}'));}catch{return engine.cleanCart(memoryCart);}};
 function persistCart(cart){memoryCart=cart;try{localStorage.setItem(CART,JSON.stringify(cart));}catch{}render();}
 function status(text,error=false){$('location-result').textContent=text;$('location-result').classList.toggle('error',error);}
 function details(){return {address:$('delivery-address').value.trim(),notes:$('delivery-notes').value.trim(),name:$('recipient-name').value.trim(),phone:$('recipient-phone').value.trim(),coords,confirmed:$('confirm-pin').checked};}
 function persist(){const d=details();try{sessionStorage.setItem(SESSION,JSON.stringify(d));if($('remember-location').checked)localStorage.setItem(DETAILS,JSON.stringify(d));else localStorage.removeItem(DETAILS);}catch{}}
 function updatePin(c){
   coords=engine.validCoords(c)?{lat:Number(c.lat.toFixed(6)),lng:Number(c.lng.toFixed(6)),accuracy:Number.isFinite(c.accuracy)?Math.max(0,Math.round(c.accuracy)):null,source:c.source||'manual'}:null;
   $('confirm-pin').checked=false;$('pin-confirm-row').hidden=!coords;$('clear-pin').hidden=!coords;
   if(coords){$('manual-lat').value=coords.lat;$('manual-lng').value=coords.lng;status(`Pin selected: ${coords.lat}, ${coords.lng}. ${coords.accuracy!==null?'GPS accuracy: about '+coords.accuracy+' m. ':''}Check the destination and confirm below.`);}
   else{$('manual-lat').value='';$('manual-lng').value='';status('No pin selected. Enter the delivery address below.');}
   if(map){if(marker){map.removeLayer(marker);marker=null;}if(coords){marker=L.marker([coords.lat,coords.lng],{draggable:true}).addTo(map);marker.on('dragend',()=>{locationRequest++;const c=marker.getLatLng();updatePin({lat:c.lat,lng:c.lng,source:'map'});});map.setView([coords.lat,coords.lng],16);}}
   persist();
 }
 function render(){
   const cart=getCart(),list=$('cart-items');list.replaceChildren();
   for(const product of products.filter(p=>cart[p.id])){
     const row=document.createElement('div');row.className='cart-line';
     const img=document.createElement('img');img.src=product.image;img.alt='';img.width=66;img.height=66;
     const detail=document.createElement('div'),name=document.createElement('strong'),note=document.createElement('small'),remove=document.createElement('button');
     name.textContent=product.name;note.textContent='Price confirmed in your quote';remove.textContent='Remove';remove.className='remove';remove.type='button';remove.setAttribute('aria-label','Remove '+product.name+' from basket');remove.onclick=()=>change(product.id,-cart[product.id]);detail.append(name,note,remove);
     const qty=document.createElement('div');qty.className='qty';const minus=document.createElement('button'),plus=document.createElement('button'),amount=document.createElement('span');
     minus.type=plus.type='button';minus.textContent='−';plus.textContent='+';minus.setAttribute('aria-label','Remove one '+product.name);plus.setAttribute('aria-label','Add one '+product.name);amount.textContent=cart[product.id];plus.disabled=cart[product.id]>=99;
     minus.onclick=()=>change(product.id,-1);plus.onclick=()=>change(product.id,1);qty.append(minus,amount,plus);row.append(img,detail,qty);list.append(row);
   }
   const r=engine.recommend(cart);$('send-enquiry').disabled=!r.count;$('summary-note').hidden=!r.count;
   $('delivery-recommendation').dataset.type=r.type;$('delivery-title').textContent=r.title;$('delivery-reason').textContent=r.reason;
   $('delivery-weight').textContent=r.minimumKg?`Known product weight: at least ${r.minimumKg.toFixed(1)} kg, before packaging and other items.`:'';
   if(!r.count){const empty=document.createElement('div');empty.className='empty-cart';empty.innerHTML='<p>Your next top-up starts here.</p><a class="button" href="products.html">Browse essentials →</a>';list.append(empty);}
   document.querySelectorAll('[data-cart-count]').forEach(el=>el.textContent=r.count);
   // Checkout already contains the primary action; do not float a redundant basket link.
   document.querySelectorAll('.mobile-cart').forEach(el=>el.hidden=true);
 }
 function change(id,delta){const cart=getCart(),n=Math.min(99,Math.max(0,(cart[id]||0)+delta));if(n)cart[id]=n;else delete cart[id];persistCart(cart);}
 $('use-location').onclick=()=>{
   if(!navigator.geolocation){status('Location is unavailable in this browser. Enter an address or choose a map pin.',true);return;}
   const request=++locationRequest;$('use-location').disabled=true;status('Waiting for your permission to use your current location…');
   navigator.geolocation.getCurrentPosition(position=>{
     if(request!==locationRequest)return;
     $('use-location').disabled=false;updatePin({lat:position.coords.latitude,lng:position.coords.longitude,accuracy:position.coords.accuracy,source:'gps'});
   },error=>{if(request!==locationRequest)return;$('use-location').disabled=false;status(error.code===1?'Location permission was not granted. Enter an address or choose a pin on the map.':error.code===3?'Finding your location took too long. Try again or enter an address.':'We could not find your location. Enter an address or choose a map pin.',true);},{enableHighAccuracy:true,timeout:15000,maximumAge:0});
 };
 function cancelGPS(){locationRequest++;$('use-location').disabled=false;}
 $('clear-pin').onclick=()=>{cancelGPS();updatePin(null);};
 $('apply-coords').onclick=()=>{const lat=$('manual-lat').value,lng=$('manual-lng').value,c={lat:Number(lat),lng:Number(lng),source:'manual'};if(!lat.trim()||!lng.trim()||!engine.validCoords(c)){status('Enter valid latitude (−90 to 90) and longitude (−180 to 180).',true);return;}cancelGPS();updatePin(c);};
 function loadMap(){
   if(window.L)return Promise.resolve();if(mapLoading)return mapLoading;
   mapLoading=new Promise((resolve,reject)=>{
     const css=document.createElement('link');css.rel='stylesheet';css.href='https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';css.integrity='sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';css.crossOrigin='anonymous';document.head.append(css);
     const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';script.integrity='sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';script.crossOrigin='anonymous';
     const timer=setTimeout(()=>reject(new Error('Map timeout')),12000);script.onload=()=>{clearTimeout(timer);window.L?resolve():reject(new Error('Map missing'));};script.onerror=()=>{clearTimeout(timer);reject(new Error('Map unavailable'));};document.head.append(script);
   }).catch(e=>{mapLoading=null;throw e;});return mapLoading;
 }
 $('open-map').onclick=async()=>{
   const button=$('open-map');button.disabled=true;button.textContent='Loading map…';
   try{await loadMap();$('map-shell').hidden=false;if(!map){
     map=L.map('delivery-map').setView(coords?[coords.lat,coords.lng]:[-29.315,27.486],coords?16:12);
     L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map).on('tileerror',()=>status('Map tiles could not load. Use your address or enter coordinates instead.',true));
     map.on('click',e=>{cancelGPS();updatePin({lat:e.latlng.lat,lng:e.latlng.lng,source:'map'});});
     if(coords){const confirmed=$('confirm-pin').checked;updatePin(coords);$('confirm-pin').checked=confirmed;persist();}
   }map.invalidateSize();button.textContent='Map is open';
   }catch{status('The map could not load. Your address or manually entered coordinates still work.',true);button.textContent='Try map again';}finally{button.disabled=false;}
 };
 $('confirm-pin').onchange=()=>{persist();status($('confirm-pin').checked?'Destination pin confirmed. Add a landmark so we can find the entrance.':'Check your pin and confirm it before including it in your quote.');};
 inputs.forEach(id=>$(id).addEventListener('input',()=>{persist();$('quote-error').hidden=true;}));
 $('remember-location').onchange=persist;
 $('clear-details').onclick=()=>{cancelGPS();inputs.forEach(id=>$(id).value='');$('remember-location').checked=false;updatePin(null);try{localStorage.removeItem(DETAILS);sessionStorage.removeItem(SESSION);localStorage.removeItem('express-convenience-delivery-location-v1');}catch{}status('Delivery details cleared from this device.');};
 function fail(text,field){$('quote-error').hidden=false;$('quote-error').textContent=text;$(field)?.focus();}
 $('send-enquiry').onclick=()=>{
   const cart=getCart(),r=engine.recommend(cart),d=details();if(!r.count)return;
   if(d.address.length<5)return fail('Please add an address or useful landmark.','delivery-address');
   if(d.name.length<2)return fail('Please enter the recipient’s name.','recipient-name');
   if(!/^[+\d\s()-]+$/.test(d.phone)||d.phone.replace(/\D/g,'').length<8||d.phone.replace(/\D/g,'').length>15)return fail('Please enter a valid recipient phone number.','recipient-phone');
   if(coords&&!d.confirmed)return fail('Please check and confirm the destination pin, or remove it to use the address only.','confirm-pin');
   $('quote-error').hidden=true;persist();
   const message=['Hi Xpress Convenience, please quote for:',...products.filter(p=>cart[p.id]).map(p=>'- '+p.name+' × '+cart[p.id]),'','Recipient: '+d.name,'Contact: '+d.phone,'Delivery address / landmark: '+d.address,coords?`Confirmed destination: https://www.google.com/maps?q=${coords.lat},${coords.lng}`:'Location: address only',coords?.accuracy!=null?'GPS accuracy: approximately '+coords.accuracy+' m':'','Instructions: '+(d.notes||'None'),'Delivery guidance: '+r.title,'Please verify pack sizes, route and suitable vehicle.','Payment preference: '+(document.querySelector('[name="payment"]:checked')?.value||'Not selected'),'Please confirm stock, all prices, delivery fee, total and arrival window before I pay.'].filter(Boolean).join('\n');
   window.location.href='https://wa.me/26663540048?text='+encodeURIComponent(message);
 };
 // No silent migration of previously persisted precise coordinates.
 try{localStorage.removeItem('express-convenience-delivery-location-v1');}catch{}
 let saved={};try{saved=read(sessionStorage,SESSION,read(localStorage,DETAILS));$('remember-location').checked=!!localStorage.getItem(DETAILS);}catch{}
 const fields={'delivery-address':'address','delivery-notes':'notes','recipient-name':'name','recipient-phone':'phone'};
 for(const [id,key]of Object.entries(fields))if(typeof saved[key]==='string')$(id).value=saved[key].slice(0,$(id).maxLength);
 if(engine.validCoords(saved.coords)){updatePin(saved.coords);status('Previous destination restored. Please confirm it is correct for this delivery.');}
 window.addEventListener('storage',e=>{if(e.key===CART)render();});render();
})();
