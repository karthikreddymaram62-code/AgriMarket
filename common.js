/* AgriMarket — common backbone: store, theme, chrome, widgets (every page loads this) */
const AM = (() => {
  const K = {cart:"am_cart", wish:"am_wish", user:"am_user", orders:"am_orders", notif:"am_notif",
    theme:"am_theme", prods:"am_products", farmers:"am_farmers", reviews:"am_reviews", chat:"am_chat",
    recent:"am_recent", compare:"am_compare", addr:"am_addr", bulk:"am_bulk", users:"am_users", seeded:"am_seeded_v1"};
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const inr = n => "₹" + Number(n).toLocaleString("en-IN");
  const fmtDate = d => new Date(d).toLocaleDateString("en-IN", {day:"numeric", month:"short", year:"numeric"});
  const uid = p => (p||"id") + "-" + Date.now().toString(36) + Math.floor(Math.random()*999);
  const store = {
    get(k, fb){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
    set(k, v){ localStorage.setItem(k, JSON.stringify(v)); },
    del(k){ localStorage.removeItem(k); }
  };
  /* ---- seed ---- */
  function seed(){
    if (store.get(K.seeded, false)) return;
    store.set(K.prods, SEED.PRODUCTS);
    store.set(K.farmers, SEED.FARMERS);
    store.set(K.reviews, SEED.REVIEWS);
    store.set(K.users, SEED.USERS);
    store.set(K.orders, [
      {id:"ORD-2026-1042", userId:"u-customer", items:[{pid:"p4",qty:5},{pid:"p6",qty:10}], total:1345, status:"Shipped", pay:"UPI", date:"2026-09-14", addr:"H.No 2-45, Kothapet, Hyderabad", delivery:"Standard Delivery", eta:"Sep 20, 2026"},
      {id:"ORD-2026-1039", userId:"u-customer", items:[{pid:"p10",qty:2}], total:640, status:"Delivered", pay:"Cash on Delivery", date:"2026-09-06", addr:"H.No 2-45, Kothapet, Hyderabad", delivery:"Standard Delivery", eta:"Sep 09, 2026"}
    ]);
    store.set(K.notif, [
      {id:uid("n"), title:"Order ORD-2026-1042 shipped 🚚", body:"Your mangoes & rice left the farm. Track live in Orders.", time:Date.now()-36e5, read:false, role:"customer"},
      {id:uid("n"), title:"Price alert: Onion +9%", body:"Hyderabad mandi onion is rising. Stock up early!", time:Date.now()-72e5, read:false, role:"customer"},
      {id:uid("n"), title:"New farmer pending verification", body:"Madhavi Latha (Karimnagar) requested approval.", time:Date.now()-9e6, read:false, role:"admin"}
    ]);
    store.set(K.seeded, true);
  }
  seed();
  /* ---- data access (farmer/admin edits persist here) ---- */
  const prods = () => store.get(K.prods, SEED.PRODUCTS);
  const farmers = () => store.get(K.farmers, SEED.FARMERS);
  const reviews = () => store.get(K.reviews, SEED.REVIEWS);
  const saveProds = p => store.set(K.prods, p);
  const saveFarmers = f => store.set(K.farmers, f);
  const saveReviews = r => store.set(K.reviews, r);
  const getProd = id => prods().find(p => p.id === id);
  const getFarmer = id => farmers().find(f => f.id === id);
  const catOf = id => SEED.CATS.find(c => c.id === id);
  /* ---- auth ---- */
  const me = () => store.get(K.user, null);
  const login = (email, pass) => {
    const u = store.get(K.users, SEED.USERS).find(x => x.email.toLowerCase() === email.toLowerCase() && x.pass === pass);
    if (u) { const {pass:_, ...safe} = u; store.set(K.user, safe); return safe; }
    return null;
  };
  const register = (u) => { const users = store.get(K.users, SEED.USERS); users.push(u); store.set(K.users, users); const {pass:_, ...safe} = u; store.set(K.user, safe); return safe; };
  const logout = () => store.del(K.user);
  /* ---- cart ---- */
  const cart = () => store.get(K.cart, []);
  const setCart = c => { store.set(K.cart, c); paintCounts(); };
  const addCart = (pid, qty=1) => {
    const c = cart(); const ex = c.find(i => i.pid === pid);
    if (ex) ex.qty += qty; else c.push({pid, qty});
    setCart(c);
    const p = getProd(pid);
    toast(`🛒 ${esc(p?.name||"Item")} added to cart`, `<a href="cart.html" style="color:#ffd97a;font-weight:800">View cart →</a>`);
  };
  const cartDetailed = () => cart().map(i => ({...i, p:getProd(i.pid)})).filter(i => i.p);
  const cartCount = () => cart().reduce((a,i)=>a+i.qty,0);
  const cartSubtotal = () => cartDetailed().reduce((a,i)=>a+i.p.price*i.qty,0);
  /* ---- wishlist / compare / recent ---- */
  const wish = () => store.get(K.wish, []);
  const toggleWish = pid => {
    let w = wish();
    if (w.includes(pid)) { w = w.filter(x=>x!==pid); toast("💔 Removed from wishlist"); }
    else { w.push(pid); toast("❤️ Saved to wishlist"); }
    store.set(K.wish, w); paintCounts(); paintWishes(); return w.includes(pid);
  };
  const comp = () => store.get(K.compare, []);
  const toggleComp = pid => {
    let c = comp();
    if (c.includes(pid)) c = c.filter(x=>x!==pid);
    else { if (c.length >= 3) { toast("⚠️ Compare up to 3 products only", "", "warn"); return c; } c.push(pid); toast("📊 Added to compare"); }
    store.set(K.compare, c); paintTray(); return c;
  };
  const pushRecent = pid => { let r = store.get(K.recent, []).filter(x=>x!==pid); r.unshift(pid); store.set(K.recent, r.slice(0,8)); };
  /* ---- notifications ---- */
  const notifs = () => store.get(K.notif, []);
  const unread = () => notifs().filter(n => !n.read && (!me() || n.role === me().role || n.role === "all")).length;
  const pushNotif = (title, body, role="all") => { const n = notifs(); n.unshift({id:uid("n"), title, body, time:Date.now(), read:false, role}); store.set(K.notif, n.slice(0,40)); paintCounts(); };
  /* ---- orders ---- */
  const orders = () => store.get(K.orders, []);
  const myOrders = () => { const m = me(); return m ? orders().filter(o => o.userId === m.id || m.role !== "customer") : []; };
  const placeOrder = o => { const all = orders(); all.unshift(o); store.set(K.orders, all); setCart([]); pushNotif(`Order ${o.id} placed 🎉`, `${o.items.length} item(s) • ${inr(o.total)} — ${o.status}`, "all"); return o; };
  const setOrderStatus = (id, st) => { const all = orders(); const o = all.find(x=>x.id===id); if (o){ o.status = st; store.set(K.orders, all); pushNotif(`Order ${id}: ${st}`, "Status updated by seller.", "all"); } };
  /* ---- toast ---- */
  function toast(msg, extra="", kind=""){
    const box = $("#toasts") || (() => { const d = document.createElement("div"); d.id = "toasts"; document.body.appendChild(d); return d; })();
    const t = document.createElement("div"); t.className = "toast " + kind;
    t.innerHTML = `<div style="flex:1">${msg}${extra?`<div style="margin-top:4px">${extra}</div>`:""}</div>`;
    box.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; t.style.transition = ".4s"; setTimeout(()=>t.remove(), 400); }, 3400);
  }
  /* ---- modal ---- */
  function modal(title, bodyHTML, wide=false){
    let back = $("#modal-back");
    if (!back) { back = document.createElement("div"); back.id = "modal-back"; back.className = "modal-back"; back.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><div class="modal-head"><h3></h3><button class="x-btn" aria-label="Close">✕</button></div><div class="modal-body"></div></div>`; document.body.appendChild(back);
      back.addEventListener("click", e => { if (e.target === back || e.target.closest(".x-btn")) closeModal(); });
      document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
    }
    back.querySelector("h3").textContent = title;
    back.querySelector(".modal-body").innerHTML = bodyHTML;
    back.querySelector(".modal").style.maxWidth = wide ? "760px" : "560px";
    back.classList.add("show");
    back.querySelector(".x-btn").focus();
  }
  function closeModal(){ $("#modal-back")?.classList.remove("show"); }
  /* ---- painters ---- */
  function paintCounts(){
    const cc = $("#cart-count"), wc = $("#wish-count"), nc = $("#notif-count");
    if (cc){ const n = cartCount(); cc.textContent = n; cc.style.display = n ? "grid" : "none"; }
    if (wc){ const n = wish().length; wc.textContent = n; wc.style.display = n ? "grid" : "none"; }
    if (nc){ const n = unread(); nc.textContent = n; nc.style.display = n ? "grid" : "none"; }
    paintTray();
  }
  function paintWishes(){ $$("[data-wish]").forEach(b => b.classList.toggle("on", wish().includes(b.dataset.wish))); }
  function paintTray(){
    let tray = $("#compare-tray");
    if (!tray) { tray = document.createElement("div"); tray.id = "compare-tray"; tray.className = "compare-tray"; document.body.appendChild(tray); }
    const c = comp();
    if (!c.length || document.body.dataset.page === "compare") { tray.className = "compare-tray"; tray.innerHTML = ""; return; }
    tray.className = "compare-tray show";
    tray.innerHTML = `<b>📊 Compare (${c.length}/3)</b>` + c.map(pid => { const p = getProd(pid); return `<span class="mini">${esc(p?.emoji||"📦")} ${esc(p?.name?.slice(0,14)||"")} <a href="#" data-uncmp="${pid}" style="color:#ffd97a">✕</a></span>`; }).join("") + `<a class="btn btn-gold btn-sm" href="compare.html">Compare now</a>`;
    tray.querySelectorAll("[data-uncmp]").forEach(a => a.onclick = e => { e.preventDefault(); toggleComp(a.dataset.uncmp); });
  }
  /* ---- theme ---- */
  function theme(init){
    let t = store.get(K.theme, "light");
    if (init) t = init;
    document.documentElement.dataset.theme = t; store.set(K.theme, t);
    const b = $("#theme-btn"); if (b) b.textContent = t === "dark" ? "☀️" : "🌙";
  }
  /* ---- chrome: navbar + footer ---- */
  const NAV = [
    ["index.html","Home"],["products.html","Marketplace"],["categories.html","Categories"],
    ["farmers.html","Farmers"],["about.html","About"],["contact.html","Contact"],["faq.html","FAQ"]
  ];
  function navbar(){
    const page = document.body.dataset.page || "";
    const m = me();
    const dashLink = !m ? "" : m.role === "admin" ? "admin-dashboard.html" : m.role === "farmer" ? "farmer-dashboard.html" : "customer-dashboard.html";
    return `<div class="top-strip">🌾 <b>Festive harvest sale</b> — up to 20% off organic combos &nbsp;•&nbsp; Free delivery over ₹499</div>
    <nav class="navbar" aria-label="Main"><div class="container nav-inner">
      <a class="logo" href="index.html" aria-label="AgriMarket home"><span class="logo-mark">🌾</span><span>AgriMarket<small>FARM TO DOORSTEP</small></span></a>
      <ul class="nav-links" id="nav-links">${NAV.map(([h,l]) => `<li><a href="${h}" class="${page===h.replace(".html","")||(page==="home"&&h==="index.html")?"active":""}">${l}</a></li>`).join("")}</ul>
      <div class="nav-actions">
        <button class="icon-btn" id="theme-btn" aria-label="Toggle theme">🌙</button>
        <div class="dd" id="notif-dd">
          <button class="icon-btn" aria-label="Notifications" onclick="document.getElementById('notif-dd').classList.toggle('open')">🔔<span class="count-bubble" id="notif-count" style="display:none">0</span></button>
          <div class="dd-menu" id="notif-menu" style="min-width:300px"></div>
        </div>
        <a class="icon-btn" href="cart.html?wish=1" aria-label="Wishlist" style="text-decoration:none">❤️<span class="count-bubble" id="wish-count" style="display:none">0</span></a>
        <a class="icon-btn" href="cart.html" aria-label="Cart" style="text-decoration:none">🛒<span class="count-bubble" id="cart-count" style="display:none">0</span></a>
        ${m ? `<div class="dd" id="user-dd"><button class="btn btn-primary btn-sm" onclick="document.getElementById('user-dd').classList.toggle('open')">👤 ${esc(m.name.split(" ")[0])} ▾</button>
          <div class="dd-menu"><a href="${dashLink}">📊 My Dashboard</a><a href="orders.html">📦 My Orders</a><a href="cart.html">🛒 Cart</a><a href="#" id="logout-link">🚪 Logout</a></div></div>`
        : `<a class="btn btn-outline btn-sm only-desktop" href="login.html">Login</a><a class="btn btn-primary btn-sm" href="register.html"><span class="txt">Join free</span><span class="only-mobile">👤</span></a>`}
        <button class="icon-btn hamburger" id="ham" aria-label="Menu">☰</button>
      </div>
    </div></nav>`;
  }
  function footer(){
    return `<footer><div class="container"><div class="foot-grid">
      <div><a class="logo" href="index.html" style="color:#fff"><span class="logo-mark">🌾</span><span>AgriMarket<small style="color:#8aa096">FARM TO DOORSTEP</small></span></a>
      <p class="small" style="margin-top:12px">Empowering farmers. Connecting markets. Delivering freshness — directly from Telangana's farms to your doorstep.</p>
      <div class="flex wrap" style="gap:8px;margin-top:10px">
        <span class="badge b-green">✔ 2,400+ farmers</span><span class="badge b-gold">★ 4.8 rated</span><span class="badge b-blue">🚚 40+ towns</span>
      </div></div>
      <div><h4>Marketplace</h4><a href="products.html">All products</a><a href="categories.html">Categories</a><a href="farmers.html">Our farmers</a><a href="compare.html">Compare products</a><a href="cart.html">Cart & wishlist</a></div>
      <div><h4>Farmers</h4><a href="register.html?role=farmer">Sell on AgriMarket</a><a href="farmer-dashboard.html">Farmer dashboard</a><a href="about.html#how">How it works</a><a href="faq.html">Pricing & fees</a></div>
      <div><h4>Support</h4><a href="about.html">About us</a><a href="contact.html">Contact</a><a href="faq.html">FAQ</a><a href="orders.html">Track order</a><a href="login.html">Login / Register</a></div>
    </div><div class="foot-bottom"><span>© 2026 AgriMarket • Demo prototype — payments, weather & AI are simulated.</span><span>Made with 💚 for Indian farmers</span></div></div></footer>`;
  }
  function injectChrome(){
    if (!$("#site-nav")) { const d = document.createElement("div"); d.id = "site-nav"; document.body.prepend(d); }
    if (!$("#site-foot")) { const d = document.createElement("div"); d.id = "site-foot"; document.body.appendChild(d); }
    $("#site-nav").innerHTML = navbar();
    $("#site-foot").innerHTML = footer();
    $("#ham").onclick = () => $("#nav-links").classList.toggle("open");
    $("#theme-btn").onclick = () => { theme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"); };
    $("#logout-link")?.addEventListener("click", e => { e.preventDefault(); logout(); toast("👋 Logged out"); setTimeout(()=>location.href="index.html", 600); });
    document.addEventListener("click", e => { $$(".dd.open").forEach(d => { if (!d.contains(e.target)) d.classList.remove("open"); }); });
    renderNotifs();
  }
  function renderNotifs(){
    const menu = $("#notif-menu"); if (!menu) return;
    const list = notifs().filter(n => !me() || n.role === me().role || n.role === "all").slice(0,6);
    menu.innerHTML = `<div class="flex between" style="padding:8px 12px"><b>Notifications</b><a href="#" id="mark-read" style="font-size:.78rem">Mark all read</a></div>` +
      (list.length ? list.map(n => `<a href="orders.html"><span>🔔</span><span><b style="font-size:.85rem">${esc(n.title)}</b><br><small class="muted">${esc(n.body).slice(0,60)}…</small></span></a>`).join("") : `<div class="empty" style="padding:20px">🔕<br><small>No notifications yet</small></div>`);
    $("#mark-read").onclick = e => { e.preventDefault(); const all = notifs(); all.forEach(n => n.read = true); store.set(K.notif, all); paintCounts(); renderNotifs(); };
  }
  /* ---- product card ---- */
  function stars(r){ const f = Math.round(r); return "★".repeat(f) + "☆".repeat(5-f); }
  function pCard(p){
    const f = getFarmer(p.farmerId) || {};
    const off = p.mrp > p.price ? Math.round((1 - p.price/p.mrp)*100) : 0;
    const cat = catOf(p.cat) || {};
    const avail = p.stock <= 0 ? `<span class="badge b-red">Out of stock</span>` : p.stock < 50 ? `<span class="badge b-gold">Only ${p.stock} left</span>` : `<span class="badge b-green">In stock</span>`;
    return `<article class="card p-card">
      <div class="p-media" style="background:${cat.grad || "linear-gradient(135deg,#4cc484,#0e5c3a)"}">
        <span class="emoji">${p.emoji}</span>
        <div class="tags">${p.badge?`<span class="badge b-gold">${esc(p.badge)}</span>`:""}${p.organic?`<span class="badge b-green">🌱 Organic</span>`:""}</div>
        <button class="wish ${wish().includes(p.id)?"on":""}" data-wish="${p.id}" aria-label="Wishlist">❤️</button>
      </div>
      <div class="p-body">
        <span class="p-cat">${esc(cat.name||p.cat)}</span>
        <h3 class="p-name"><a href="product-details.html?id=${p.id}">${esc(p.name)}</a></h3>
        <span class="p-farmer">🧑‍🌾 ${esc(f.farm||"AgriMarket Farm")} ${f.verified?'<span class="verify">✔</span>':""} • ${esc(f.village||"")}, ${esc(f.district||"")}</span>
        <span class="rating">${stars(p.rating)} ${p.rating} <span class="muted">(${p.rc})</span></span>
        <div class="p-row"><span class="price">${inr(p.price)}<small> /${esc(p.unit)}</small>${off?`<span class="mrp">${inr(p.mrp)}</span>`:""}</span>${avail}</div>
        <div class="p-actions">
          <button class="btn btn-primary btn-sm" data-add="${p.id}" ${p.stock<=0?"disabled":""}>🛒 Add</button>
          <button class="btn btn-ghost btn-sm" data-cmp="${p.id}">⚖️</button>
          <a class="btn btn-outline btn-sm" href="product-details.html?id=${p.id}">View</a>
        </div>
      </div></article>`;
  }
  function bindCards(root=document){
    root.querySelectorAll("[data-add]").forEach(b => b.onclick = () => addCart(b.dataset.add, 1));
    root.querySelectorAll("[data-wish]").forEach(b => b.onclick = e => { e.preventDefault(); const on = toggleWish(b.dataset.wish); b.classList.toggle("on", on); });
    root.querySelectorAll("[data-cmp]").forEach(b => b.onclick = () => toggleComp(b.dataset.cmp));
  }
  /* ---- search suggestions ---- */
  function suggestions(q){
    q = q.trim().toLowerCase(); if (!q) return [];
    return prods().filter(p => (p.name+" "+p.cat+" "+(getFarmer(p.farmerId)?.farm||"")+" "+(getFarmer(p.farmerId)?.district||"")).toLowerCase().includes(q)).slice(0,6);
  }
  function wireSuggest(input, box){
    if (!input || !box) return;
    let t;
    input.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const s = suggestions(input.value);
        if (!s.length) { box.classList.remove("show"); box.innerHTML = ""; return; }
        box.innerHTML = s.map(p => `<button type="button" data-s="${p.id}"><span>${p.emoji}</span><span><b>${esc(p.name)}</b> <small class="muted">• ${inr(p.price)}/${esc(p.unit)}</small></span></button>`).join("");
        box.classList.add("show");
        box.querySelectorAll("[data-s]").forEach(b => b.onclick = () => location.href = "product-details.html?id=" + b.dataset.s);
      }, 220);
    });
    document.addEventListener("click", e => { if (!box.contains(e.target) && e.target !== input) box.classList.remove("show"); });
    input.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); location.href = "products.html?q=" + encodeURIComponent(input.value); } });
  }
  /* ---- reveal + counters ---- */
  function reveals(){
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), {threshold:.12});
    $$(".reveal").forEach(el => io.observe(el));
    const cio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; cio.unobserve(e.target);
      const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || "";
      const t0 = performance.now(), dur = 1400;
      (function step(t){ const p = Math.min((t-t0)/dur, 1), v = Math.floor(end * (1-Math.pow(1-p,3)));
        el.textContent = v.toLocaleString("en-IN") + suf; if (p < 1) requestAnimationFrame(step); })(t0);
    }), {threshold:.4});
    $$("[data-count]").forEach(el => cio.observe(el));
  }
  /* ---- Agri Assistant (demo AI) ---- */
  function assistant(){
    if ($("#assistant-fab")) return;
    const fab = document.createElement("button"); fab.id = "assistant-fab"; fab.title = "Agri Assistant"; fab.setAttribute("aria-label","Open Agri Assistant"); fab.textContent = "🤖";
    const box = document.createElement("div"); box.id = "assistant"; box.setAttribute("role","dialog"); box.setAttribute("aria-label","Agri Assistant");
    box.innerHTML = `<div class="asst-head"><span style="font-size:1.8rem">🤖</span><span style="flex:1"><b>Agri Assistant</b><small>● online • demo AI</small></span><button class="x-btn" style="background:rgba(255,255,255,.15);color:#fff" aria-label="Close">✕</button></div>
      <div id="asst-msgs"></div>
      <div class="asst-quick"><button>Best mangoes?</button><button>Track my order</button><button>PM-KISAN?</button><button>Today's prices</button><button>Bulk order</button></div>
      <div class="asst-input"><input id="asst-in" placeholder="Ask about crops, orders, schemes…" aria-label="Ask assistant"><button class="btn btn-primary btn-sm" id="asst-send">Send</button></div>`;
    document.body.append(fab, box);
    const msgs = $("#asst-msgs");
    const say = (t, who="bot") => { const d = document.createElement("div"); d.className = "msg " + who; d.innerHTML = t; msgs.appendChild(d); msgs.scrollTop = 1e6; };
    fab.onclick = () => { box.classList.toggle("show"); if (box.classList.contains("show") && !msgs.children.length) say("Namaste! 🙏 I'm <b>Agri Assistant</b>. Ask me about products, orders, market prices, schemes or farming tips."); };
    box.querySelector(".x-btn").onclick = () => box.classList.remove("show");
    const answer = q => {
      const s = q.toLowerCase();
      if (/track|order|deliver/.test(s)) { const o = myOrders()[0]; return o ? `Your latest order <b>${o.id}</b> is <b>${o.status}</b> (ETA ${esc(o.eta||"soon")}). <a href="orders.html">Track it →</a>` : `You have no orders yet. <a href="products.html">Start shopping →</a>`; }
      if (/price|mandi|rate|market/.test(s)) { const m = SEED.MARKET.slice(0,4).map(x => `• ${x.crop}: <b>₹${x.price.toLocaleString("en-IN")}</b>/${x.unit}`).join("<br>"); return `Today's mandi snapshot (demo):<br>${m}<br><a href="index.html#prices">Full table →</a>`; }
      if (/scheme|pm-kisan|kisan|subsid/.test(s)) return `Top schemes: <b>PM-KISAN</b> (₹6,000/yr), <b>Fasal Bima</b> (crop insurance), <b>Soil Health Card</b> (free testing). <a href="index.html#schemes">Explore →</a>`;
      if (/mango|fruit/.test(s)) return `🥭 <b>Banganapalli Mango</b> (₹145/kg) from Lakshmi Orchards is our bestseller — 4.9★. <a href="product-details.html?id=p4">View →</a>`;
      if (/milk|dairy|ghee/.test(s)) return `🥛 <b>A2 Desi Milk</b> ₹75/litre & <b>A2 Ghee</b> ₹720/litre, chilled within 30 min of milking. <a href="products.html?q=milk">Shop dairy →</a>`;
      if (/bulk|wholesale|quote/.test(s)) return `We offer bulk quotes for 50kg+ / quintals. Tap <b>Request Bulk Quote</b> on any product page — farmers reply within a day (demo).`;
      if (/farmer|sell|register/.test(s)) return `Farmers keep <b>~92%</b> of the price here. <a href="register.html?role=farmer">Register free →</a> and list your first crop in 5 minutes.`;
      if (/weather|rain/.test(s)) return `🌦️ <b>Demo forecast</b> (Hyderabad): 31°C, humid, light showers likely for 3 days. Good for paddy transplanting; delay spraying.`;
      if (/organic/.test(s)) return `🌱 We have ${prods().filter(p=>p.organic).length} organic products — look for the green badge. <a href="products.html?organic=1">Browse →</a>`;
      if (/hi|hello|namaste/.test(s)) return `Namaste! 🙏 How can I help — products, orders, prices or schemes?`;
      return `Great question! In this demo I can help with <b>products</b>, <b>orders</b>, <b>market prices</b>, <b>schemes</b>, <b>weather</b> & <b>bulk orders</b>. What do you need?`;
    };
    const send = txt => { const v = (txt ?? $("#asst-in").value).trim(); if (!v) return; $("#asst-in").value = ""; say(esc(v), "user"); setTimeout(() => say(answer(v)), 450); };
    $("#asst-send", box).onclick = () => send();
    $("#asst-in", box).addEventListener("keydown", e => { if (e.key === "Enter") send(); });
    box.querySelectorAll(".asst-quick button").forEach(b => b.onclick = () => send(b.textContent));
  }
  /* ---- quick view ---- */
  function quickView(pid){
    const p = getProd(pid); if (!p) return;
    const f = getFarmer(p.farmerId) || {};
    modal(p.name, `<div class="center" style="font-size:4rem">${p.emoji}</div>
      <p class="center"><span class="rating">${stars(p.rating)} ${p.rating}</span> <span class="muted">(${p.rc} reviews)</span></p>
      <p>${esc(p.desc)}</p>
      <p><b class="price" style="font-size:1.4rem">${inr(p.price)}<small>/${esc(p.unit)}</small></b> ${p.mrp>p.price?`<span class="mrp">${inr(p.mrp)}</span>`:""}</p>
      <p class="small muted">🧑‍🌾 ${esc(f.farm||"")} • ${esc(f.village||"")}, ${esc(f.district||"")} ${f.verified?"✔ verified":""}</p>
      <div class="flex wrap"><button class="btn btn-primary" onclick="AM.addCart('${p.id}');AM.closeModal()">🛒 Add to cart</button>
      <a class="btn btn-outline" href="product-details.html?id=${p.id}">Full details</a></div>`);
  }
  /* ---- chat (simulated customer↔farmer) ---- */
  function openChat(farmerId, productId){
    const f = getFarmer(farmerId) || {name:"Farmer", farm:"Farm"};
    const key = "chat_" + farmerId;
    const all = store.get(K.chat, {});
    const msgs = all[key] || [{who:"them", text:`Namaste! 🙏 This is ${f.name} from ${f.farm}. Ask me about availability, bulk quantity or harvest date.`, time:Date.now()-6e5}];
    modal(`💬 ${f.farm}`, `<div class="chat-box"><div class="chat-msgs" id="chat-msgs"></div>
      <div class="chat-input"><input id="chat-in" placeholder="Type a message…" aria-label="Message"><button class="btn btn-primary btn-sm" id="chat-send">Send</button></div></div>
      <p class="small muted" style="margin-top:8px">Demo chat — messages persist in this browser (localStorage).</p>`);
    const box = $("#chat-msgs");
    const draw = () => { box.innerHTML = msgs.map(m => `<div class="msg ${m.who==="me"?"user":"bot"}">${esc(m.text)}</div>`).join(""); box.scrollTop = 1e6; };
    draw();
    const send = () => {
      const v = $("#chat-in").value.trim(); if (!v) return; $("#chat-in").value = "";
      msgs.push({who:"me", text:v, time:Date.now()}); draw();
      setTimeout(() => {
        const r = /bulk|quintal|tonne|50|100|kg/i.test(v) ? "Yes! For bulk I can offer 8–12% off plus farm-gate loading. Share quantity & delivery town?" :
          /deliver|shipping|days/i.test(v) ? "Dispatch in 24 hrs; 2–4 days to Hyderabad/Secunderabad. Perishables go in cool boxes." :
          /price|rate|cost/i.test(v) ? `Listed price is ${productId?inr(getProd(productId)?.price||0):"as shown"} — negotiable above 100kg.` :
          /organic|spray|chemical/i.test(v) ? "Fully " + (f.method||"natural") + " — no harmful residue. Happy to share harvest photos!" :
          "Dhanyavadalu! 🙏 Noted. I'll confirm availability and reply shortly.";
        msgs.push({who:"them", text:r, time:Date.now()}); all[key] = msgs; store.set(K.chat, all); draw();
      }, 900);
      all[key] = msgs; store.set(K.chat, all);
    };
    $("#chat-send").onclick = send;
    $("#chat-in").addEventListener("keydown", e => { if (e.key === "Enter") send(); });
  }
  /* ---- bulk quote ---- */
  function bulkQuote(pid){
    const p = getProd(pid);
    modal("📦 Request Bulk Quote", `
      <form id="bulk-form" novalidate>
        <div class="field"><label>Product</label><input class="input" value="${esc(p?p.name:"")}" disabled></div>
        <div class="form-row">
          <div class="field"><label>Quantity needed <span class="req">*</span></label><input class="input" name="qty" type="number" min="1" placeholder="e.g. 200" required><span class="err-msg">Enter quantity</span></div>
          <div class="field"><label>Unit</label><select class="input" name="unit"><option>kg</option><option>quintal</option><option>tonne</option></select></div>
        </div>
        <div class="field"><label>Delivery location <span class="req">*</span></label><input class="input" name="loc" placeholder="Town / City" required><span class="err-msg">Enter location</span></div>
        <div class="field"><label>Expected date</label><input class="input" name="date" type="date"></div>
        <div class="field"><label>Notes</label><textarea class="input" name="notes" placeholder="Grading, packing, delivery needs…"></textarea></div>
        <button class="btn btn-gold btn-block">Send request to farmer</button>
      </form>`);
    $("#bulk-form").onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      if (!fd.get("qty") || !fd.get("loc")) { e.target.querySelectorAll(".field").forEach(f=>{ const i=f.querySelector("[required]"); if(i&&!i.value) f.classList.add("invalid"); else f.classList.remove("invalid"); }); return; }
      const all = store.get(K.bulk, []); all.unshift({id:uid("BQ"), pid, qty:fd.get("qty")+" "+fd.get("unit"), loc:fd.get("loc"), date:fd.get("date"), notes:fd.get("notes"), by:me()?.name||"Guest", time:Date.now()});
      store.set(K.bulk, all); closeModal(); toast("📦 Bulk request sent! Farmer replies within 24 hrs (demo)."); pushNotif("Bulk quote requested", `${p?.name} × ${fd.get("qty")} — demo`, "farmer");
    };
  }
  /* ---- form validation helper ---- */
  function validate(form){
    let ok = true;
    form.querySelectorAll("[required]").forEach(i => {
      const f = i.closest(".field"); const bad = !String(i.value||"").trim() || (i.type==="email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value));
      f?.classList.toggle("invalid", !!bad); if (bad) ok = false;
    });
    return ok;
  }
  /* ---- boot ---- */
  document.addEventListener("DOMContentLoaded", () => {
    theme(store.get(K.theme, "light"));
    injectChrome(); assistant(); paintCounts(); paintWishes(); reveals();
    renderNotifs();
  });
  return {$, $$, esc, inr, fmtDate, uid, store, K, prods, farmers, reviews, saveProds, saveFarmers, saveReviews,
    getProd, getFarmer, catOf, me, login, register, logout, cart, addCart, cartDetailed, cartCount, cartSubtotal, setCart,
    wish, toggleWish, comp, toggleComp, pushRecent, notifs, unread, pushNotif, orders, myOrders, placeOrder, setOrderStatus,
    toast, modal, closeModal, paintCounts, paintWishes, stars, pCard, bindCards, wireSuggest, suggestions,
    reveals, quickView, openChat, bulkQuote, validate, theme};
})();
