/* AgriMarket — farmer dashboard (seller app) */
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page !== "farmer") return;
  const {$, $$, esc, inr, prods, saveProds, getFarmer, stars} = AM;
  const m = AM.me(); if (!m) return;
  const myId = m.farmerId || "f1";
  const F = () => getFarmer(myId) || AM.farmers()[0];
  const mine = () => prods().filter(p => p.farmerId === myId);
  const myOrders = () => AM.orders().filter(o => o.items.some(i => mine().some(p=>p.id===i.pid) || true)); // demo: all visible

  /* sidebar */
  const TABS = [["ov","📊 Overview"],["prods","📦 Products"],["add","➕ Add Product"],["orders","🧾 Orders"],["inv","🏬 Inventory"],["cust","👥 Customers"],["earn","💰 Earnings"],["rev","⭐ Reviews"],["analytics","📈 Analytics"],["set","⚙️ Settings"]];
  $("#f-side").innerHTML = `<span class="role-pill">Farmer</span><div style="padding:12px 4px"><b>${esc(F().farm)}</b><br><small class="muted">${esc(F().name)} • ${F().verified?"✔ verified":"⏳ pending"}</small></div>` + TABS.map(([t,l])=>`<a href="#" data-ft="${t}">${l}</a>`).join("");
  const show = t => { $$("#f-side a").forEach(a=>a.classList.toggle("on", a.dataset.ft===t)); $$(".f-pane").forEach(p=>p.style.display = p.id === "fp-"+t ? "" : "none"); if (t==="analytics") drawCharts(); };
  $$("#f-side a").forEach(a => a.onclick = e => { e.preventDefault(); show(a.dataset.ft); });

  const earnings = () => myOrders().filter(o=>o.status!=="Cancelled").reduce((a,o)=>a+Math.round(o.total*0.35),0);

  /* OVERVIEW */
  const refreshOv = () => {
    const ms = mine(), low = ms.filter(p=>p.stock>0&&p.stock<50).length, out = ms.filter(p=>p.stock<=0).length;
    $("#fp-ov").innerHTML = `<div class="kpi-grid">
      ${[["📦",ms.length,"Live products"],["🧾",myOrders().length,"Orders"],["💰",inr(earnings()),"Earnings (demo)"],["⭐",F().rating+"★","Avg rating"]].map(([i,v,l])=>`<div class="kpi"><span class="k-ico" style="background:var(--brand-100)">${i}</span><span><b>${v}</b><span>${l}</span></span></div>`).join("")}</div>
      <div class="grid grid-2"><div class="panel"><h3>⚠️ Needs attention</h3>
        ${low||out?`<p>${low} low-stock • ${out} out-of-stock</p><button class="btn btn-outline btn-sm" onclick="document.querySelector('[data-ft=inv]').click()">Open inventory</button>`:`<p class="muted">All stocked up. Great job! 🎉</p>`}
        ${!F().verified?`<p class="evidence" style="margin-top:10px">⏳ Your farm is pending admin verification. Verified farms get 3× more orders.</p>`:""}</div>
      <div class="panel"><h3>🧾 Latest orders</h3>${myOrders().slice(0,3).map(o=>`<div class="flex between small" style="padding:6px 0;border-bottom:1px solid var(--line)"><b>${o.id}</b><span>${esc(o.status)}</span><b>${inr(o.total)}</b></div>`).join("")||"<p class='muted'>No orders yet.</p>"}</div></div>`;
  };

  /* PRODUCTS */
  const refreshProds = () => {
    $("#fp-prods").innerHTML = `<div class="dash-head"><h2>Products (${mine().length})</h2><button class="btn btn-primary btn-sm" onclick="document.querySelector('[data-ft=add]').click()">➕ Add product</button></div>
    <div class="table-wrap"><table class="data"><tr><th>Product</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
    ${mine().map(p=>`<tr><td>${p.emoji} <b>${esc(p.name)}</b><br><small class="muted">${esc(p.cat)} • ${esc(p.harvest)}</small></td><td><b>${inr(p.price)}</b><small>/${esc(p.unit)}</small></td><td>${p.stock}</td>
      <td>${p.stock<=0?'<span class="badge b-red">Out</span>':p.stock<50?'<span class="badge b-gold">Low</span>':'<span class="badge b-green">Live</span>'} ${p.draft?'<span class="badge b-grey">Draft</span>':""}</td>
      <td class="flex wrap"><button class="btn btn-ghost btn-sm" data-fedit="${p.id}">✏️</button><button class="btn btn-ghost btn-sm" data-fpub="${p.id}">${p.draft?"🚀 Publish":"📥 Draft"}</button><button class="btn btn-ghost btn-sm" data-fdel="${p.id}">🗑️</button></td></tr>`).join("")||`<tr><td colspan="5" class="empty">No products yet.</td></tr>`}</table></div>`;
    $$("#fp-prods [data-fdel]").forEach(b => b.onclick = () => { if(!confirm("Archive this product?")) return; saveProds(prods().filter(p=>p.id!==b.dataset.fdel)); AM.toast("🗑️ Product archived"); refreshAll(); });
    $$("#fp-prods [data-fpub]").forEach(b => b.onclick = () => { const all = prods(); const p = all.find(x=>x.id===b.dataset.fpub); p.draft = !p.draft; saveProds(all); AM.toast(p.draft?"📥 Moved to draft":"🚀 Product published!"); refreshAll(); });
    $$("#fp-prods [data-fedit]").forEach(b => b.onclick = () => editProduct(b.dataset.fedit));
  };
  const editProduct = (pid) => {
    const p = prods().find(x=>x.id===pid);
    AM.modal("✏️ Edit " + p.name, `<form id="edit-f"><div class="form-row"><div class="field"><label>Price (₹)</label><input class="input" name="price" type="number" value="${p.price}" required></div>
      <div class="field"><label>Stock</label><input class="input" name="stock" type="number" value="${p.stock}" required></div></div>
      <div class="field"><label>Badge</label><input class="input" name="badge" value="${esc(p.badge||"")}"></div>
      <button class="btn btn-primary btn-block">Save changes</button></form>`);
    $("#edit-f").onsubmit = e => { e.preventDefault(); const fd = new FormData(e.target); p.price = +fd.get("price"); p.stock = +fd.get("stock"); p.badge = fd.get("badge"); saveProds(prods()); AM.closeModal(); AM.toast("✅ Product updated — marketplace reflects it instantly"); refreshAll(); };
  };

  /* ADD PRODUCT */
  $("#fp-add").innerHTML = `<div class="dash-head"><h2>Add a product</h2></div>
    <form id="add-f" class="panel"><div class="form-row">
      <div class="field"><label>Product name *</label><input class="input" name="name" required placeholder="e.g. Desi Tomato"></div>
      <div class="field"><label>Category *</label><select class="input" name="cat">${SEED.CATS.map(c=>`<option value="${c.id}">${c.emoji} ${esc(c.name)}</option>`).join("")}</select></div></div>
      <div class="field"><label>Description</label><textarea class="input" name="desc" placeholder="Variety, quality, harvest notes…"></textarea></div>
      <div class="form-row"><div class="field"><label>Price (₹) *</label><input class="input" name="price" type="number" min="1" required></div>
      <div class="field"><label>Unit</label><select class="input" name="unit"><option>kg</option><option>quintal</option><option>tonne</option><option>litre</option><option>dozen</option><option>piece</option><option>box</option><option>bunch</option></select></div></div>
      <div class="form-row"><div class="field"><label>Stock qty *</label><input class="input" name="stock" type="number" min="0" required></div>
      <div class="field"><label>Harvest date</label><input class="input" name="harvest" type="date" value="2026-09-15"></div></div>
      <div class="form-row"><div class="field"><label>Method</label><select class="input" name="method"><option>Organic</option><option>Natural</option><option>Conventional</option><option>Protected Cultivation</option></select></div>
      <div class="field"><label>Emoji icon</label><select class="input" name="emoji"><option>🍅</option><option>🥭</option><option>🌾</option><option>🥬</option><option>🌶️</option><option>🥜</option><option>🍌</option><option>🥛</option><option>🧅</option><option>🌽</option></select></div></div>
      <label class="check"><input type="checkbox" name="organic" checked> Certified / grown organic</label>
      <div class="flex wrap" style="margin-top:14px"><button class="btn btn-primary" name="act" value="live">🚀 Publish product</button><button class="btn btn-ghost" name="act" value="draft">📥 Save as draft</button></div></form>`;
  $("#add-f").onsubmit = e => {
    e.preventDefault(); if (!AM.validate(e.target)) return;
    const fd = new FormData(e.target);
    const all = prods();
    all.unshift({id:AM.uid("p"), name:fd.get("name"), cat:fd.get("cat"), farmerId:myId, price:+fd.get("price"), mrp:Math.round(+fd.get("price")*1.2), unit:fd.get("unit"), rating:4.0, rc:0, organic:!!fd.get("organic"), stock:+fd.get("stock"), harvest:fd.get("harvest")||"2026-09-15", method:fd.get("method"), grade:"A", emoji:fd.get("emoji"), badge:"New", draft:e.submitter.value==="draft", desc:fd.get("desc")||"Fresh from "+F().farm, storage:"Cool, dry place", moq:"1 "+fd.get("unit")});
    saveProds(all); e.target.reset(); AM.toast("🎉 Product added! Check the marketplace."); refreshAll(); show("prods");
  };

  /* ORDERS */
  const refreshOrders = () => {
    const sts = ["New","Confirmed","Preparing","Ready","Shipped","Delivered","Cancelled"];
    $("#fp-orders").innerHTML = `<div class="dash-head"><h2>Incoming orders (${myOrders().length})</h2></div>
    <div class="table-wrap"><table class="data"><tr><th>Order</th><th>Items</th><th>Total</th><th>Status</th><th>Update</th></tr>
    ${myOrders().map(o=>`<tr><td><b>${o.id}</b><br><small class="muted">${esc(o.date)}</small></td><td>${o.items.map(i=>{const p=prods().find(x=>x.id===i.pid);return p?`${p.emoji}×${i.qty||1}`:"";}).join(" ")}</td><td><b>${inr(o.total)}</b></td>
      <td><span class="status-dot st-${o.status.split(" ")[0]}"></span>${esc(o.status)}</td>
      <td><select class="input" data-ost="${o.id}" style="min-height:38px">${sts.map(s=>`<option ${s===o.status?"selected":""}>${s}</option>`).join("")}</select></td></tr>`).join("")||`<tr><td colspan="5" class="empty">No orders yet.</td></tr>`}</table></div>`;
    $$("#fp-orders [data-ost]").forEach(s => s.onchange = () => { AM.setOrderStatus(s.dataset.ost, s.value); AM.toast(`📦 ${s.dataset.ost} → ${s.value}`); refreshAll(); });
  };

  /* INVENTORY */
  const refreshInv = () => {
    $("#fp-inv").innerHTML = `<div class="dash-head"><h2>Inventory</h2></div>
    <div class="table-wrap"><table class="data"><tr><th>Product</th><th>Stock level</th><th>Status</th><th>Quick update</th></tr>
    ${mine().map(p=>{ const pct = Math.min(100, p.stock/5); const cls = p.stock<=0?"out":p.stock<50?"low":"";
      return `<tr><td>${p.emoji} <b>${esc(p.name)}</b></td><td><div class="flex"><span class="stock-bar ${cls}" style="flex:1"><i style="width:${pct}%"></i></span><b>${p.stock}</b></div></td>
      <td>${p.stock<=0?'<span class="badge b-red">Out of stock</span>':p.stock<50?'<span class="badge b-gold">Low stock</span>':'<span class="badge b-green">In stock</span>'}</td>
      <td class="flex wrap"><button class="btn btn-ghost btn-sm" data-plus="${p.id}">+10</button><button class="btn btn-ghost btn-sm" data-minus="${p.id}">−10</button><button class="btn btn-outline btn-sm" data-restock="${p.id}">Restock</button></td></tr>`; }).join("")}</table></div>`;
    const bump = (pid, d) => { const all = prods(); const p = all.find(x=>x.id===pid); p.stock = Math.max(0, p.stock+d); saveProds(all); AM.toast(`📦 ${p.name}: ${p.stock} left`); refreshAll(); };
    $$("#fp-inv [data-plus]").forEach(b => b.onclick = () => bump(b.dataset.plus, 10));
    $$("#fp-inv [data-minus]").forEach(b => b.onclick = () => bump(b.dataset.minus, -10));
    $$("#fp-inv [data-restock]").forEach(b => b.onclick = () => bump(b.dataset.restock, 100));
  };

  /* CUSTOMERS / EARNINGS / REVIEWS / SETTINGS */
  const refreshMisc = () => {
    const buyers = [...new Set(myOrders().map(o=>o.userId))];
    $("#fp-cust").innerHTML = `<div class="dash-head"><h2>Customers (${buyers.length||3})</h2></div>
      <div class="grid grid-3">${["Priya S. — Hyderabad","Rahul V. — Secunderabad","Fatima K. — Nalgonda","Anil T. — Suryapet","Sneha R. — Warangal","Kiran M. — Khammam"].slice(0,Math.max(3,buyers.length)).map((n,i)=>`<div class="card card-pad center"><div class="avatar" style="background:${["#166b45","#c08a0b","#7c5cff","#0ea5b7"][i%4]};width:54px;height:54px;font-size:1.5rem">👤</div><b class="small">${n}</b><br><span class="badge b-green">${2+(i%4)} orders</span></div>`).join("")}</div>`;
    $("#fp-earn").innerHTML = `<div class="dash-head"><h2>Earnings</h2><span class="badge b-green">Next payout: Sep 25 • ${inr(Math.round(earnings()*0.4))}</span></div>
      <div class="kpi-grid"><div class="kpi"><span class="k-ico" style="background:var(--brand-100)">💰</span><span><b>${inr(earnings())}</b><span>Total (demo)</span></span></div>
      <div class="kpi"><span class="k-ico" style="background:var(--gold-100)">📅</span><span><b>${inr(Math.round(earnings()*0.35))}</b><span>This month</span></span></div>
      <div class="kpi"><span class="k-ico" style="background:var(--success-bg)">🧾</span><span><b>${inr(Math.round(earnings()/Math.max(1,myOrders().length)))}</b><span>Avg order value</span></span></div>
      <div class="kpi"><span class="k-ico" style="background:var(--info-bg)">🏆</span><span><b>${esc(mine().sort((a,b)=>b.rc-a.rc)[0]?.name||"—").slice(0,14)}</b><span>Top product</span></span></div></div>
      <div class="panel"><h3>Payout history (demo)</h3><div class="table-wrap"><table class="data"><tr><th>Date</th><th>Amount</th><th>Status</th></tr><tr><td>Sep 10, 2026</td><td>${inr(12480)}</td><td><span class="badge b-green">Paid</span></td></tr><tr><td>Aug 25, 2026</td><td>${inr(9860)}</td><td><span class="badge b-green">Paid</span></td></tr></table></div></div>`;
    const revs = AM.reviews().filter(r => mine().some(p=>p.id===r.productId));
    $("#fp-rev").innerHTML = `<div class="dash-head"><h2>Reviews (${revs.length})</h2><span class="rating">${stars(F().rating)} ${F().rating}</span></div>` +
      (revs.map(r=>{const p=prods().find(x=>x.id===r.productId)||{};return `<div class="card review-card" style="margin-bottom:10px"><span class="stars">${stars(r.rating)}</span><b>${esc(r.title)}</b> <span class="muted small">on ${esc(p.name||"")} • by ${esc(r.user)}</span><p class="small">${esc(r.text)}</p></div>`;}).join("") || `<div class="empty">⭐<br>No reviews yet.</div>`);
    $("#fp-set").innerHTML = `<div class="dash-head"><h2>Farm settings</h2></div><form id="fset-f" class="panel"><div class="form-row">
      <div class="field"><label>Farm name</label><input class="input" name="farm" value="${esc(F().farm)}"></div>
      <div class="field"><label>Phone</label><input class="input" name="phone" value="${esc(F().phone||"")}"></div></div>
      <div class="field"><label>About the farm</label><textarea class="input" name="about">${esc(F().about||"")}</textarea></div>
      <div class="form-row"><div class="field"><label>Method</label><input class="input" name="method" value="${esc(F().method)}"></div>
      <div class="field"><label>Farm size</label><input class="input" name="size" value="${esc(F().size)}"></div></div>
      <button class="btn btn-primary">Save settings</button></form>`;
    $("#fset-f").onsubmit = e => { e.preventDefault(); const fd = new FormData(e.target); const all = AM.farmers(); const f = all.find(x=>x.id===myId); Object.assign(f, {farm:fd.get("farm"), phone:fd.get("phone"), about:fd.get("about"), method:fd.get("method"), size:fd.get("size")}); AM.saveFarmers(all); AM.toast("✅ Farm profile updated"); };
  };

  /* ANALYTICS — hand-drawn canvas charts (no CDN needed) */
  function barChart(cv, data, labels, color){
    const ctx = cv.getContext("2d"), W = cv.width = cv.offsetWidth*2, H = cv.height = 440;
    ctx.clearRect(0,0,W,H);
    const max = Math.max(...data, 1), bw = W/(data.length*1.8);
    data.forEach((v,i) => { const h = (v/max)*(H-120), x = (i+.5)*(W/data.length)-bw/2, y = H-60-h;
      const g = ctx.createLinearGradient(0,y,0,H-60); g.addColorStop(0,color); g.addColorStop(1,"#0e2e1f");
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x,y,bw,h,12); ctx.fill();
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--ink"); ctx.font = "600 22px system-ui"; ctx.textAlign = "center";
      ctx.fillText(labels[i], x+bw/2, H-24); ctx.fillText("₹"+(v>=1000?(v/1000).toFixed(1)+"k":v), x+bw/2, y-12); });
  }
  function lineChart(cv, data, labels){
    const ctx = cv.getContext("2d"), W = cv.width = cv.offsetWidth*2, H = cv.height = 440;
    ctx.clearRect(0,0,W,H); const max = Math.max(...data,1);
    const px = i => 60 + i*(W-120)/(data.length-1), py = v => H-80-(v/max)*(H-160);
    ctx.strokeStyle = "#22a866"; ctx.lineWidth = 6; ctx.beginPath();
    data.forEach((v,i)=> i?ctx.lineTo(px(i),py(v)):ctx.moveTo(px(i),py(v))); ctx.stroke();
    data.forEach((v,i)=>{ ctx.fillStyle = "#e9a817"; ctx.beginPath(); ctx.arc(px(i),py(v),10,0,7); ctx.fill();
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--muted"); ctx.font = "22px system-ui"; ctx.textAlign="center"; ctx.fillText(labels[i], px(i), H-30); });
  }
  function drawCharts(){
    const rev = [8200,12400,9800,15600,18200,21400], ord = [14,22,18,31,36,42], mo = ["Apr","May","Jun","Jul","Aug","Sep"];
    barChart($("#ch-rev"), rev, mo, "#22a866");
    lineChart($("#ch-ord"), ord, mo);
    const top = mine().sort((a,b)=>b.price*b.rc-a.price*a.rc).slice(0,4);
    $("#ch-top").innerHTML = top.map(p=>`<div class="flex between small" style="padding:8px 0;border-bottom:1px solid var(--line)"><span>${p.emoji} ${esc(p.name)}</span><b>${inr(p.price*Math.max(1,Math.round(p.rc/10)))}</b></div>`).join("") || "<p class='muted'>No sales yet.</p>";
  }

  const refreshAll = () => { refreshOv(); refreshProds(); refreshOrders(); refreshInv(); refreshMisc(); };
  refreshAll(); show("ov");
});
