/* AgriMarket — home page */
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page !== "home") return;
  const {$, $$, esc, inr, prods, farmers, catOf, bindCards, pCard, wireSuggest, stars} = AM;

  wireSuggest($("#hero-q"), $("#hero-suggest"));
  $("#hero-go").onclick = () => location.href = "products.html?q=" + encodeURIComponent($("#hero-q").value || "");

  // Categories strip
  $("#home-cats").innerHTML = SEED.CATS.slice(0, 8).map(c => {
    const n = prods().filter(p => p.cat === c.id || (c.id === "organic" && p.organic)).length;
    return `<div class="card cat-card reveal" onclick="location.href='products.html?cat=${c.id}'" role="link" tabindex="0" onkeydown="if(event.key==='Enter')location.href='products.html?cat=${c.id}'">
      <span class="cat-ico" style="background:${c.grad}">${c.emoji}</span><span><b>${esc(c.name)}</b><span>${n} products • ${esc(c.desc)}</span></span></div>`;
  }).join("");

  // Featured products (top rated)
  const feat = [...prods()].sort((a,b) => b.rating*b.rc - a.rating*a.rc).slice(0, 8);
  $("#home-feat").innerHTML = feat.map(pCard).join("");
  bindCards($("#home-feat"));

  // Featured farmers
  $("#home-farmers").innerHTML = farmers().filter(f=>f.verified).slice(0,4).map(f => `
    <div class="card f-card reveal"><div class="avatar" style="background:${f.color}">${f.emoji}</div>
      <b>${esc(f.name)} <span class="verify">✔</span></b><div class="small muted">${esc(f.farm)}<br>📍 ${esc(f.village)}, ${esc(f.district)}</div>
      <div class="rating" style="margin:8px 0">${stars(f.rating)} ${f.rating} <span class="muted">(${f.reviews})</span></div>
      <div class="flex wrap center" style="justify-content:center">${f.crops.map(c=>`<span class="badge b-grey">${esc(c)}</span>`).join("")}</div>
      <a class="btn btn-outline btn-sm" style="margin-top:12px" href="farmer-profile.html?id=${f.id}">View profile</a></div>`).join("");

  // Market ticker + table
  const tick = SEED.MARKET.map(m => { const up = m.price >= m.prev; return `<span>${m.crop} <b>₹${m.price.toLocaleString("en-IN")}</b> <b class="${up?"up":"down"}">${up?"▲":"▼"} ${Math.abs(((m.price-m.prev)/m.prev*100)).toFixed(1)}%</b></span>`; }).join(" • ");
  $("#ticker-track").innerHTML = tick;
  $("#market-table").innerHTML = SEED.MARKET.slice(0,8).map(m => {
    const ch = ((m.price-m.prev)/m.prev*100), up = ch >= 0;
    return `<tr><td><b>${esc(m.crop)}</b><br><small class="muted">📍 ${esc(m.market)} mandi</small></td>
      <td><b>₹${m.price.toLocaleString("en-IN")}</b><small class="muted">/${m.unit}</small></td>
      <td class="${up?"up":"down"}" style="font-weight:800;color:${up?"var(--success)":"var(--danger)"}">${up?"▲":"▼"} ${Math.abs(ch).toFixed(1)}%</td>
      <td><span class="badge ${up?"b-green":"b-red"}">${up?"Rising":"Falling"}</span></td></tr>`;
  }).join("");

  // Updates + schemes
  $("#home-updates").innerHTML = SEED.UPDATES.map(u => `
    <div class="card update-card reveal"><span class="u-ico">${u.emoji}</span>
      <span><span class="badge b-blue">${esc(u.tag)}</span> <small class="muted">${esc(u.date)}</small><b style="display:block;margin-top:4px">${esc(u.title)}</b><span class="small muted">${esc(u.body)}</span></span></div>`).join("");
  $("#home-schemes").innerHTML = SEED.SCHEMES.slice(0,3).map(s => `
    <div class="card scheme-card reveal"><div style="font-size:2.2rem">${s.emoji}</div><h3 style="margin:8px 0 4px">${esc(s.name)}</h3>
      <p class="small muted">${esc(s.desc)}</p><p class="small"><b>Benefit:</b> ${esc(s.benefit)}</p>
      <button class="btn btn-ghost btn-sm" onclick="AM.modal('${esc(s.name)}', '<p>${esc(s.desc)}</p><p><b>Eligibility:</b> ${esc(s.elig)}</p><p><b>Benefit:</b> ${esc(s.benefit)}</p><a class=\\'btn btn-primary btn-sm\\' target=\\'_blank\\' rel=\\'noopener\\' href=\\'${s.link}\\'>Official portal ↗</a>')">Check eligibility</button></div>`).join("");

  // Reviews carousel (auto-rotate)
  const revs = AM.reviews();
  let ri = 0;
  const drawRev = () => {
    $("#home-reviews").innerHTML = [0,1,2].map(k => { const r = revs[(ri+k)%revs.length]; const p = AM.getProd(r.productId) || {};
      return `<div class="card review-card reveal in"><span class="stars">${stars(r.rating)}</span><b>"${esc(r.title)}"</b><p class="small muted">${esc(r.text)}</p>
      <span class="small"><b>${esc(r.user)}</b> ${r.verified?'<span class="badge b-green">✔ Verified buyer</span>':""}<br><span class="muted">bought ${esc(p.name||"")} • ${esc(r.date)}</span></span></div>`; }).join("");
  };
  drawRev();
  setInterval(() => { ri = (ri+1)%revs.length; drawRev(); }, 6000);

  // Weather widget (mock service)
  const w = Services.weather("Hyderabad");
  $("#weather-card").innerHTML = `<div class="flex between"><span style="font-size:2.4rem">${w.icon}</span><span style="text-align:right"><b style="font-size:1.8rem">${w.temp}°C</b><br><small class="muted">${esc(w.loc)} • ${esc(w.cond)}</small></span></div>
    <div class="flex wrap" style="margin-top:10px"><span class="badge b-grey">💧 ${w.humidity}% humidity</span><span class="badge b-grey">💨 ${w.wind} km/h</span><span class="badge b-grey">🌧️ ${w.rain}% rain</span></div>
    <div class="flex" style="margin-top:12px;gap:8px">${w.days.map(d=>`<span class="badge b-grey" style="flex:1;justify-content:center">${d.d} ${d.i} ${d.t}°</span>`).join("")}</div>
    <p class="small muted" style="margin:10px 0 0">⚠️ Demo data — live API plugs in via <code>Services.weather()</code>.</p>`;

  // Recently viewed
  const recent = AM.store.get(AM.K.recent, []).map(id => AM.getProd(id)).filter(Boolean);
  if (recent.length) {
    $("#recent-sec").style.display = "";
    $("#home-recent").innerHTML = recent.slice(0,4).map(pCard).join("");
    bindCards($("#home-recent"));
  }
  AM.reveals();
});
