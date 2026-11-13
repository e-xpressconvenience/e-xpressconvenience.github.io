(()=>{
 'use strict';const $=id=>document.getElementById(id),form=$('source-form');if(!form)return;
 const categories=['general','gadgets',...window.XpressDepartments.departments.map(d=>d.id)];
 const select=$('source-category');select.replaceChildren();
 for(const d of [{id:'general',name:'Any product / shopping list'},...window.XpressDepartments.departments,{id:'gadgets',name:'All electronics'}]){const o=document.createElement('option');o.value=d.id;o.textContent=d.name;select.append(o);}
 const hints={sneakers:'Include brand, model, shoe size and sizing system (UK, US or EU), colour and quantity. Authenticity and availability must be checked.',gadgets:'Include model, storage, colour and condition. For iPhones, ask for battery health if used, network/activation-lock status and warranty terms.',bulk:'Include case or bag sizes and quantities. We check collection, weight and a suitable vehicle.',general:'Include exact specifications and quantities. You can attach a reference photo when sending in WhatsApp.',groceries:'Include brands, pack sizes, quantities and whether you would consider alternatives.',household:'Include size, dimensions or model where relevant, plus quantity.'};
 const params=new URLSearchParams(location.search),category=params.get('category');if(categories.includes(category))$('source-category').value=category;
 $('source-item').value=(params.get('q')||'').slice(0,1200);
 function hint(){$('source-hint').textContent=hints[$('source-category').value]||hints.general;}
 $('source-category').onchange=hint;hint();
 function cart(){try{return window.XpressDelivery.cleanCart(JSON.parse(localStorage.getItem('express-convenience-basket-v1')||'{}'));}catch{return {};}}
 function showBasket(){$('source-basket-row').hidden=!Object.keys(cart()).length;}
 showBasket();window.addEventListener('storage',showBasket);
 form.addEventListener('submit',e=>{
 e.preventDefault();if(!form.reportValidity())return;
 const item=$('source-item').value.trim(),specs=$('source-specs').value.trim(),area=$('source-area').value.trim();
 if(item.length<2||specs.length<2||area.length<3){$('source-error').textContent='Please add the product, useful specifications and a delivery area.';$('source-error').hidden=false;return;}
 $('source-error').hidden=true;
 const c=cart();const existing=$('source-basket').checked?window.XpressDelivery.products.filter(p=>c[p.id]).map(p=>'- '+p.name+' × '+c[p.id]):[];
 const text=['Hi Xpress, please help source this request.','Department: '+$('source-category').selectedOptions[0].text,'Product / list: '+item,'Specifications: '+specs,'Condition: '+$('source-condition').value,'Maximum total budget including delivery: '+($('source-budget').value?'M'+Number($('source-budget').value).toFixed(2):'Please quote'),'Preferred shop / seller: '+($('source-store').value.trim()||'Please check suitable sourcing options'),'Delivery area: '+area,'Requested timing (not confirmed): '+($('source-deadline').value.trim()||'Flexible; please confirm a window'),'Alternatives: '+($('source-alternatives').checked?'You may suggest alternatives; obtain my approval before substituting.':'Please quote the exact request; ask before any change.'),...(existing.length?['','Include this catalogue basket:',...existing]:[]),'','Please confirm availability, item condition, product prices, sourcing charges, delivery charge, total, relevant return/warranty terms and a feasible delivery window before I pay.'].join('\n');
 window.location.href='https://wa.me/26663540048?text='+encodeURIComponent(text);
 });
})();
