(()=>{
 'use strict';
 const $=id=>document.getElementById(id),engine=window.XpressSearch;
 const products=window.XpressDelivery.products.map(p=>({...p,barcodes:window.XpressCatalogue.barcodes[p.id]||[]}));
 let stream=null,reader=null,worker=null,generation=0,photoUrl=null,timer=null;
 const status=text=>{$('scan-status').textContent=text;};
 function stopCamera(){clearTimeout(timer);timer=null;if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;$('scan-video').srcObject=null;$('camera-view').hidden=true;}
 function reset(){generation++;stopCamera();if(worker){worker.terminate();worker=null;}if(photoUrl){URL.revokeObjectURL(photoUrl);photoUrl=null;}$('scan-preview').removeAttribute('src');$('scan-preview').hidden=true;$('scan-file').value='';$('scan-capture').value='';$('scan-results').replaceChildren();$('scan-review').hidden=true;$('scan-query').value='';$('scan-cancel').hidden=true;$('scan-progress').hidden=true;setBusy(false);status('Ready when you are. Scan a barcode or photograph a clear product label.');}
 function setBusy(busy){document.querySelectorAll('[data-scan-start]').forEach(b=>b.disabled=busy);$('scan-cancel').hidden=!busy;$('scan-progress').hidden=!busy;}
 const scripts=new Map();
 function load(src){if(scripts.has(src))return scripts.get(src);const promise=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;const t=setTimeout(()=>{s.remove();scripts.delete(src);reject(new Error('The scanner download timed out. Check your connection and try again.'));},20000);s.onload=()=>{clearTimeout(t);resolve();};s.onerror=()=>{clearTimeout(t);scripts.delete(src);s.remove();reject(new Error('The scanner could not load. Check your connection or type the product name.'));};document.head.append(s);});scripts.set(src,promise);return promise;}
 async function barcode(image){
  if('BarcodeDetector' in window){try{const formats=await BarcodeDetector.getSupportedFormats();const supported=['ean_13','ean_8','upc_a','upc_e','itf'].filter(f=>formats.includes(f));if(supported.length){const found=await new BarcodeDetector({formats:supported}).detect(image);for(const item of found){const value=engine.validBarcode(item.rawValue);if(value)return value;}}}catch{}}
  await load('assets/vendor/zxing-browser.min.js');reader=reader||new ZXingBrowser.BrowserMultiFormatReader();
  try{const canvas=document.createElement('canvas');canvas.width=image.videoWidth||image.naturalWidth||image.width;canvas.height=image.videoHeight||image.naturalHeight||image.height;canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);const result=await reader.decodeFromImageUrl(canvas.toDataURL('image/png'));return engine.validBarcode(result.getText());}catch{return null;}
 }
 function renderResults(text,isCode=false){
  $('scan-review').hidden=false;$('scan-query').value=text.slice(0,160);const list=$('scan-results');list.replaceChildren();
  const tokens=engine.normalise(text).split(' ').filter(w=>w.length>=3).slice(0,80);
  const matches=products.map(p=>({p,score:isCode?(engine.barcodeMatches(p,text)?100:0):tokens.reduce((s,t)=>s+engine.score(p,t),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,4);
  const heading=document.createElement('h2');heading.textContent=matches.length?(isCode?'Barcode matches':'Possible label matches'):'No catalogue match yet';list.append(heading);
  if(!matches.length){const p=document.createElement('p');p.textContent=isCode?'We read the code, but it is not linked to a verified product in our catalogue yet. Search by name or request this item.':'Try a closer photo with the brand and product name visible, or edit the search below. This scanner reads labels; it does not recognise unlabelled objects.';list.append(p);}
  for(const {p} of matches){const card=document.createElement('article');card.className='scan-match';const img=document.createElement('img');img.src=p.image;img.alt=p.name;const copy=document.createElement('div');const name=document.createElement('h3');name.textContent=p.name;const note=document.createElement('p');note.textContent='Confirm the product and pack size before adding. Price confirmed with quote.';const button=document.createElement('button');button.type='button';button.className='button';button.textContent='Confirm & add to basket';button.addEventListener('click',()=>{let raw={};try{raw=JSON.parse(localStorage.getItem('express-convenience-basket-v1')||'{}');}catch{}const cart=XpressDelivery.cleanCart(raw);cart[p.id]=Math.min(99,(cart[p.id]||0)+1);try{localStorage.setItem('express-convenience-basket-v1',JSON.stringify(cart));}catch{status('Your browser could not save the basket. Open the product in the shop to continue.');return;}document.querySelectorAll('[data-cart-count]').forEach(el=>el.textContent=Object.values(cart).reduce((a,b)=>a+b,0));status(p.name+' added to your basket.');button.textContent='Added — view basket';button.disabled=true;});const link=document.createElement('a');link.href='products.html?q='+encodeURIComponent(p.name);link.textContent='View product';copy.append(name,note,button,link);card.append(img,copy);list.append(card);}
  updateRequest();$('scan-review').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
 }
 function updateRequest(){const q=$('scan-query').value.trim();$('scan-request').href='source.html?q='+encodeURIComponent(q);}
 $('scan-query').addEventListener('input',updateRequest);
 $('scan-search').addEventListener('submit',e=>{e.preventDefault();const q=$('scan-query').value.trim();if(q)location.href='products.html?q='+encodeURIComponent(q);});
 async function photo(file){
  if(!file)return;reset();const run=generation;
  if(!/^image\/(jpeg|png|webp)$/.test(file.type)||file.size>12*1024*1024){status('Choose a JPG, PNG or WebP image under 12 MB.');return;}
  setBusy(true);status('Reading your image on this device…');
  try{
   photoUrl=URL.createObjectURL(file);const img=$('scan-preview');img.src=photoUrl;await img.decode();if(run!==generation)return;img.hidden=false;
   if(img.naturalWidth*img.naturalHeight>50000000)throw new Error('This image is too large. Take a smaller photo or crop it first.');
   const canvas=document.createElement('canvas'),scale=Math.min(1,1800/Math.max(img.naturalWidth,img.naturalHeight));canvas.width=Math.round(img.naturalWidth*scale);canvas.height=Math.round(img.naturalHeight*scale);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
   const code=await barcode(canvas);if(run!==generation)return;
   if(code){status('Barcode read. Confirm any matching product below.');renderResults(code,true);return;}
   status('Reading the printed label. First use downloads the text reader; this can take a moment.');
   await load('assets/vendor/tesseract.min.js');if(run!==generation)return;
   let deadline;
   const timeout=new Promise((_,reject)=>{deadline=setTimeout(()=>reject(new Error('Reading took too long. Try a clearer, closer photo or type the product name.')),75000);});
   try{await Promise.race([(async()=>{const w=await Tesseract.createWorker('eng',1,{logger:m=>{if(run===generation&&m.status==='recognizing text')status('Reading label… '+Math.round(m.progress*100)+'%');}});if(run!==generation){await w.terminate();return;}worker=w;const {data}=await w.recognize(canvas);if(run!==generation)return;const text=data.text.replace(/\s+/g,' ').trim();if(!text)throw new Error('No readable label found. Try a closer photo or type a product name.');status('Label read. Check the possible matches and edit the search if needed.');renderResults(text);})(),timeout]);}finally{clearTimeout(deadline);}
  }catch(error){if(run===generation)status(error.message||'We could not read this photo. Try again or search by name.');}
  finally{if(run===generation){if(worker){worker.terminate();worker=null;}setBusy(false);generation++;}}
 }
 $('scan-file').addEventListener('change',e=>photo(e.target.files[0]));$('scan-capture').addEventListener('change',e=>photo(e.target.files[0]));
 $('upload-trigger').addEventListener('click',()=>$('scan-file').click());$('photo-trigger').addEventListener('click',()=>$('scan-capture').click());
 $('camera-trigger').addEventListener('click',async()=>{
  reset();const run=generation;setBusy(true);status('Allow camera access to scan. Keep the barcode flat and well lit.');
  try{
   if(!navigator.mediaDevices?.getUserMedia)throw new Error('Live camera is unavailable here. Use Take a photo or Upload an image.');
   const incoming=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280}},audio:false});
   if(run!==generation){incoming.getTracks().forEach(t=>t.stop());return;}stream=incoming;$('camera-view').hidden=false;const video=$('scan-video');video.srcObject=stream;await video.play();const started=Date.now();
   async function frame(){if(run!==generation)return;try{const code=await barcode(video);if(run!==generation)return;if(code){stopCamera();setBusy(false);status('Barcode read. Confirm the matching product below.');renderResults(code,true);return;}if(Date.now()-started>45000){stopCamera();setBusy(false);status('No barcode found. Try a close-up photo or enter the barcode below.');return;}timer=setTimeout(frame,650);}catch(error){if(run===generation){stopCamera();setBusy(false);status(error.message);}}}frame();
  }catch(error){if(run===generation){stopCamera();setBusy(false);status(error.name==='NotAllowedError'?'Camera permission was not granted. You can upload a photo or type the barcode instead.':error.message||'Camera unavailable. Upload an image instead.');}}
 });
 $('scan-cancel').addEventListener('click',reset);$('scan-reset').addEventListener('click',reset);
 $('barcode-form').addEventListener('submit',e=>{e.preventDefault();const raw=$('barcode-input').value;const code=engine.validBarcode(raw);if(!code){status('Check the barcode digits: enter a valid EAN, UPC-A or GTIN (8, 12, 13 or 14 digits).');return;}reset();status('Barcode checked. Searching our catalogue.');renderResults(code,true);});
 window.addEventListener('pagehide',reset);document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
})();
