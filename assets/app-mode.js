(() => {
'use strict';
const params=new URLSearchParams(location.search), page=location.pathname.split('/').pop()||'index.html';
const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
if(params.get('website')==='1'||!(standalone||params.get('app')==='1'||page==='app.html'))return;
if(page==='index.html'){location.replace(new URL('app.html',location.href));return;}
document.body.classList.add('xp-app');
if(!document.querySelector('link[href="assets/app.css"]')){const css=document.createElement('link');css.rel='stylesheet';css.href='assets/app.css';document.head.append(css);}
const icons={home:'<path d="m3 10 9-7 9 7v10h-6v-6H9v6H3z"/>',shop:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',cart:'<path d="M2 4h3l3 12h11l3-9H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',orders:'<path d="M4 7l8-4 8 4v10l-8 4-8-4zM4 7l8 4 8-4M12 11v10"/>',account:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',help:'<path d="M4 18V11a8 8 0 0 1 16 0v7M4 11H2v6h4v-6zm16 0h2v6h-4v-6zm-1 7c0 2-3 3-6 3"/>'};
const icon=n=>'<svg aria-hidden="true" class="xp-icon" viewBox="0 0 24 24">'+icons[n]+'</svg>';
const head=document.createElement('header');head.className='xp-header';head.innerHTML='<a class="xp-brand" href="app.html" aria-label="Xpress Convenience app home"><img src="assets/app-icon.svg" alt=""><span>Xpress<small>CONVENIENCE</small></span></a><a class="xp-header-action" href="https://wa.me/26663540048" aria-label="Contact Xpress">'+icon('help')+'</a>';
document.body.prepend(head);
const nav=document.createElement('nav');nav.className='xp-nav';nav.setAttribute('aria-label','App navigation');
const tabs=[['home','Home','app.html'],['shop','Shop','products.html?app=1'],['cart','Basket','checkout.html?app=1'],['orders','Orders','app.html#orders'],['account','Account','account.html?app=1']];
for(const [id,label,href] of tabs){const a=document.createElement('a');a.href=href;a.dataset.tab=id;a.innerHTML=icon(id)+'<span>'+label+'</span>'+(id==='cart'?'<span class="xp-count" data-cart-count>0</span>':'');nav.append(a);}
document.body.append(nav);
function active(){const id=page==='app.html'?(location.hash==='#orders'?'orders':'home'):page==='checkout.html'?'cart':page==='account.html'?'account':'shop';for(const a of nav.children){if(a.dataset.tab===id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}}
active();window.addEventListener('hashchange',active);
function count(){let c={};try{c=JSON.parse(localStorage.getItem('express-convenience-basket-v1')||'{}');if(window.XpressDelivery)c=window.XpressDelivery.cleanCart(c);}catch{}const n=Object.values(c||{}).reduce((sum,v)=>sum+(Number.isInteger(v)&&v>0&&v<=99?v:0),0);nav.querySelector('[data-cart-count]').textContent=n;}
count();window.addEventListener('storage',count);window.addEventListener('pageshow',count);
function convert(a){if(!a?.getAttribute('href')||a.hasAttribute('download'))return;const raw=a.getAttribute('href');if(raw.startsWith('#'))return;let u;try{u=new URL(raw,location.href);}catch{return;}if(u.origin!==location.origin||!u.pathname.startsWith(new URL('./',location.href).pathname)||u.searchParams.get('website')==='1')return;if(!/\.html$/.test(u.pathname))return;if(u.pathname.endsWith('/index.html'))u.pathname=u.pathname.replace(/index\.html$/,'app.html');if(u.pathname.endsWith('/app.html')){if(u.href!==a.href)a.href=u.href;return;}if(u.searchParams.get('app')!=='1'){u.searchParams.set('app','1');a.href=u.href;}}
function patch(root){if(root.matches?.('a[href]'))convert(root);root.querySelectorAll?.('a[href]').forEach(convert);}
patch(document);
new MutationObserver(ms=>{for(const m of ms){if(m.type==='attributes')convert(m.target);else for(const n of m.addedNodes){if(n.nodeType===1)patch(n);}}}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['href']});
document.addEventListener('submit',e=>{const f=e.target;if(f.method?.toLowerCase()!=='get'||!f.action||new URL(f.action).origin!==location.origin||f.querySelector('[name="app"]'))return;const input=document.createElement('input');input.type='hidden';input.name='app';input.value='1';f.append(input);},true);
if(page==='products.html'){const form=document.createElement('form');form.className='xp-search';form.style.cssText='width:min(1050px,calc(100% - 32px));margin:12px auto';form.action='products.html';form.setAttribute('role','search');form.innerHTML='<input type="hidden" name="app" value="1"><input type="search" name="q" aria-label="Search products" placeholder="Search products, brands & more"><button type="submit" aria-label="Search">⌕</button><a href="scan.html?app=1" aria-label="Scan a product">⌗</a>';form.querySelector('[name=q]').value=params.get('q')||'';head.after(form);}
if(page==='account.html'){const main=document.querySelector('main');const site=document.createElement('a');site.href='index.html?website=1';site.target='_blank';site.rel='noopener';site.className='xp-primary';site.textContent='Visit full website';main?.append(site);}
})();