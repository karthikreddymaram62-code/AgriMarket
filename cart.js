/* AgriMarket — cart, wishlist, checkout, orders */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  const {$, $$, esc, inr, cartDetailed, cartSubtotal, setCart, wish, getProd, getFarmer, validate, toast, inr:_, fmtDate} = AM;
  const qs = new URLSearchParams(location.search);

  /* ---------- CART ---------- */
  if (page === "cart") {
    const showWish = qs.get("wish") === "1";
    const draw = () => {
      const items = cartDetailed();
      const sub = cartSubtotal();
      const del = items.length === 0 ? 0 : sub >= 499 ? 0 : 40;
      const disc = sub >= 999 ? Math.round(sub * .1) : 0;
      $("#cart-items").innerHTML = items.length ? items.map(({p, qty}) => `
        <div class="card card-pad" style="margin-bottom:12px"><div class="flex wrap" style="align-items:flex-start">
          <span style="font-size:3rem;background:var(--card-2);border-radius:14px;padding:10px 14px">${p.emoji}</span>
          <span style="flex:1;min-width:180px"><b><a href="product-details.html?id=${p.id}" style="color:var(--ink)">${esc(p.name)}</a></b><br>
            <small class="muted">${esc(getFarmer(p.farmerId)?.farm||"")} • ${inr(p.price)}/${esc(p.unit)}</small>
            <span class="flex" style="margin-top:10px"><span class="flex" style="border:1.5px solid var(--line-strong);border-radius:10px;overflow:hidden">
              <button class="btn btn-ghost btn-sm" style="border:0" data-dec="${p.id}">−</button><b style="min-width:36px;text-align:center">${qty}</b><button class="btn btn-ghost btn-sm" style="border:0" data-inc="${p.id}">+</button></span>
              <button class="btn btn-ghost btn-sm" data-later="${p.id}">💾 Save for later</button>
              <button class="btn btn-ghost btn-sm" data-rem="${p.id}">🗑️ Remove</button></span></span>
          <b>${inr(p.price*qty)}</b></div></div>`).join("")
        : `<div class="empty card card-pad"><span class="big">🛒</span><h3>Your cart is empty</h3><p>Discover fresh products from local farmers.</p><a class="btn btn-primary" href="products.html">Browse marketplace</a></div>`;
      $("#sum-sub").textContent = inr(sub);
      $("#sum-del").innerHTML = del === 0 && items.length ? '<span class="badge b-green">FREE</span>' : inr(del);
      $("#sum-disc").textContent = "−" + inr(disc);
      $("#sum-total").textContent = inr(sub + del - disc);
      $("#free-bar").innerHTML = sub >= 499 ? `🎉 You've unlocked <b>FREE delivery</b>!` : `Add <b>${inr(499-sub)}</b> more for free delivery`;
      $("#free-fill").style.width = Math.min(100, sub/499*100) + "%";
      $("#checkout-btn").disabled = !items.length;
      // later
      const later = AM.store.get("am_later", []);
      $("#later-sec").style.display = later.length ? "" : "none";
      $("#later-items").innerHTML = later.map(pid => { const p = getProd(pid); if (!p) return ""; return `<span class="chip">${p.emoji} ${esc(p.name)} <a href="#" data-back="${pid}">↩ move to cart</a></span>`; }).join("");
      // wishlist
      const w = wish().map(getProd).filter(Boolean);
      $("#wish-items").innerHTML = w.length ? w.map(p => `<span class="chip">${p.emoji} ${esc(p.name)} <a href="#" data-w2c="${p.id}">→ cart</a> <a href="#" data-wrm="${p.id}">✕</a></span>`).join("") : `<p class="muted small">No saved items yet. Tap ❤️ on any product.</p>`;
      // bind
      $$("#cart-items [data-inc]").forEach(b => b.onclick = () => chQty(b.dataset.inc, 1));
      $$("#cart-items [data-dec]").forEach(b => b.onclick = () => chQty(b.dataset.dec, -1));
      $$("#cart-items [data-rem]").forEach(b => b.onclick = () => { setCart(AM.cart().filter(i=>i.pid!==b.dataset.rem)); toast("🗑️ Removed from cart"); draw(); });
      $$("#cart-items [data-later]").forEach(b => b.onclick = () => { const l = AM.store.get("am_later", []); if(!l.includes(b.dataset.later)) l.push(b.dataset.later); AM.store.set("am_later", l); setCart(AM.cart().filter(i=>i.pid!==b.dataset.later)); toast("💾 Saved for later"); draw(); });
      $$("#later-items [data-back]").forEach(a => a.onclick = e => { e.preventDefault(); AM.addCart(a.dataset.back, 1); AM.store.set("am_later", AM.store.get("am_later", []).filter(x=>x!==a.dataset.back)); draw(); });
      $$("#wish-items [data-w2c]").forEach(a => a.onclick = e => { e.preventDefault(); AM.addCart(a.dataset.w2c, 1); AM.toggleWish(a.dataset.w2c); draw(); });
      $$("#wish-items [data-wrm]").forEach(a => a.onclick = e => { e.preventDefault(); AM.toggleWish(a.dataset.wrm); draw(); });
    };
    const chQty = (pid, d) => { const c = AM.cart(); const it = c.find(i=>i.pid===pid); if (!it) return; it.qty += d; if (it.qty <= 0) c.splice(c.indexOf(it),1); setCart(c); draw(); };
    $("#clear-cart").onclick = () => { if (!AM.cart().length) return; if (confirm("Clear the whole cart?")) { setCart([]); toast("🗑️ Cart cleared"); draw(); } };
    $("#checkout-btn").onclick = () => location.href = "checkout.html";
    if (showWish) setTimeout(() => $("#wish-sec").scrollIntoView({behavior:"smooth"}), 400);
    draw();
  }

  /* ---------- CHECKOUT ---------- */
  if (page === "checkout") {
    let step = 1;
    const order = {addr:null, delivery:"Standard Delivery", pay:"UPI", upi:"", card:{}};
    const items = cartDetailed();
    if (!items.length) { $("#ck-main").innerHTML = `<div class="empty card card-pad"><span class="big">🛒</span><h3>Your cart is empty</h3><a class="btn btn-primary" href="products.html">Shop now</a></div>`; return; }
    const sub = cartSubtotal();
    const fees = () => order.delivery === "Express Delivery" ? 99 : order.delivery === "Farmer Pickup" ? 0 : sub >= 499 ? 0 : 40;
    const total = () => sub + fees();
    const LOC = SEED.LOCATIONS.Telangana;
    const paintSteps = () => {
      $$(".step").forEach((s,i) => { s.className = "step" + (i+1 < step ? " done" : i+1 === step ? " now" : ""); });
      ["addr","del","pay","done"].forEach((k,i) => $("#ck-"+k).style.display = i+1 === step ? "" : "none");
    };
    // step 1: address
    $("#ck-dist").innerHTML = `<option value="">District</option>` + Object.keys(LOC).map(d=>`<option>${esc(d)}</option>`).join("");
    $("#ck-dist").onchange = e => { const m = LOC[e.target.value]||{}; $("#ck-mandal").innerHTML = `<option value="">Mandal</option>` + Object.keys(m).map(x=>`<option>${esc(x)}</option>`).join(""); $("#ck-village").innerHTML = `<option value="">Village</option>`; };
    $("#ck-mandal").onchange = e => { const v = (LOC[$("#ck-dist").value]||{})[e.target.value]||[]; $("#ck-village").innerHTML = `<option value="">Village</option>` + v.map(x=>`<option>${esc(x)}</option>`).join(""); };
    const saved = AM.store.get(AM.K.addr, []);
    $("#saved-addr").innerHTML = saved.length ? saved.map((a,i)=>`<label class="check addr-card" style="margin-bottom:8px"><input type="radio" name="saddr" value="${i}"> <span><b>${esc(a.name)}</b> • ${esc(a.phone)}<br><small>${esc(a.line)}, ${esc(a.village)}, ${esc(a.district)} — ${esc(a.pin)}</small></span></label>`).join("") : `<p class="small muted">No saved addresses yet.</p>`;
    $$("input[name=saddr]").forEach(r => r.onchange = () => { order.addr = saved[+r.value]; });
    $("#to-del").onclick = () => {
      if (!order.addr) {
        if (!validate($("#addr-form"))) { toast("⚠️ Please fill the required address fields", "", "warn"); return; }
        const fd = new FormData($("#addr-form"));
        order.addr = {name:fd.get("name"), phone:fd.get("phone"), line:fd.get("line"), district:fd.get("district"), mandal:fd.get("mandal"), village:fd.get("village"), pin:fd.get("pin")};
        const all = AM.store.get(AM.K.addr, []); all.push(order.addr); AM.store.set(AM.K.addr, all);
      }
      step = 2; paintSteps();
    };
    // step 2: delivery
    $$("input[name=del]").forEach(r => r.onchange = () => { order.delivery = r.value; paintSummary(); });
    $("#to-pay").onclick = () => { step = 3; paintSteps(); };
    $("#back-addr").onclick = () => { step = 1; paintSteps(); };
    // step 3: payment
    $$("input[name=pay]").forEach(r => r.onchange = () => {
      order.pay = r.value;
      $("#pay-upi").style.display = r.value === "UPI" ? "" : "none";
      $("#pay-card").style.display = r.value === "Credit/Debit Card" ? "" : "none";
      $("#pay-net").style.display = r.value === "Net Banking" ? "" : "none";
    });
    $("#back-del").onclick = () => { step = 2; paintSteps(); };
    $("#place-order").onclick = async () => {
      const btn = $("#place-order"); btn.disabled = true; btn.textContent = "Processing… (demo)";
      await Services.payments.createOrder(total());
      setTimeout(() => {
        const o = AM.placeOrder({id:"ORD-2026-" + Math.floor(1000+Math.random()*9000), userId:AM.me()?.id||"guest",
          items:AM.cart().map(i=>({...i})), sub, fee:fees(), total:total(), status:"Confirmed",
          pay:order.pay, date:new Date().toISOString().slice(0,10), eta:"Sep 22, 2026",
          addr:`${order.addr.name}, ${order.addr.line}, ${order.addr.village}, ${order.addr.district} — ${order.addr.pin}`,
          delivery:order.delivery, timeline:[{s:"Order Placed", t:"Just now"}]});
        step = 4; paintSteps();
        $("#done-box").innerHTML = `<div class="center"><div style="font-size:4rem">🎉</div><h2>Order placed!</h2>
          <p>Order <b>${o.id}</b> • ${inr(o.total)} • ${esc(o.pay)} (demo, no money moved)</p>
          <ol class="timeline" style="text-align:left;max-width:320px;margin:20px auto"><li class="done"><b>Order Placed</b><small>Just now</small></li><li class="done"><b>Confirmed</b><small>Farmer notified</small></li><li><b>Preparing</b><small>Harvest & pack</small></li><li><b>Shipped → Delivered</b><small>ETA ${esc(o.eta)}</small></li></ol>
          <div class="flex wrap" style="justify-content:center"><a class="btn btn-primary" href="orders.html">📦 Track order</a><a class="btn btn-outline" href="products.html">Continue shopping</a></div></div>`;
      }, 1200);
    };
    // summary
    const paintSummary = () => {
      $("#ck-items").innerHTML = items.map(({p, qty}) => `<div class="flex between small" style="padding:6px 0;border-bottom:1px solid var(--line)"><span>${p.emoji} ${esc(p.name)} × ${qty}</span><b>${inr(p.price*qty)}</b></div>`).join("");
      $("#ck-sub").textContent = inr(sub); $("#ck-fee").textContent = inr(fees()); $("#ck-total").textContent = inr(total());
    };
    paintSummary(); paintSteps();
  }

  /* ---------- ORDERS LIST ---------- */
  if (page === "orders") {
    const list = AM.myOrders();
    $("#orders-list").innerHTML = list.length ? list.map(o => {
      const n = o.items.reduce((a,i)=>a+(i.qty||1),0);
      return `<div class="order-card"><div class="flex between wrap"><span><b>${o.id}</b> <span class="badge b-grey">${esc(o.date)}</span></span>
        <span><span class="status-dot st-${o.status.split(" ")[0]}"></span><b>${esc(o.status)}</b></span></div>
        <div class="small muted">${n} item(s) • ${esc(o.pay)} • ${esc(o.delivery||"")} • ETA ${esc(o.eta||"—")}</div>
        <div class="flex between wrap" style="margin-top:10px"><b>${inr(o.total)}</b>
        <span class="flex wrap"><a class="btn btn-outline btn-sm" href="order-details.html?id=${o.id}">View & track</a>
        ${["New","Confirmed"].includes(o.status)?`<button class="btn btn-ghost btn-sm" data-cancel="${o.id}">Cancel</button>`:""}
        ${o.status==="Delivered"?`<button class="btn btn-gold btn-sm" data-reorder="${o.id}">↻ Reorder</button>`:""}</span></div></div>`;
    }).join("") : `<div class="empty card card-pad"><span class="big">📦</span><h3>No orders yet</h3><p>Your orders and live tracking will appear here.</p><a class="btn btn-primary" href="products.html">Start shopping</a></div>`;
    $$("#orders-list [data-cancel]").forEach(b => b.onclick = () => { if (confirm("Cancel this order?")) { AM.setOrderStatus(b.dataset.cancel, "Cancelled"); location.reload(); } });
    $$("#orders-list [data-reorder]").forEach(b => b.onclick = () => { const o = AM.orders().find(x=>x.id===b.dataset.reorder); o.items.forEach(i=>AM.addCart(i.pid, i.qty||1)); location.href = "cart.html"; });
  }

  /* ---------- ORDER DETAILS ---------- */
  if (page === "order-details") {
    const o = AM.orders().find(x => x.id === qs.get("id")) || AM.myOrders()[0];
    if (!o) { $("#od").innerHTML = `<div class="empty card card-pad">📦<br>Order not found. <a href="orders.html">Back to orders</a></div>`; return; }
    const flow = ["Order Placed","Confirmed","Preparing","Shipped","Out for Delivery","Delivered"];
    const idx = o.status === "Cancelled" ? -1 : o.status === "New" ? 0 : flow.indexOf(o.status);
    $("#od").innerHTML = `<div class="grid grid-2" style="gap:20px">
      <div class="card card-pad"><h2>${o.id}</h2><p class="muted small">Placed ${esc(o.date)} • ${esc(o.pay)} • ETA ${esc(o.eta||"—")}</p>
        ${o.status==="Cancelled" ? `<p><span class="badge b-red">Cancelled</span></p>` : `<ol class="timeline">${flow.map((s,i)=>`<li class="${i<=idx?"done":""}"><b>${s}</b><small>${i<=idx?"Completed":"Pending"}</small></li>`).join("")}</ol>`}
        <p class="small">📍 Deliver to: ${esc(o.addr||"")}</p></div>
      <div class="card card-pad"><h3>Items</h3>${o.items.map(i => { const p = getProd(i.pid)||{name:i.pid,emoji:"📦",price:0,unit:""}; return `<div class="flex between small" style="padding:8px 0;border-bottom:1px solid var(--line)"><span>${p.emoji} ${esc(p.name)} × ${i.qty||1}</span><b>${inr((p.price||0)*(i.qty||1))}</b></div>`; }).join("")}
        <div class="flex between" style="margin-top:12px"><span>Subtotal</span><b>${inr(o.sub||o.total)}</b></div>
        <div class="flex between"><span>Delivery</span><b>${inr(o.fee||0)}</b></div>
        <div class="flex between" style="font-size:1.15rem"><span><b>Total</b></span><b>${inr(o.total)}</b></div>
        <div class="flex wrap" style="margin-top:14px"><a class="btn btn-outline btn-sm" href="orders.html">← All orders</a>
        ${o.status==="Delivered"?`<button class="btn btn-gold btn-sm" id="od-re">↻ Reorder</button>`:""}</div></div></div>`;
    $("#od-re") && ($("#od-re").onclick = () => { o.items.forEach(i=>AM.addCart(i.pid, i.qty||1)); location.href = "cart.html"; });
  }
});
