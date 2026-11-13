(() => {
 'use strict';
 const menu=document.querySelector('.ec-menu'), nav=document.querySelector('.ec-nav');
 function close(){nav?.classList.remove('is-open');menu?.setAttribute('aria-expanded','false');}
 menu?.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');menu.setAttribute('aria-expanded',String(open));});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();menu?.focus();}});
 document.addEventListener('click',e=>{if(!e.target.closest('.ec-header'))close();});
 const key='express-convenience-basket-v1';
 function count(){let cart={};try{cart=JSON.parse(localStorage.getItem(key)||'{}')}catch{};const allowed=["itau","ginger","rama","salt","sugar","tea"];const n=Object.entries(cart||{}).reduce((n,[id,q])=>n+(allowed.includes(id)&&Number.isInteger(q)&&q>0&&q<=99?q:0),0);document.querySelectorAll('[data-cart-count]').forEach(el=>el.textContent=n);}
 count();window.addEventListener('storage',count);
 let installPrompt;const install=document.querySelector('.ec-install');
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;if(install)install.hidden=false});
 install?.addEventListener('click',async()=>{if(!installPrompt)return;await installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;install.hidden=true;});
 window.addEventListener('appinstalled',()=>{if(install)install.hidden=true;});
 if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();
