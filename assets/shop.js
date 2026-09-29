(() => {
  "use strict";
  const KEY = "express-convenience-basket-v1";
  const LOCATION_KEY = "express-convenience-delivery-location-v1";
  const PRODUCTS = [
    {id:"bread",name:"White bread",image:"assets/bread.jpeg"},
    {id:"eggs",name:"Eggs",image:"assets/eggs.jpeg"},
    {id:"sausages",name:"Russian sausages",image:"assets/sausages.jpeg"},
    {id:"drinks",name:"Soft drinks",image:"assets/drinks.svg"},
    {id:"snacks",name:"Chocolate biscuits",image:"assets/snacks.jpeg"},
    {id:"tissue",name:"Household tissue",image:"assets/household.jpeg"}
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
  }
  function initProducts() {
    const cards = [...document.querySelectorAll(".item")];
    const filters = [...document.querySelectorAll("[data-filter]")];
    const search = document.getElementById("product-search");
    const empty = document.getElementById("empty-search");
    let category = "all";
    function filterCards() {
      const query = search.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const match = (category === "all" || card.dataset.category === category) &&
          (!query || card.dataset.search.includes(query));
        card.hidden = !match;
        if (match) visible++;
      });
      empty.hidden = visible !== 0;
    }
    filters.forEach(button => button.addEventListener("click",() => {
      category = button.dataset.filter;
      filters.forEach(item => {
        const selected = item === button;
        item.classList.toggle("active",selected);
        item.setAttribute("aria-pressed",String(selected));
      });
      filterCards();
    }));
    search.addEventListener("input",filterCards);
    document.querySelectorAll("[data-add]").forEach(button => button.addEventListener("click",() => {
      const cart = readCart();
      const id = button.dataset.add;
      if (!byId.has(id)) return;
      cart[id] = Math.min((cart[id] || 0) + 1,99);
      writeCart(cart);
      button.textContent = "Added to basket";
      clearTimeout(button._resetTimer);
      button._resetTimer = setTimeout(() => { button.textContent = "Add to basket"; },1400);
    }));
    updateCounts();
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
        message.textContent = "Your basket is empty. Add some product examples to start an enquiry.";
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
      let delivery = {}; try { delivery = JSON.parse(localStorage.getItem(LOCATION_KEY) || "{}"); } catch {}
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
    function saveLocation(coords) {
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
      let old={}; try {old=JSON.parse(localStorage.getItem(LOCATION_KEY)||"{}");}catch{}
      saveLocation(old.coords || null);
    }));
    render();
  }
  if (document.body.dataset.page === "products") initProducts();
  if (document.body.dataset.page === "checkout") initCheckout();
})();
