/* AgriMarket — discovery: marketplace, details, categories, farmers, compare */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  const {$, $$, esc, inr, prods, getProd, getFarmer, catOf, pCard, bindCards, stars, wireSuggest, pushRecent} = AM;
  const qs = new URLSearchParams(location.search);

  /* ---------- MARKETPLACE ---------- */
  if (page === "products") {
    const state = {q:qs.get("q")||"", cat:qs.get("cat")||"", max:8000, organic:qs.get("organic")==="1", rating:0, sort:"pop", view:"grid", page:1, loc:"", avail:""};
    const per = 9;
    // Build filter panel
    $("#f-cats").innerHTML = SEED.CATS.map(c => `<label class="check"><input type="radio" name="fc" value="${c.id}" ${state.cat===c.id?"checked":""}> ${c.emoji} ${esc(c.name)}</label>`).join("") + `<label class="check"><input type="radio" name="fc" value="" ${!state.cat?"checked":""}> 🌾 All</label>`;
    $("#f-districts").innerHTML = `<option value="">All districts</option>` + [...new Set(AM.farmers().map(f=>f.district))].map(d=>`<option>${esc(d)}</option>`).join("");
    $("#q").value = state.q; $("#max-price").value = state.max; $("#f-organic").checked = state.organic;
    wireSuggest($("#q"), $("#q-suggest"));
    const apply = () => {
      let list = prods().slice();
      if (state.q) { const q = state.q.toLowerCase(); list = list.filter(p => (p.name+" "+p.cat+" "+(getFarmer(p.farmerId)?.farm||"")+" "+(getFarmer(p.farmerId)?.district||"")+" "+(getFarmer(p.farmerId)?.village||"")).toLowerCase().includes(q)); }
      if (state.cat) list = state.cat === "organic" ? list.filter(p=>p.organic) : list.filter(p=>p.cat===state.cat);
      list = list.filter(p => p.price <= state.max);
      if (state.organic) list = list.filter(p=>p.organic);
      if (state.rating) list = list.filter(p=>p.rating >= state.rating);
      if (state.loc) list = list.filter(p=>getFarmer(p.farmerId)?.district === state.loc);
      if (state.avail === "in") list = list.filter(p=>p.stock>0);
      const sorts = {pop:(a,b)=>b.rating*b.rc-a.rating*a.rc, lo:(a,b)=>a.price-b.price, hi:(a,b)=>b.price-a.price, rate:(a,b)=>b.rating-a.rating, new:(a,b)=>new Date(b.harvest)-new Date(a.harvest)};
      list.sort(sorts[state.sort] || sorts.pop);
      // Render
      const pages = Math.max(1, Math.ceil(list.length/per));
      state.page = Math.min(state.page, pages);
      const slice = list.slice((state.page-1)*per, state.page*per);
      $("#result-count").innerHTML = `<b>${list.length}</b> product${list.length!==1?"s":""} found`;
      const grid = $("#results");
      grid.className = "products-grid" + (state.view === "list" ? " list" : "");
      grid.innerHTML = slice.length ? slice.map(pCard).join("") : `<div class="card card-pad empty" style="grid-column:1/-1"><span class="big">🔍</span><h3>No products found</h3><p>Try changing your filters or search.</p><button class="btn btn-primary" onclick="location.href='products.html'">Clear all filters</button></div>`;
      bindCards(grid);
      $("#pages").innerHTML = pages <= 1 ? "" : Array.from({length:pages},(_,i)=>`<button class="${i+1===state.page?"on":""}" data-pg="${i+1}">${i+1}</button>`).join("");
      $$("#pages button").forEach(b => b.onclick = () => { state.page = +b.dataset.pg; apply(); window.scrollTo({top:0,behavior:"smooth"}); });
    };
    // events
    let deb; $("#q").addEventListener("input", e => { clearTimeout(deb); deb = setTimeout(()=>{ state.q = e.target.value; state.page = 1; apply(); }, 280); });
    $$("input[name=fc]").forEach(r => r.onchange = () => { state.cat = r.value; state.page = 1; apply(); });
    $("#max-price").addEventListener("input", e => { state.max = +e.target.value; $("#max-label").textContent = inr(state.max); state.page = 1; apply(); });
    $("#f-organic").onchange = e => { state.organic = e.target.checked; state.page = 1; apply(); };
    $$("input[name=fr]").forEach(r => r.onchange = () => { state.rating = +r.value; state.page = 1; apply(); });
    $("#f-districts").onchange = e => { state.loc = e.target.value; state.page = 1; apply(); };
    $("#f-avail").onchange = e => { state.avail = e.target.value; state.page = 1; apply(); };
    $("#sort").onchange = e => { state.sort = e.target.value; apply(); };
    $("#v-grid").onclick = () => { state.view = "grid"; $("#v-grid").classList.add("on"); $("#v-list").classList.remove("on"); apply(); };
    $("#v-list").onclick = () => { state.view = "list"; $("#v-list").classList.add("on"); $("#v-grid").classList.remove("on"); apply(); };
    $("#clear-f").onclick = () => location.href = "products.html";
    $("#filter-fab").onclick = () => $("#filters").classList.toggle("open");
    apply();
  }

  /* ---------- PRODUCT DETAILS ---------- */
  if (page === "details") {
    const p = getProd(qs.get("id")) || prods()[0];
    pushRecent(p.id);
    const f = getFarmer(p.farmerId) || {}, cat = catOf(p.cat) || {};
    $("#crumb-name").textContent = p.name;
    let qty = 1;
    $("#detail").innerHTML = `<div class="grid grid-2" style="gap:28px">
      <div><div class="card"><div class="p-media" style="background:${cat.grad};aspect-ratio:1/.85;border-radius:18px 18px 0 0">
          <span class="emoji" style="font-size:6rem">${p.emoji}</span>
          <div class="tags">${p.badge?`<span class="badge b-gold">${esc(p.badge)}</span>`:""}${p.organic?`<span class="badge b-green">🌱 Organic</span>`:""}</div></div>
        <div class="flex" style="padding:12px;gap:8px">${[p.emoji,"🌾","📦"].map((e,i)=>`<button class="chip ${i===0?"on":""}" style="font-size:1.4rem;padding:8px 16px" data-gal="${e}">${e}</button>`).join("")}</div></div>
        <div class="card card-pad" style="margin-top:16px"><h3>🌱 Know Your Farmer</h3>
          <ol class="timeline"><li class="done"><b>Farm Location</b><small>${esc(f.village||"")}, ${esc(f.mandal||"")}, ${esc(f.district||"")}</small></li>
          <li class="done"><b>Farmer — ${esc(f.name||"")}</b><small>${esc(f.exp||"")} yrs experience • ${esc(f.size||"")} • ${esc(f.method||"")}</small></li>
          <li class="done"><b>Harvest — ${esc(p.harvest)}</b><small>Grade ${esc(p.grade)} • ${esc(p.method)}</small></li>
          <li class="done"><b>Quality check passed ✔</b><small>Sorted, graded & packed at farm-gate</small></li>
          <li><b>Marketplace → You</b><small>Ships in 24 hrs in eco packs</small></li></ol>
          <div class="flex wrap"><a class="btn btn-outline btn-sm" href="farmer-profile.html?id=${f.id}">View farmer</a>
          <button class="btn btn-ghost btn-sm" id="d-chat">💬 Chat with farmer</button></div></div></div>
      <div><span class="badge b-green">${esc(cat.name||p.cat)}</span> ${p.stock<=0?'<span class="badge b-red">Out of stock</span>':p.stock<50?`<span class="badge b-gold">Only ${p.stock} left</span>`:'<span class="badge b-green">In stock</span>'}
        <h1 style="margin:10px 0 4px">${esc(p.name)}</h1>
        <div class="flex wrap"><span class="rating">${stars(p.rating)} ${p.rating}</span><span class="muted small">(${p.rc} ratings)</span><span class="small">🧑‍🌾 <a href="farmer-profile.html?id=${f.id}">${esc(f.farm||"")}</a> ${f.verified?'<span class="verify">✔</span>':""}</span></div>
        <div class="card card-pad" style="margin:16px 0"><span class="price" style="font-size:2rem">${inr(p.price)}<small> /${esc(p.unit)}</small></span>
          ${p.mrp>p.price?`<span class="mrp">${inr(p.mrp)}</span> <span class="badge b-gold">SAVE ${Math.round((1-p.price/p.mrp)*100)}%</span>`:""}
          <p class="small muted" style="margin:8px 0 0">Inclusive of all taxes • Min. order: ${esc(p.moq)}</p>
          <div class="flex wrap" style="margin-top:14px">
            <span class="flex" style="border:1.5px solid var(--line-strong);border-radius:10px;overflow:hidden">
              <button class="btn btn-ghost btn-sm" id="q-minus" style="border:0;border-radius:0">−</button>
              <b id="q-val" style="min-width:40px;text-align:center">1</b>
              <button class="btn btn-ghost btn-sm" id="q-plus" style="border:0;border-radius:0">+</button></span>
            <button class="btn btn-primary" id="d-add" ${p.stock<=0?"disabled":""}>🛒 Add to cart</button>
            <button class="btn btn-gold" id="d-buy" ${p.stock<=0?"disabled":""}>⚡ Buy now</button>
            <button class="icon-btn" id="d-wish" aria-label="Wishlist">❤️</button>
            <button class="icon-btn" id="d-cmp" aria-label="Compare">⚖️</button>
          </div></div>
        <div class="tabs"><button class="on" data-tab="info">📋 Details</button><button data-tab="ship">🚚 Delivery</button><button data-tab="rev">⭐ Reviews (<span id="rc2">${p.rc}</span>)</button></div>
        <div id="tab-info"><p>${esc(p.desc)}</p>
          <div class="table-wrap"><table class="data"><tr><th>Attribute</th><th>Value</th></tr>
          <tr><td>Farming method</td><td>${esc(p.method)}</td></tr><tr><td>Organic</td><td>${p.organic?"Yes 🌱":"No"}</td></tr>
          <tr><td>Harvest date</td><td>${esc(p.harvest)}</td></tr><tr><td>Grade</td><td>${esc(p.grade)}</td></tr>
          <tr><td>Storage</td><td>${esc(p.storage)}</td></tr><tr><td>Origin</td><td>${esc(f.village||"")}, ${esc(f.district||"")}, ${esc(f.state||"Telangana")}</td></tr></table></div></div>
        <div id="tab-ship" style="display:none"><div class="card card-pad"><p>🚚 <b>Standard (3–5 days)</b> — ₹40, free over ₹499<br>⚡ <b>Express (1–2 days)</b> — ₹99<br>🏠 <b>Farmer pickup</b> — Free from ${esc(f.village||"farm")}</p>
          <button class="btn btn-outline btn-sm" id="d-bulk">📦 Request bulk quote</button></div></div>
        <div id="tab-rev" style="display:none"><div id="rev-list"></div>
          <div class="card card-pad" style="margin-top:12px"><h3>Write a review</h3><form id="rev-form"><div class="field"><label>Rating</label><select class="input" name="rating"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></div>
          <div class="field"><label>Title</label><input class="input" name="title" required placeholder="Sum it up"></div>
          <div class="field"><label>Review</label><textarea class="input" name="text" required placeholder="Quality, packing, delivery…"></textarea></div>
          <button class="btn btn-primary">Submit review</button></form></div></div>
      </div></div>
      <h2 style="margin-top:36px">You may also like</h2><div class="products-grid" id="rel"></div>`;
    // gallery
    $$("#detail [data-gal]").forEach(b => b.onclick = () => { $$("#detail [data-gal]").forEach(x=>x.classList.remove("on")); b.classList.add("on"); $("#detail .p-media .emoji").textContent = b.dataset.gal; });
    // qty + actions
    $("#q-minus").onclick = () => { qty = Math.max(1, qty-1); $("#q-val").textContent = qty; };
    $("#q-plus").onclick = () => { qty = Math.min(p.stock||99, qty+1); $("#q-val").textContent = qty; };
    $("#d-add").onclick = () => AM.addCart(p.id, qty);
    $("#d-buy").onclick = () => { AM.addCart(p.id, qty); location.href = "checkout.html"; };
    $("#d-wish").onclick = () => AM.toggleWish(p.id);
    $("#d-cmp").onclick = () => AM.toggleComp(p.id);
    $("#d-chat").onclick = () => AM.openChat(p.farmerId, p.id);
    $("#d-bulk").onclick = () => AM.bulkQuote(p.id);
    $$("#detail [data-tab]").forEach(b => b.onclick = () => { $$("#detail [data-tab]").forEach(x=>x.classList.remove("on")); b.classList.add("on"); ["info","ship","rev"].forEach(t => $("#tab-"+t).style.display = t === b.dataset.tab ? "" : "none"); });
    // reviews
    const drawRevs = () => {
      const mine = AM.reviews().filter(r => r.productId === p.id);
      $("#rev-list").innerHTML = mine.length ? mine.map(r => `<div class="card review-card" style="margin-bottom:10px"><span class="stars">${stars(r.rating)}</span><b>${esc(r.title)}</b><p class="small muted">${esc(r.text)}</p><span class="small"><b>${esc(r.user)}</b> ${r.verified?'<span class="badge b-green">✔ Verified buyer</span>':""} • ${esc(r.date)}</span></div>`).join("") : `<div class="empty">⭐<br>No reviews yet — be the first!</div>`;
    };
    drawRevs();
    $("#rev-form").onsubmit = e => { e.preventDefault(); if (!AM.validate(e.target)) return;
      const fd = new FormData(e.target); const all = AM.reviews();
      all.unshift({user:AM.me()?.name||"Guest", productId:p.id, rating:+fd.get("rating"), title:fd.get("title"), text:fd.get("text"), date:AM.fmtDate(new Date()), verified:!!AM.me()});
      AM.saveReviews(all); e.target.reset(); drawRevs(); AM.toast("⭐ Review published. Thank you!"); };
    // related
    $("#rel").innerHTML = prods().filter(x => x.cat === p.cat && x.id !== p.id).slice(0,3).map(pCard).join("");
    AM.bindCards($("#rel"));
  }

  /* ---------- CATEGORIES ---------- */
  if (page === "categories") {
    $("#all-cats").innerHTML = SEED.CATS.map(c => {
      const items = prods().filter(p => p.cat === c.id || (c.id === "organic" && p.organic));
      const from = items.length ? Math.min(...items.map(p=>p.price)) : 0;
      return `<div class="card cat-card" onclick="location.href='products.html?cat=${c.id}'" role="link" tabindex="0" onkeydown="if(event.key==='Enter')location.href='products.html?cat=${c.id}'">
        <span class="cat-ico" style="background:${c.grad}">${c.emoji}</span>
        <span style="flex:1"><b>${esc(c.name)}</b><span>${items.length} products • from ${inr(from)}</span><br><small class="muted">${esc(c.desc)}</small></span><span>→</span></div>`;
    }).join("");
  }

  /* ---------- FARMERS ---------- */
  if (page === "farmers") {
    const draw = (q="") => {
      const list = AM.farmers().filter(f => !q || (f.name+f.farm+f.district+f.village+f.crops.join(" ")).toLowerCase().includes(q.toLowerCase()));
      $("#farmer-grid").innerHTML = list.length ? list.map(f => `
        <div class="card f-card"><div class="avatar" style="background:${f.color}">${f.emoji}</div>
          <b>${esc(f.name)} ${f.verified?'<span class="verify">✔ verified</span>':'<span class="badge b-gold">pending</span>'}</b>
          <div class="small muted">${esc(f.farm)}<br>📍 ${esc(f.village)}, ${esc(f.district)}</div>
          <div class="rating" style="margin:8px 0">${stars(f.rating)} ${f.rating} <span class="muted">(${f.reviews})</span></div>
          <div class="small muted">🚜 ${esc(f.exp)} yrs • ${esc(f.size)} • ${esc(f.method)}</div>
          <div class="flex wrap" style="justify-content:center;margin-top:10px"><a class="btn btn-outline btn-sm" href="farmer-profile.html?id=${f.id}">Profile</a><button class="btn btn-ghost btn-sm" data-chat="${f.id}">💬 Chat</button></div></div>`).join("")
        : `<div class="empty card card-pad" style="grid-column:1/-1">🧑‍🌾<br>No farmers match your search.</div>`;
      $$("#farmer-grid [data-chat]").forEach(b => b.onclick = () => AM.openChat(b.dataset.chat));
    };
    $("#fq").addEventListener("input", e => draw(e.target.value));
    draw();
  }

  /* ---------- FARMER PROFILE ---------- */
  if (page === "farmer-profile") {
    const f = getFarmer(qs.get("id")) || AM.farmers()[0];
    $("#crumb-f").textContent = f.farm;
    const items = prods().filter(p => p.farmerId === f.id);
    $("#fprof").innerHTML = `<div class="card card-pad"><div class="flex wrap" style="gap:20px;align-items:flex-start">
      <div class="avatar" style="background:${f.color};width:100px;height:100px;font-size:3rem;margin:0">${f.emoji}</div>
      <div style="flex:1;min-width:220px"><h1 style="margin:0">${esc(f.farm)} ${f.verified?'<span class="badge b-blue">✔ Verified farmer</span>':'<span class="badge b-gold">Verification pending</span>'}</h1>
        <p class="muted">${esc(f.name)} • 📍 ${esc(f.village)}, ${esc(f.mandal||"")}, ${esc(f.district)}, ${esc(f.state)} • since ${f.since}</p>
        <div class="flex wrap"><span class="rating">${stars(f.rating)} ${f.rating} (${f.reviews} reviews)</span><span class="badge b-grey">🚜 ${esc(f.exp)} yrs</span><span class="badge b-grey">🌾 ${esc(f.size)}</span><span class="badge b-grey">🌱 ${esc(f.method)}</span></div>
        <p style="margin-top:10px">${esc(f.about)}</p>
        <div class="flex wrap"><button class="btn btn-primary btn-sm" id="fp-chat">💬 Message farmer</button><button class="btn btn-ghost btn-sm" id="fp-save">❤️ Save farmer</button><span class="small muted">📞 ${esc(f.phone)}</span></div></div></div></div>
      <h2 style="margin:26px 0 12px">Products from this farm (${items.length})</h2>
      <div class="products-grid">${items.length ? items.map(pCard).join("") : `<div class="empty card card-pad" style="grid-column:1/-1">📦<br>No products listed yet.</div>`}</div>`;
    bindCards($("#fprof"));
    $("#fp-chat").onclick = () => AM.openChat(f.id);
    $("#fp-save").onclick = () => { const s = AM.store.get("am_saved_farmers", []); if (!s.includes(f.id)) { s.push(f.id); AM.store.set("am_saved_farmers", s); AM.toast("❤️ Farmer saved to your list"); } else AM.toast("Already in your saved farmers", "", "warn"); };
  }

  /* ---------- COMPARE ---------- */
  if (page === "compare") {
    const draw = () => {
      const c = AM.comp().map(id => getProd(id)).filter(Boolean);
      $("#cmp-pick").innerHTML = `<label class="small"><b>Add product:</b></label> <select class="input" id="cmp-add" style="max-width:320px"><option value="">— choose —</option>${prods().filter(p=>!AM.comp().includes(p.id)).map(p=>`<option value="${p.id}">${esc(p.name)} — ${inr(p.price)}</option>`).join("")}</select>`;
      $("#cmp-add").onchange = e => { if (e.target.value) { AM.toggleComp(e.target.value); draw(); } };
      if (!c.length) { $("#cmp-table").innerHTML = `<div class="empty card card-pad">⚖️<br><h3>Nothing to compare yet</h3><p>Pick up to 3 products to compare side-by-side.</p><a class="btn btn-primary" href="products.html">Browse products</a></div>`; return; }
      const rows = [["Product", c.map(p=>`${p.emoji}<br><b>${esc(p.name)}</b><br><button class="btn btn-ghost btn-sm" data-rm="${p.id}">Remove</button>`)],
        ["Price", c.map(p=>`<b>${inr(p.price)}</b><small>/${esc(p.unit)}</small>`)],
        ["Farmer", c.map(p=>esc(getFarmer(p.farmerId)?.farm||""))],
        ["Location", c.map(p=>{const f=getFarmer(p.farmerId)||{};return `${esc(f.village||"")}, ${esc(f.district||"")}`;})],
        ["Rating", c.map(p=>`${stars(p.rating)} ${p.rating} (${p.rc})`)],
        ["Method", c.map(p=>esc(p.method))],["Organic", c.map(p=>p.organic?"🌱 Yes":"—")],
        ["Availability", c.map(p=>p.stock>0?`✅ In stock (${p.stock})`:"❌ Out")],
        ["Harvest", c.map(p=>esc(p.harvest))],["Grade", c.map(p=>esc(p.grade))],
        ["", c.map(p=>`<button class="btn btn-primary btn-sm" data-add="${p.id}">🛒 Add to cart</button>`)]];
      $("#cmp-table").innerHTML = `<div class="table-wrap"><table class="data"><tr><th></th>${c.map(p=>`<th>${p.emoji} ${esc(p.name.slice(0,18))}</th>`).join("")}</tr>
        ${rows.map(([h, vals])=>`<tr><td><b>${h}</b></td>${vals.map(v=>`<td>${v}</td>`).join("")}</tr>`).join("")}</table></div>`;
      AM.bindCards($("#cmp-table"));
      $$("#cmp-table [data-rm]").forEach(b => b.onclick = () => { AM.toggleComp(b.dataset.rm); draw(); });
    };
    draw();
  }
});
