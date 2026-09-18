/* AgriMarket — demo auth (clearly separated from production auth) */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  const {$, $$, esc, validate, toast} = AM;
  const qs = new URLSearchParams(location.search);
  const dest = r => r === "admin" ? "admin-dashboard.html" : r === "farmer" ? "farmer-dashboard.html" : "customer-dashboard.html";

  if (page === "login" && $("#login-form")) {
    $$(".fill-demo").forEach(b => b.onclick = () => { $("#l-email").value = b.dataset.e; $("#l-pass").value = b.dataset.p; toast("✨ Demo credentials filled — hit Login"); });
    $("#login-form").onsubmit = e => {
      e.preventDefault(); if (!validate(e.target)) return;
      const u = AM.login($("#l-email").value.trim(), $("#l-pass").value);
      if (!u) { toast("❌ Invalid demo credentials. Try a quick-fill button.", "", "err"); return; }
      toast(`👋 Welcome back, ${esc(u.name)}!`); setTimeout(() => location.href = dest(u.role), 700);
    };
  }
  if (page === "register" && $("#reg-form")) {
    const role = qs.get("role") || "customer";
    const pick = (r) => { $("#role-cust").classList.toggle("on", r==="customer"); $("#role-farm").classList.toggle("on", r==="farmer"); $("#farmer-extra").style.display = r === "farmer" ? "" : "none"; $("#reg-form").dataset.role = r; };
    $("#role-cust").onclick = () => pick("customer"); $("#role-farm").onclick = () => pick("farmer");
    pick(role);
    ["state","district"].forEach(()=>{});
    $("#reg-form").onsubmit = e => {
      e.preventDefault(); if (!validate(e.target)) return;
      const fd = new FormData(e.target);
      if (fd.get("pass").length < 6) { toast("⚠️ Password must be 6+ characters", "", "warn"); return; }
      if (fd.get("pass") !== fd.get("pass2")) { toast("⚠️ Passwords do not match", "", "warn"); return; }
      const r = e.target.dataset.role || "customer";
      const u = AM.register({id:AM.uid("u"), role:r, name:fd.get("name"), email:fd.get("email"), pass:fd.get("pass"), phone:fd.get("phone")});
      if (r === "farmer") {
        const fs = AM.farmers();
        fs.push({id:AM.uid("f"), name:fd.get("name"), farm:fd.get("farm")||`${fd.get("name")}'s Farm`, state:"Telangana", district:fd.get("district")||"Nalgonda", mandal:"—", village:fd.get("village")||"—", exp:1, size:fd.get("size")||"2 acres", method:fd.get("method")||"Natural", rating:4.0, reviews:0, verified:false, phone:fd.get("phone"), since:2026, emoji:"🧑‍🌾", color:"#166b45", about:"New farmer on AgriMarket.", crops:(fd.get("crops")||"Vegetables").split(",").map(s=>s.trim())});
        AM.saveFarmers(fs);
        AM.pushNotif("New farmer pending verification", `${fd.get("name")} registered — demo.`, "admin");
      }
      toast(`🎉 Welcome to AgriMarket, ${esc(u.name)}!`); setTimeout(() => location.href = dest(r), 800);
    };
  }
  // route guards for dashboards
  if (["customer","farmer","admin"].includes(page)) {
    const m = AM.me();
    if (!m) { location.href = "login.html?next=" + page; return; }
    if ((page === "admin" && m.role !== "admin") || (page === "farmer" && !["farmer","admin"].includes(m.role))) {
      document.body.innerHTML = `<div class="container section"><div class="empty card card-pad"><span class="big">🔒</span><h2>Access restricted</h2><p>This dashboard needs <b>${page}</b> access. You're logged in as <b>${esc(m.role)}</b>.</p><a class="btn btn-primary" href="login.html">Switch account</a> <a class="btn btn-outline" href="index.html">Home</a></div></div>`;
    }
  }
});
