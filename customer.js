/* AgriMarket — customer dashboard + info pages */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  const {$, $$, esc, inr, pCard, bindCards, stars, getProd, getFarmer} = AM;

  if (page === "customer") {
    const m = AM.me(); if (!m) return;
    $("#c-name").textContent = m.name.split(" ")[0];
    const orders = AM.myOrders();
    const spent = orders.filter(o=>o.status!=="Cancelled").reduce((a,o)=>a+o.total,0);
    $("#kpi").innerHTML = [
      ["📦", orders.length, "Total orders"], ["💰", inr(spent), "Total spent"],
      ["❤️", AM.wish().length, "Wishlist items"], ["🔔", AM.unread(), "Unread alerts"]
    ].map(([i,v,l])=>`<div class="kpi"><span class="k-ico" style="background:var(--brand-100)">${i}</span><span><b>${v}</b><span>${l}</span></span></div>`).join("");
    // tabs
    const show = t => {
      $$("#c-tabs button").forEach(b => b.classList.toggle("on", b.dataset.t === t));
      $$(".c-pane").forEach(p => p.style.display = p.id === "pane-"+t ? "" : "none");
    };
    $$("#c-tabs button").forEach(b => b.onclick = () => show(b.dataset.t));
    show("overview");
    // overview
    $("#ov-orders").innerHTML = orders.slice(0,3).map(o=>`<div class="order-card"><div class="flex between"><b>${o.id}</b><b>${esc(o.status)}</b></div><div class="small muted">${esc(o.date)} • ${inr(o.total)}</div><a class="btn btn-outline btn-sm" style="margin-top:8px" href="order-details.html?id=${o.id}">Track</a></div>`).join("") || `<div class="empty">📦<br>No orders yet. <a href="products.html">Shop now</a></div>`;
    const rec = [...AM.prods()].sort((a,b)=>b.rating-a.rating).slice(0,3);
    $("#ov-rec").innerHTML = rec.map(pCard).join(""); bindCards($("#ov-rec"));
    // orders pane
    $("#pane-orders").innerHTML = orders.length ? orders.map(o=>`<div class="order-card"><div class="flex between wrap"><b>${o.id}</b><span><span class="status-dot st-${o.status.split(" ")[0]}"></span>${esc(o.status)}</span></div><div class="small muted">${esc(o.date)} • ${inr(o.total)} • ${esc(o.pay)}</div><a class="btn btn-outline btn-sm" style="margin-top:8px" href="order-details.html?id=${o.id}">View & track</a></div>`).join("") : `<div class="empty">📦<br>No orders yet.</div>`;
    // wishlist pane
    const wp = AM.wish().map(getProd).filter(Boolean);
    $("#pane-wish").innerHTML = wp.length ? `<div class="products-grid">${wp.map(pCard).join("")}</div>` : `<div class="empty">❤️<br>Wishlist is empty.</div>`;
    bindCards($("#pane-wish"));
    // addresses
    const drawAddr = () => {
      const all = AM.store.get(AM.K.addr, []);
      $("#pane-addr").innerHTML = (all.length ? `<div class="grid grid-2">` + all.map((a,i)=>`<div class="addr-card ${i===0?"def":""}"><b>${esc(a.name)}</b> ${i===0?'<span class="badge b-green">Default</span>':""}<br><small>${esc(a.line)}, ${esc(a.village)}, ${esc(a.district)} — ${esc(a.pin)}<br>📞 ${esc(a.phone)}</small><div style="margin-top:8px"><button class="btn btn-ghost btn-sm" data-adel="${i}">Delete</button></div></div>`).join("") + `</div>` : `<div class="empty">📍<br>No saved addresses.</div>`)
        + `<form id="addr-add" class="card card-pad" style="margin-top:14px"><h3>Add address</h3><div class="form-row"><div class="field"><label>Name *</label><input class="input" name="name" required></div><div class="field"><label>Phone *</label><input class="input" name="phone" required></div></div><div class="field"><label>Address *</label><input class="input" name="line" required></div><div class="form-row"><div class="field"><label>Village</label><input class="input" name="village"></div><div class="field"><label>District</label><input class="input" name="district"></div></div><div class="field"><label>PIN</label><input class="input" name="pin"></div><button class="btn btn-primary">Save address</button></form>`;
      $$("#pane-addr [data-adel]").forEach(b => b.onclick = () => { const a = AM.store.get(AM.K.addr, []); a.splice(+b.dataset.adel,1); AM.store.set(AM.K.addr, a); drawAddr(); });
      $("#addr-add").onsubmit = e => { e.preventDefault(); if(!AM.validate(e.target)) return; const fd = new FormData(e.target); const a = AM.store.get(AM.K.addr, []); a.push(Object.fromEntries(fd)); AM.store.set(AM.K.addr, a); AM.toast("📍 Address saved"); drawAddr(); };
    };
    drawAddr();
    // reviews pane
    $("#pane-rev").innerHTML = AM.reviews().filter(r=>r.user===m.name).map(r=>{const p=getProd(r.productId)||{};return `<div class="card review-card" style="margin-bottom:10px"><span class="stars">${stars(r.rating)}</span><b>${esc(r.title)}</b> <span class="muted small">on ${esc(p.name||"")}</span><p class="small">${esc(r.text)}</p></div>`;}).join("") || `<div class="empty">⭐<br>You haven't reviewed anything yet.</div>`;
    // notifications
    const drawN = () => {
      const ns = AM.notifs().filter(n=>n.role==="customer"||n.role==="all");
      $("#pane-notif").innerHTML = ns.length ? ns.map(n=>`<div class="notif ${n.read?"":"unread"}"><span class="n-ico">🔔</span><span><b>${esc(n.title)}</b><br><small>${esc(n.body)}</small><time>${new Date(n.time).toLocaleString("en-IN")}</time></span></div>`).join("") : `<div class="empty">🔕<br>No notifications.</div>`;
    };
    drawN();
    // profile
    $("#prof-form").innerHTML = `<div class="form-row"><div class="field"><label>Name</label><input class="input" name="name" value="${esc(m.name)}"></div><div class="field"><label>Phone</label><input class="input" name="phone" value="${esc(m.phone||"")}"></div></div><div class="field"><label>Email</label><input class="input" value="${esc(m.email)}" disabled></div><button class="btn btn-primary">Save profile</button>`;
    $("#prof-form").onsubmit = e => { e.preventDefault(); const fd = new FormData(e.target); const u = AM.me(); u.name = fd.get("name"); u.phone = fd.get("phone"); AM.store.set(AM.K.user, u); AM.toast("✅ Profile updated"); setTimeout(()=>location.reload(), 600); };
    // saved farmers + recent
    const sf = AM.store.get("am_saved_farmers", []).map(getFarmer).filter(Boolean);
    $("#pane-saved").innerHTML = sf.length ? sf.map(f=>`<div class="card card-pad" style="margin-bottom:10px"><b>${esc(f.farm)}</b> <span class="muted small">• ${esc(f.village)}, ${esc(f.district)}</span><br><a class="btn btn-outline btn-sm" style="margin-top:8px" href="farmer-profile.html?id=${f.id}">Visit farm</a></div>`).join("") : `<div class="empty">💚<br>No saved farmers yet.</div>`;
    const rc = AM.store.get(AM.K.recent, []).map(getProd).filter(Boolean);
    $("#pane-recent").innerHTML = rc.length ? `<div class="products-grid">${rc.map(pCard).join("")}</div>` : `<div class="empty">👁️<br>Nothing viewed yet.</div>`;
    bindCards($("#pane-recent"));
  }

  /* ---------- FAQ ---------- */
  if (page === "faq") {
    const QA = [
      ["How do I place an order?","Browse the marketplace → open a product → Add to cart → Checkout (Address → Delivery → Demo Payment → Confirmation). You'll get an order ID to track."],
      ["How do I register as a farmer?","Go to Register → Seller account, fill farm details and submit. Admin verifies within 24–48 hrs (demo: instantly visible in admin panel)."],
      ["What is farmer verification?","Admins check ID, farm location and documents. Verified farmers get a ✔ badge and higher buyer trust."],
      ["Can I order in bulk for my hotel/shop?","Yes! Open any product → Request Bulk Quote, or chat with the farmer. Bulk pricing applies above ~50–100 kg."],
      ["Which payment methods are supported?","UPI, Credit/Debit cards, Net Banking and Cash on Delivery. This demo performs no real charging."],
      ["How do I track my order?","Orders page → View & track. Timeline: Placed → Confirmed → Preparing → Shipped → Out for Delivery → Delivered."],
      ["Can I cancel an order?","Orders in New/Confirmed status can be cancelled from the Orders page. Later stages need farmer support."],
      ["How are prices decided?","Farmers set prices; AgriMarket shows mandi reference rates for transparency. No hidden margins."],
      ["How do I contact a farmer?","Tap 💬 Chat on any product or farmer profile. Demo chat stores messages in your browser."],
      ["Is there a mobile app?","The site is fully mobile-responsive. Native apps are on the roadmap."]
    ];
    $("#faq-list").innerHTML = QA.map(([q,a],i)=>`<div class="acc-item ${i===0?"open":""}"><button class="acc-q">${esc(q)}<span>＋</span></button><div class="acc-a">${esc(a)}</div></div>`).join("");
    $$("#faq-list .acc-q").forEach(b => b.onclick = () => b.parentElement.classList.toggle("open"));
    $("#faq-q").addEventListener("input", e => { const q = e.target.value.toLowerCase(); $$("#faq-list .acc-item").forEach(it => it.style.display = it.textContent.toLowerCase().includes(q) ? "" : "none"); });
  }

  /* ---------- CONTACT ---------- */
  if (page === "contact" && $("#ct-form")) {
    $("#ct-form").onsubmit = e => { e.preventDefault(); if (!AM.validate(e.target)) return;
      const all = AM.store.get("am_enquiry", []); all.unshift({id:AM.uid("ENQ"), ...Object.fromEntries(new FormData(e.target)), time:Date.now()}); AM.store.set("am_enquiry", all);
      e.target.reset(); AM.toast("✉️ Message sent! We reply within 24 hrs (demo)."); };
  }
});
