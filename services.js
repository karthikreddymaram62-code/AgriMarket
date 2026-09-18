/* AgriMarket — future-integration boundaries (Phase 9).
   UI code must NEVER call providers directly; always go through Services.
   Swap these mock implementations with real APIs later. */
const Services = (() => {
  const HERO = { /* mock providers */
    weather: (loc) => ({loc, temp:31, cond:"Partly cloudy", icon:"⛅", humidity:68, wind:12, rain:40,
      days:[{d:"Thu",i:"🌦️",t:30},{d:"Fri",i:"🌧️",t:29},{d:"Sat",i:"⛅",t:31},{d:"Sun",i:"☀️",t:33}]}),
    marketPrice: () => SEED.MARKET,
    ai: (q) => "demo-answer",
    payments: { createOrder: async (amt) => ({provider:"razorpay-mock", orderId:"mock_"+Date.now(), amt}) },
    logistics: { track: async (id) => ({id, status:"In transit", eta:"2 days"}) }
  };
  return {
    weather: (loc) => HERO.weather(loc),          // future: IMD / OpenWeather
    marketPrices: () => HERO.marketPrice(),       // future: eNAM / data.gov.in
    askAI: (q) => HERO.ai(q),                     // future: LLM endpoint
    payments: HERO.payments,                      // future: Razorpay/Stripe
    logistics: HERO.logistics                     // future: Delhivery/Shiprocket
  };
})();
