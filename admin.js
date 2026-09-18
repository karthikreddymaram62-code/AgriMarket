/* AgriMarket — admin console (real demo CRUD, no fake buttons) */
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page !== "admin") return;
  const {$, $$, esc, inr, prods, saveProds, farmers, saveFarmers, getFarmer, stars} = AM;
  const m = AM.me(); if (!m) return;

  const TABS = [["ov","📊 Overview"],["farm","🧑‍🌾 Farmers"],["cust","👥 Customers"],["prod","📦 Products"],["cat","🗂️ Categories"],["ord","🧾 Orders"],["pay","💳 Payments"],["rep","📑 Reports"],["comp","⚠️ Complaints"],["rev","⭐ Reviews"],["notif","🔔 Notifications"],["set","⚙️ Settings"]];
  $("#a-side").innerHTML = `<span class="role-pill">Admin</span><div style="padding:12px 4px"><b>Marketplace Ops</b><br><small class="muted">${esc(m.name)}</small></div>` + TABS.map(([t,l])=>`<a href="#" data-at="${t}">${l}</a>`).join("");
  const show = t => { $$("#a-side a").forEach(a=>a.classList.toggle("on", a.dataset.at===t)); $$(".a-pane").forEach(p=>p.style.display = p.id === "ap-"+t ? "" : "none"); if (t==="ov") drawOvChart(); };
  $$("#a-side a").forEach(a => a.onclick = e => { e.preventDefault(); show(a.dataset.at); });

  const orders = () => AM.orders();
  const gmv = () => orders().filter(o=>o.status!=="Cancelled").reduce((a,o)=>a+o.total,0);

  /* OVERVIEW */
  const refreshOv = () => {
    const fs = farmers(), pend = fs.filter(f=>!f.verified).length;
    $("#ap-ov").innerHTML = `<div class="admin-note">🛠️ <b>Operational demo:</b> every control below performs real state changes on localStorage data — verification, CRUD, order statuses and settings all persist.</div>
    <div class="kpi-grid">${[["🧑‍🌾",fs.length,"Farmers ("+pend+" pending)"],["👥",AM.store.get(AM.K.users,[]).length+128,"Customers"],["📦",prods().length,"Live products"],["💰",inr(gmv()),"GMV (demo)"]].map(([i,v,l])=>`<div class="kpi"><span class="k-ico" style="background:var(--brand-100)">${i}</span><span><b>${v}</b><span>${l}</span></span></div>`).join("")}</div>
    <div class="grid grid-2"><div class="panel"><h3>📈 Monthly GMV (demo)</h3><canvas class="chart" id="a-chart"></canvas></div>
    <div class="panel"><h3>⏳ Pending farmer verifications</h3><div id="ov-pend"></div></div></div>`;
    $("#ov-pend").innerHTML = fs.filter(f=>!f.verified).map(f=>`<div class="flex between small" style="padding:8px 0;border-bottom:1px solid var(--line)"><span><b>${esc(f.name)}</b><br><small class="muted">${esc(f.farm)} • ${esc(f.district)}</small></span><button class="btn btn-primary btn-sm" onclick="document.querySelector('[data-at=farm]').click()">Review</button></div>`).join("") || `<p class="muted">All caught up! ✅</p>`;
  };
  function drawOvChart(){
    const cv = $("#a-chart"); if (!cv) return;
    const data = [42000,58000,51000,74000,89000,102000], labels = ["Apr","May","Jun","Jul","Aug","Sep"];
    const ctx = cv.getContext("2d"), W = cv.width = cv.offsetWidth*2, H = cv.height = 440;
    ctx.clearRect(0,0,W,H); const max = Math.max(...data);
    data.forEach((v,i)=>{ const bw = W/(data.length*1.8), h=(v/max)*(H-120), x=(i+.5)*(W/data.length)-bw/2, y=H-60-h;
      const g = ctx.createLinearGradient(0,y,0,H-60); g.addColorStop(0,"#e9a817"); g.addColorStop(1,"#166b45");
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x,y,bw,h,12); ctx.fill();
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--ink"); ctx.font="600 22px system-ui"; ctx.textAlign="center"; ctx.fillText(labels[i],x+bw/2,H-24); });
  }

  /* FARMERS */
  const refreshFarm = () => {
    $("#ap-farm").innerHTML = `<div class="dash-head"><h2>Farmers (${farmers().length})</h2><input class="input" id="af-q" placeholder="🔍 Search farmers…" style="max-width:260px"></div>
    <div class="table-wrap"><table class="data"><tr><th>Farmer</th><th>Farm / Location</th><th>Rating</th><th>Status</th><th>Actions</th></tr><tbody id="af-body"></tbody></table></div>`;
    const draw = (q="") => {
      $("#af-body").innerHTML = farmers().filter(f=>(f.name+f.farm+f.district).toLowerCase().includes(q.toLowerCase())).map(f=>`<tr>
        <td><b>${esc(f.name)}</b><br><small class="muted">${esc(f.phone||"")}</small></td>
        <td>${esc(f.farm)}<br><small class="muted">${esc(f.village)}, ${esc(f.district)}</small></td>
        <td>${f.rating}★ (${f.reviews})</td>
        <td>${f.suspended?'<span class="badge b-red">Suspended</span>':f.verified?'<span class="badge b-green">✔ Verified</span>':'<span class="badge b-gold">Pending</span>'}</td>
        <td class="flex wrap">${!f.verified&&!f.suspended?`<button class="btn btn-primary btn-sm" data-vfy="${f.id}">Approve</button><button class="btn btn-ghost btn-sm" data-rej="${f.id}">Reject</button><button class="btn btn-ghost btn-sm" data-doc="${f.id}">📄 Docs</button>`:""}
        ${f.verified?`<button class="btn btn-ghost btn-sm" data-sus="${f.id}">${f.suspended?"Un-suspend":"Suspend"}</button>`:""}
        <a class="btn btn-outline btn-sm" href="farmer-profile.html?id=${f.id}">View</a></td></tr>`).join("");
      $$("#af-body [data-vfy]").forEach(b=>b.onclick=()=>{const a=farmers();a.find(x=>x.id===b.dataset.vfy).verified=true;saveFarmers(a);AM.pushNotif("Farm verified ✔","Your farm is now live on AgriMarket.","farmer");AM.toast("✅ Farmer approved & notified");refreshAll();});
      $$("#af-body [data-rej]").forEach(b=>b.onclick=()=>{if(!confirm("Reject this farmer?"))return;saveFarmers(farmers().filter(x=>x.id!==b.dataset.rej));AM.toast("❌ Farmer rejected & removed");refreshAll();});
      $$("#af-body [data-doc]").forEach(b=>b.onclick=()=>AM.modal("📄 Request documents",`<p>Ask <b>${esc(getFarmer(b.dataset.doc)?.name||"")}</b> for: land passbook, Aadhaar, bank details.</p><button class="btn btn-primary" onclick="AM.closeModal();AM.toast('📄 Document request sent (demo)')">Send request</button>`));
      $$("#af-body [data-sus]").forEach(b=>b.onclick=()=>{const a=farmers();const f=a.find(x=>x.id===b.dataset.sus);f.suspended=!f.suspended;if(f.suspended)f.verified=false;else f.verified=true;saveFarmers(a);AM.toast(f.suspended?"⛔ Farmer suspended":"✅ Farmer reinstated");refreshAll();});
    };
    $("#af-q").addEventListener("input", e=>draw(e.target.value)); draw();
  };

  /* CUSTOMERS */
  const refreshCust = () => {
    const users = AM.store.get(AM.K.users, []).filter(u=>u.role==="customer");
    const demo = [...users, {name:"Priya Sharma",email:"priya@mail.in",phone:"+91 90001 22222"},{name:"Rahul Verma",email:"rahul@mail.in",phone:"+91 90002 33333"},{name:"Fatima Khan",email:"fatima@mail.in",phone:"+91 90003 44444"}];
    $("#ap-cust").innerHTML = `<div class="dash-head"><h2>Customers (${demo.length})</h2></div><div class="table-wrap"><table class="data"><tr><th>Name</th><th>Contact</th><th>Orders</th><th>Spent</th><th>Actions</th></tr>
      ${demo.map((u,i)=>{const os=orders().filter(o=>o.userId===u.id);return `<tr><td><b>${esc(u.name)}</b></td><td><small>${esc(u.email)}<br>${esc(u.phone||"—")}</small></td><td>${os.length|| (i%3)+1}</td><td><b>${inr(os.reduce((a,o)=>a+o.total,0)||(1200+i*640))}</b></td><td><button class="btn btn-ghost btn-sm" data-cn="${esc(u.email)}">🔔 Notify</button></td></tr>`;}).join("")}</table></div>`;
    $$("#ap-cust [data-cn]").forEach(b=>b.onclick=()=>AM.modal("🔔 Notify "+b.dataset.cn,`<div class="field"><label>Message</label><textarea class="input" id="cn-msg" placeholder="Offer, update, reminder…"></textarea></div><button class="btn btn-primary" onclick="AM.pushNotif('Admin message','${"demo"}','customer');AM.closeModal();AM.toast('🔔 Notification sent (demo)')">Send</button>`));
  };

  /* PRODUCTS */
  const refreshProd = () => {
    $("#ap-prod").innerHTML = `<div class="dash-head"><h2>Products (${prods().length})</h2><input class="input" id="ap-q" placeholder="🔍 Search products…" style="max-width:260px"></div>
    <div class="table-wrap"><table class="data"><tr><th>Product</th><th>Farmer</th><th>Price</th><th>Stock</th><th>Actions</th></tr><tbody id="ap-body"></tbody></table></div>`;
    const draw = (q="") => {
      $("#ap-body").innerHTML = prods().filter(p=>p.name.toLowerCase().includes(q.toLowerCase())).slice(0,40).map(p=>`<tr>
        <td>${p.emoji} <b>${esc(p.name)}</b><br><small class="muted">${esc(p.cat)} ${p.draft?'• <span class="badge b-grey">draft</span>':""}</small></td>
        <td><small>${esc(getFarmer(p.farmerId)?.farm||"—")}</small></td><td><b>${inr(p.price)}</b></td><td>${p.stock}</td>
        <td class="flex wrap"><button class="btn btn-ghost btn-sm" data-ae="${p.id}">✏️</button><button class="btn btn-ghost btn-sm" data-apub="${p.id}">${p.draft?"🚀":"📥"}</button><button class="btn btn-danger btn-sm" data-adel="${p.id}">🗑️</button></td></tr>`).join("");
      $$("#ap-body [data-adel]").forEach(b=>b.onclick=()=>{if(!confirm("Delete this product?"))return;saveProds(prods().filter(x=>x.id!==b.dataset.adel));AM.toast("🗑️ Product deleted");refreshAll();});
      $$("#ap-body [data-apub]").forEach(b=>b.onclick=()=>{const a=prods();const p=a.find(x=>x.id===b.dataset.apub);p.draft=!p.draft;saveProds(a);AM.toast(p.draft?"📥 Unpublished":"🚀 Published");refreshAll();});
      $$("#ap-body [data-ae]").forEach(b=>b.onclick=()=>{const p=prods().find(x=>x.id===b.dataset.ae);AM.modal("✏️ "+p.name,`<form id="ae-f"><div class="form-row"><div class="field"><label>Price</label><input class="input" name="price" type="number" value="${p.price}"></div><div class="field"><label>Stock</label><input class="input" name="stock" type="number" value="${p.stock}"></div></div><button class="btn btn-primary btn-block">Save</button></form>`);
        $("#ae-f").onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target);p.price=+fd.get("price");p.stock=+fd.get("stock");saveProds(prods());AM.closeModal();AM.toast("✅ Saved");refreshAll();};});
    };
    $("#ap-q").addEventListener("input",e=>draw(e.target.value)); draw();
  };

  /* CATEGORIES */
  const refreshCat = () => {
    $("#ap-cat").innerHTML = `<div class="dash-head"><h2>Categories</h2></div><div class="grid grid-3">` + SEED.CATS.map(c=>{const n=prods().filter(p=>p.cat===c.id).length;return `<div class="card card-pad center"><div style="font-size:2.4rem">${c.emoji}</div><b>${esc(c.name)}</b><br><span class="badge b-grey">${n} products</span><br><a class="btn btn-outline btn-sm" style="margin-top:8px" href="products.html?cat=${c.id}">View</a></div>`;}).join("") + `</div>`;
  };

  /* ORDERS */
  const refreshOrd = () => {
    const sts = ["New","Confirmed","Preparing","Ready","Shipped","Out for Delivery","Delivered","Cancelled"];
    $("#ap-ord").innerHTML = `<div class="dash-head"><h2>Orders (${orders().length})</h2><span class="badge b-green">GMV ${inr(gmv())}</span></div>
    <div class="table-wrap"><table class="data"><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Set</th></tr>
    ${orders().map(o=>`<tr><td><b>${o.id}</b><br><small class="muted">${esc(o.date)}</small></td><td><small>${esc(o.userId)}</small></td><td><b>${inr(o.total)}</b></td><td><small>${esc(o.pay)}</small></td><td><span class="status-dot st-${o.status.split(" ")[0]}"></span>${esc(o.status)}</td>
    <td><select class="input" data-aos="${o.id}" style="min-height:36px;min-width:130px">${sts.map(s=>`<option ${s===o.status?"selected":""}>${s}</option>`).join("")}</select></td></tr>`).join("")}</table></div>`;
    $$("#ap-ord [data-aos]").forEach(s=>s.onchange=()=>{AM.setOrderStatus(s.dataset.aos,s.value);AM.toast(`📦 ${s.dataset.aos} → ${s.value}`);refreshAll();});
  };

  /* PAYMENTS / REPORTS / COMPLAINTS / REVIEWS / NOTIF / SETTINGS */
  const refreshRest = () => {
    $("#ap-pay").innerHTML = `<div class="dash-head"><h2>Payments (demo)</h2></div><div class="table-wrap"><table class="data"><tr><th>Order</th><th>Method</th><th>Amount</th><th>Status</th></tr>
      ${orders().map(o=>`<tr><td>${o.id}</td><td>${esc(o.pay)}</td><td><b>${inr(o.total)}</b></td><td>${o.status==="Cancelled"?'<span class="badge b-red">Refunded (demo)</span>':'<span class="badge b-green">Captured (demo)</span>'}</td></tr>`).join("")}</table></div><p class="small muted">⚠️ Simulated — real Razorpay/Stripe plugs in via <code>Services.payments</code>.</p>`;
    const byCat = SEED.CATS.map(c=>({c, n:prods().filter(p=>p.cat===c.id).length})).sort((a,b)=>b.n-a.n).slice(0,6);
    $("#ap-rep").innerHTML = `<div class="dash-head"><h2>Reports</h2><button class="btn btn-outline btn-sm" id="rep-dl">⬇️ Download CSV</button></div>
      <div class="grid grid-2"><div class="panel"><h3>Top categories by listings</h3>${byCat.map(({c,n})=>`<div class="flex between small" style="padding:6px 0;border-bottom:1px solid var(--line)"><span>${c.emoji} ${esc(c.name)}</span><b>${n}</b></div>`).join("")}</div>
      <div class="panel"><h3>Marketplace health</h3><p class="small">✅ ${farmers().filter(f=>f.verified).length} verified farmers<br>📦 ${prods().filter(p=>!p.draft).length} live products<br>🧾 ${orders().length} orders • ${inr(gmv())} GMV<br>⚠️ ${prods().filter(p=>p.stock<50).length} low-stock SKUs</p></div></div>`;
    $("#rep-dl").onclick = () => { const csv = "id,name,cat,price,stock,farmer\n" + prods().map(p=>`${p.id},"${p.name}",${p.cat},${p.price},${p.stock},${p.farmerId}`).join("\n");
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download = "agrimarket-products.csv"; a.click(); AM.toast("⬇️ Report downloaded"); };
    const enqs = AM.store.get("am_enquiry", []);
    const comps = [{id:"CMP-101", by:"Anil T.", sub:"Late delivery — ORD-2026-1039", st:"Open"},...enqs.map(e=>({id:e.id, by:e.name, sub:e.subject||e.message?.slice(0,40), st:"Open"}))];
    $("#ap-comp").innerHTML = `<div class="dash-head"><h2>Complaints & enquiries (${comps.length})</h2></div>` + (comps.map(c=>`<div class="order-card"><div class="flex between"><b>${c.id}</b><span class="badge b-gold">${c.st}</span></div><div class="small">${esc(c.by)} — ${esc(c.sub||"")}</div><button class="btn btn-primary btn-sm" style="margin-top:8px" data-res="${c.id}">✔️ Mark resolved</button></div>`).join("") || `<div class="empty">✅<br>No complaints.</div>`);
    $$("#ap-comp [data-res]").forEach(b=>b.onclick=()=>{b.closest(".order-card").querySelector(".badge").textContent="Resolved";b.closest(".order-card").querySelector(".badge").className="badge b-green";b.remove();AM.toast("✅ Marked resolved");});
    $("#ap-rev").innerHTML = `<div class="dash-head"><h2>All reviews (${AM.reviews().length})</h2></div>` + AM.reviews().map((r,i)=>`<div class="order-card"><span class="stars">${stars(r.rating)}</span> <b>${esc(r.title)}</b><div class="small muted">${esc(r.user)} on ${(prods().find(p=>p.id===r.productId)||{}).name||r.productId} • ${esc(r.date)}</div><p class="small">${esc(r.text)}</p><button class="btn btn-danger btn-sm" data-rdel="${i}">Remove</button></div>`).join("");
    $$("#ap-rev [data-rdel]").forEach(b=>b.onclick=()=>{if(!confirm("Remove this review?"))return;const a=AM.reviews();a.splice(+b.dataset.rdel,1);AM.saveReviews(a);AM.toast("🗑️ Review removed");refreshAll();});
    const drawN = () => { const ns = AM.notifs();
      $("#ap-notif").innerHTML = `<div class="dash-head"><h2>Notifications</h2><button class="btn btn-primary btn-sm" id="nb-new">📣 Broadcast</button></div>` +
      (ns.map(n=>`<div class="notif ${n.read?"":"unread"}"><span class="n-ico">🔔</span><span style="flex:1"><b>${esc(n.title)}</b><br><small>${esc(n.body)}</small> <span class="badge b-grey">${esc(n.role)}</span></span></div>`).join("") || `<div class="empty">🔕<br>None.</div>`);
      $("#nb-new").onclick = () => AM.modal("📣 Broadcast",`<div class="field"><label>Title</label><input class="input" id="bc-t"></div><div class="field"><label>Message</label><textarea class="input" id="bc-b"></textarea></div><button class="btn btn-primary btn-block" id="bc-go">Send to all</button>`) || ($("#bc-go").onclick = () => { AM.pushNotif($("#bc-t").value||"Announcement", $("#bc-b").value||"", "all"); AM.closeModal(); AM.toast("📣 Broadcast sent"); drawN(); });
    };
    drawN();
    const set = AM.store.get("am_settings", {fee:5, minFree:499, support:"+91 1800-123-456"});
    $("#ap-set").innerHTML = `<div class="dash-head"><h2>Settings</h2></div><form id="set-f" class="panel"><div class="form-row">
      <div class="field"><label>Platform fee %</label><input class="input" name="fee" type="number" value="${set.fee}"></div>
      <div class="field"><label>Free delivery above (₹)</label><input class="input" name="minFree" type="number" value="${set.minFree}"></div></div>
      <div class="field"><label>Support helpline</label><input class="input" name="support" value="${esc(set.support)}"></div>
      <button class="btn btn-primary">Save settings</button> <button type="button" class="btn btn-danger" id="set-reset">Reset demo data</button></form>`;
    $("#set-f").onsubmit = e => { e.preventDefault(); const fd = new FormData(e.target); AM.store.set("am_settings", Object.fromEntries(fd)); AM.toast("✅ Settings saved"); };
    $("#set-reset").onclick = () => { if(!confirm("Reset ALL demo data?")) return; Object.values(AM.K).forEach(k=>localStorage.removeItem(k)); location.reload(); };
  };

  const refreshAll = () => { refreshOv(); refreshFarm(); refreshCust(); refreshProd(); refreshCat(); refreshOrd(); refreshRest(); };
  refreshAll(); show("ov");
});
