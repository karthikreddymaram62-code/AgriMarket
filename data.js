/* AgriMarket — seed data (demo / mock layer, backend-ready shapes) */
const SEED = (() => {
  const FARMERS = [
    {id:"f1", name:"Ramesh Patel", farm:"Patel Green Acres", state:"Telangana", district:"Nalgonda", mandal:"Nalgonda", village:"Dandampally", exp:14, size:"6 acres", method:"Organic", rating:4.8, reviews:214, verified:true, phone:"+91 98480 11223", since:2019, emoji:"🧑‍🌾", color:"#166b45", about:"Third-generation farmer growing residue-free vegetables with drip irrigation and farm-made compost.", crops:["Tomato","Onion","Chilli"]},
    {id:"f2", name:"Lakshmi Devi", farm:"Lakshmi Mango Orchards", state:"Telangana", district:"Khammam", mandal:"Vatsavai", village:"Wyra", exp:11, size:"9 acres", method:"Natural", rating:4.9, reviews:187, verified:true, phone:"+91 98481 22334", since:2020, emoji:"👩‍🌾", color:"#c08a0b", about:"Award-winning mango and guava orchard. Harvests at dawn and dispatches the same day.", crops:["Mango","Guava","Sapota"]},
    {id:"f3", name:"Suresh Reddy", farm:"Reddy Paddy Fields", state:"Telangana", district:"Suryapet", mandal:"Suryapet", village:"Thungathurthy", exp:18, size:"15 acres", method:"Conventional", rating:4.6, reviews:156, verified:true, phone:"+91 98482 33445", since:2019, emoji:"🧑‍🌾", color:"#1c8a58", about:"Large paddy and maize grower supplying premium Sona Masoori directly to families and hostels.", crops:["Paddy","Maize","Groundnut"]},
    {id:"f4", name:"Anitha Rao", farm:"Anitha Dairy & Greens", state:"Telangana", district:"Karimnagar", mandal:"Huzurabad", village:"Jammikunta", exp:8, size:"4 acres", method:"Organic", rating:4.7, reviews:143, verified:true, phone:"+91 98483 44556", since:2021, emoji:"👩‍🌾", color:"#7c5cff", about:"Farm-fresh A2 dairy plus seasonal leafy greens. Milking twice daily, chilled within 30 minutes.", crops:["Milk","Spinach","Coriander"]},
    {id:"f5", name:"Venkatesh Goud", farm:"Goud Spice Gardens", state:"Telangana", district:"Warangal", mandal:"Parkal", village:"Narsampet", exp:12, size:"7 acres", method:"Organic", rating:4.8, reviews:178, verified:true, phone:"+91 98484 55667", since:2020, emoji:"🧑‍🌾", color:"#c93a3a", about:"Turmeric, chilli and coriander seed specialist. Sun-dried, stone-ground, no added colour.", crops:["Turmeric","Red Chilli","Coriander Seed"]},
    {id:"f6", name:"Prashanth Kumar", farm:"Kumar Millet Mission", state:"Telangana", district:"Mahbubnagar", mandal:"Shadnagar", village:"Balanagar", exp:9, size:"11 acres", method:"Natural", rating:4.5, reviews:98, verified:false, phone:"+91 98485 66778", since:2023, emoji:"🧑‍🌾", color:"#0ea5b7", about:"Millet evangelist growing foxtail, ragi and jowar with zero chemical fertiliser.", crops:["Foxtail Millet","Ragi","Jowar"]},
    {id:"f7", name:"Divya Sharma", farm:"Sharma Strawberry Fields", state:"Telangana", district:"Medak", mandal:"Sangareddy", village:"Zaheerabad", exp:6, size:"3 acres", method:"Protected Cultivation", rating:4.9, reviews:231, verified:true, phone:"+91 98486 77889", since:2022, emoji:"👩‍🌾", color:"#e05299", about:"Hi-tech polyhouse strawberries and exotic veggies near Hyderabad for same-day delivery.", crops:["Strawberry","Capsicum","Broccoli"]},
    {id:"f8", name:"Nagesh Yadav", farm:"Yadav Cotton Belt", state:"Telangana", district:"Yadadri Bhuvanagiri", mandal:"Bhongir", village:"Bibinagar", exp:16, size:"20 acres", method:"Conventional", rating:4.4, reviews:87, verified:true, phone:"+91 98487 88990", since:2019, emoji:"🧑‍🌾", color:"#5b6b60", about:"Cotton, red gram and sunflower in rotation. Bulk supplier for mills and FPOs.", crops:["Cotton","Red Gram","Sunflower"]},
    {id:"f9", name:"Kavitha Rani", farm:"Kavitha Banana Grove", state:"Telangana", district:"Sangareddy", mandal:"Patancheru", village:"Ameenpur", exp:10, size:"5 acres", method:"Natural", rating:4.7, reviews:129, verified:true, phone:"+91 98488 99001", since:2021, emoji:"👩‍🌾", color:"#22a866", about:"Robusta and red bananas ripened naturally in chambers — never carbide.", crops:["Banana","Papaya","Coconut"]},
    {id:"f10", name:"Arun Singh", farm:"Singh Seed House", state:"Telangana", district:"Hyderabad", mandal:"Uppal", village:"Ghatkesar", exp:13, size:"8 acres", method:"Certified Seed", rating:4.6, reviews:112, verified:true, phone:"+91 98489 00112", since:2020, emoji:"🧑‍🌾", color:"#2563eb", about:"Certified vegetable and paddy seeds with 90%+ germination, lab-tested every batch.", crops:["Paddy Seed","Vegetable Seed","Maize Seed"]},
    {id:"f11", name:"Madhavi Latha", farm:"Madhavi Turmeric House", state:"Telangana", district:"Karimnagar", mandal:"Manthani", village:"Peddapalli", exp:7, size:"4 acres", method:"Organic", rating:4.5, reviews:76, verified:false, phone:"+91 98490 11223", since:2024, emoji:"👩‍🌾", color:"#e9a817", about:"Women-led FPO processing high-curcumin turmeric fingers and powder.", crops:["Turmeric","Ginger","Garlic"]},
    {id:"f12", name:"Srinivas Rao", farm:"Rao Sugarcane Farms", state:"Telangana", district:"Suryapet", mandal:"Kodad", village:"Huzurnagar", exp:20, size:"25 acres", method:"Conventional", rating:4.3, reviews:64, verified:true, phone:"+91 98491 22334", since:2019, emoji:"🧑‍🌾", color:"#166b45", about:"Sugarcane and paddy with drip fertigation. Supplies jaggery units across the district.", crops:["Sugarcane","Paddy","Sesame"]}
  ];

  const CATS = [
    {id:"vegetables", name:"Vegetables", emoji:"🍅", grad:"linear-gradient(135deg,#ff9a6c,#e05252)", desc:"Farm-fresh daily harvest"},
    {id:"fruits", name:"Fruits", emoji:"🥭", grad:"linear-gradient(135deg,#f7b733,#e86a33)", desc:"Orchard-direct sweetness"},
    {id:"grains", name:"Grains & Rice", emoji:"🌾", grad:"linear-gradient(135deg,#d9b64a,#9a6b06)", desc:"Paddy, wheat & maize"},
    {id:"pulses", name:"Pulses", emoji:"🫘", grad:"linear-gradient(135deg,#c98a4b,#7a4a12)", desc:"Protein-rich dals"},
    {id:"millets", name:"Millets", emoji:"🌿", grad:"linear-gradient(135deg,#7bc47f,#2f7d4f)", desc:"Ancient smart grains"},
    {id:"spices", name:"Spices", emoji:"🌶️", grad:"linear-gradient(135deg,#e05252,#8f1d1d)", desc:"Bold & aromatic"},
    {id:"oilseeds", name:"Oil Seeds", emoji:"🥜", grad:"linear-gradient(135deg,#d9a441,#7a5410)", desc:"Groundnut, sesame & more"},
    {id:"cotton", name:"Cotton", emoji:"☁️", grad:"linear-gradient(135deg,#9db3c8,#5b6b80)", desc:"Long-staple bales"},
    {id:"sugarcane", name:"Sugarcane", emoji:"🎋", grad:"linear-gradient(135deg,#8fdc8f,#2f7d4f)", desc:"High-sucrose cane"},
    {id:"organic", name:"Organic", emoji:"🌱", grad:"linear-gradient(135deg,#4cc484,#0e5c3a)", desc:"Certified organic picks"},
    {id:"dairy", name:"Dairy", emoji:"🥛", grad:"linear-gradient(135deg,#9fd8ef,#2b7ea8)", desc:"A2 milk & ghee"},
    {id:"seeds", name:"Seeds", emoji:"🫛", grad:"linear-gradient(135deg,#b48ce0,#5b3a9e)", desc:"Certified sowing seeds"}
  ];

  // id, name, cat, farmer, price, mrp, unit, rating, rc, organic, stock, harvest, method, grade, emoji, badge
  const P = [
    ["p1","Desi Tomato (Fresh)","vegetables","f1",32,45,"kg",4.6,214,true,140,"2026-09-12","Organic","A","🍅","Fresh Harvest"],
    ["p2","Red Onion","vegetables","f1",38,50,"kg",4.5,186,true,220,"2026-09-08","Organic","A","🧅",""],
    ["p3","Green Chilli (G4)","vegetables","f1",64,80,"kg",4.7,98,true,60,"2026-09-14","Organic","A","🌶️","Spicy Pick"],
    ["p4","Banganapalli Mango","fruits","f2",145,180,"kg",4.9,187,true,90,"2026-09-10","Natural","Premium","🥭","Bestseller"],
    ["p5","Allahabad Guava","fruits","f2",70,90,"kg",4.7,120,true,110,"2026-09-13","Natural","A","🍈",""],
    ["p6","Sona Masoori Rice","grains","f3",62,74,"kg",4.6,340,false,1500,"2026-08-28","Conventional","A","🍚","Bestseller"],
    ["p7","Yellow Maize","grains","f3",28,34,"kg",4.4,76,false,2000,"2026-08-20","Conventional","FAQ","🌽","Bulk Available"],
    ["p8","A2 Desi Cow Milk","dairy","f4",75,85,"litre",4.8,260,true,80,"2026-09-17","Organic","A","🥛","Daily Fresh"],
    ["p9","Baby Spinach","vegetables","f4",30,40,"bunch",4.6,88,true,70,"2026-09-16","Organic","A","🥬","Fresh Harvest"],
    ["p10","Lakadong Turmeric Powder","spices","f5",320,400,"kg",4.9,178,true,150,"2026-07-15","Organic","Premium","🟡","High Curcumin"],
    ["p11","Guntur Red Chilli (Dry)","spices","f5",280,340,"kg",4.7,143,true,200,"2026-08-05","Organic","A","🌶️",""],
    ["p12","Foxtail Millet (Unpolished)","millets","f6",95,120,"kg",4.5,98,true,400,"2026-08-18","Natural","A","🌾","Diabetic Friendly"],
    ["p13","Ragi (Finger Millet)","millets","f6",68,85,"kg",4.6,84,true,350,"2026-08-22","Natural","A","🤎",""],
    ["p14","Fresh Strawberries","fruits","f7",240,300,"box",4.9,231,false,45,"2026-09-16","Protected","Premium","🍓","Same-day"],
    ["p15","Colour Capsicum Trio","vegetables","f7",120,150,"kg",4.7,96,false,55,"2026-09-15","Protected","A","🫑","Exotic"],
    ["p16","Raw Cotton (Shankar-6)","cotton","f8",6800,7200,"quintal",4.4,42,false,60,"2026-09-01","Conventional","FAQ","☁️","Bulk Available"],
    ["p17","Red Gram (Tur Dal Whole)","pulses","f8",155,180,"kg",4.5,67,false,500,"2026-08-25","Conventional","A","🫘",""],
    ["p18","Robusta Banana","fruits","f9",48,60,"dozen",4.7,129,true,130,"2026-09-16","Natural","A","🍌","Carbide-free"],
    ["p19","Farm Coconut (with water)","fruits","f9",35,45,"piece",4.6,77,true,300,"2026-09-11","Natural","A","🥥",""],
    ["p20","Paddy Seed (MTU-1010)","seeds","f10",52,65,"kg",4.6,112,false,800,"2026-08-10","Certified","Certified","🌱","90% Germination"],
    ["p21","Hybrid Tomato Seed","seeds","f10",450,550,"100g",4.5,58,false,120,"2026-07-30","Certified","Certified","🫛",""],
    ["p22","Salem Turmeric Fingers","spices","f11",210,260,"kg",4.5,76,true,180,"2026-08-12","Organic","A","🫚","Women-led FPO"],
    ["p23","Sugarcane (Co-86032)","sugarcane","f12",3150,3400,"tonne",4.3,31,false,40,"2026-09-05","Conventional","FAQ","🎋","Bulk Available"],
    ["p24","White Sesame","oilseeds","f12",185,220,"kg",4.4,45,false,260,"2026-08-28","Conventional","A","🍶",""],
    ["p25","Groundnut (with shell)","oilseeds","f3",140,165,"kg",4.6,92,false,420,"2026-08-30","Conventional","A","🥜",""],
    ["p26","Jowar (Sorghum)","millets","f6",58,72,"kg",4.4,63,true,380,"2026-08-15","Natural","A","🌿",""],
    ["p27","Farm Papaya","fruits","f9",55,70,"kg",4.5,84,true,95,"2026-09-14","Natural","A","🧡",""],
    ["p28","Desi Ghee (A2)","dairy","f4",720,850,"litre",4.9,198,true,40,"2026-09-02","Organic","Premium","🫙","Bestseller"],
    ["p29","Black Gram (Urad)","pulses","f8",170,195,"kg",4.4,51,false,300,"2026-08-20","Conventional","A","⚫",""],
    ["p30","Green Moong","pulses","f3",135,155,"kg",4.5,73,false,340,"2026-08-24","Conventional","A","🟢",""],
    ["p31","Organic Veggie Combo Box","organic","f1",499,649,"box",4.8,167,true,35,"2026-09-16","Organic","A","🧺","Value Pack"],
    ["p32","Broccoli Crown","vegetables","f7",90,120,"kg",4.6,74,false,48,"2026-09-15","Protected","A","🥦","Exotic"],
    ["p33","Sweet Lime (Mosambi)","fruits","f2",80,100,"kg",4.6,93,true,105,"2026-09-12","Natural","A","🍋",""],
    ["p34","Coriander Seed (Split)","spices","f5",190,230,"kg",4.6,88,true,160,"2026-08-08","Organic","A","🌿",""],
    ["p35","Sunflower Seed","oilseeds","f8",95,115,"kg",4.3,39,false,450,"2026-08-18","Conventional","FAQ","🌻","Bulk Available"],
    ["p36","Red Banana (Chakkarakeli)","fruits","f9",85,110,"dozen",4.8,66,true,60,"2026-09-15","Natural","Premium","🍌","Rare"]
  ];

  const PRODUCTS = P.map(r => {
    const f = FARMERS.find(x => x.id === r[3]);
    return {id:r[0], name:r[1], cat:r[2], farmerId:r[3], price:r[4], mrp:r[5], unit:r[6],
      rating:r[7], rc:r[8], organic:r[9], stock:r[10], harvest:r[11], method:r[12], grade:r[13],
      emoji:r[14], badge:r[15], desc:`${r[1]} sourced directly from ${f.farm} (${f.village}, ${f.district}). ${r[12]} cultivation, ${r[13]} grade, harvested ${r[11]}. No middlemen — fair price to the farmer, fresh produce to you.`,
      storage:"Store in a cool, dry place away from sunlight. Refrigerate leafy/perishable items.",
      moq: r[6]==="tonne"||r[6]==="quintal" ? "Bulk only" : "1 "+r[6]};
  });

  const MARKET = [
    {crop:"Paddy (Sona Masoori)", market:"Nalgonda", price:2383, prev:2310, unit:"quintal"},
    {crop:"Red Chilli (Dry)", market:"Warangal", price:18200, prev:18750, unit:"quintal"},
    {crop:"Turmeric (Fingers)", market:"Karimnagar", price:9450, prev:9100, unit:"quintal"},
    {crop:"Maize (Yellow)", market:"Suryapet", price:2225, prev:2190, unit:"quintal"},
    {crop:"Cotton (Shankar-6)", market:"Bhongir", price:7121, prev:6980, unit:"quintal"},
    {crop:"Groundnut (in shell)", market:"Suryapet", price:6783, prev:6900, unit:"quintal"},
    {crop:"Red Gram", market:"Mahbubnagar", price:7550, prev:7400, unit:"quintal"},
    {crop:"Onion (Red)", market:"Hyderabad", price:2850, prev:2610, unit:"quintal"},
    {crop:"Tomato", market:"Medak", price:1950, prev:2300, unit:"quintal"},
    {crop:"Sugarcane", market:"Kodad", price:315, prev:315, unit:"quintal"},
    {crop:"Sesame (White)", market:"Huzurnagar", price:9267, prev:9050, unit:"quintal"},
    {crop:"Sunflower", market:"Bhongir", price:7280, prev:7150, unit:"quintal"}
  ];

  const SCHEMES = [
    {name:"PM-KISAN", emoji:"💰", desc:"₹6,000/year income support in 3 instalments to all land-holding farmer families.", elig:"All land-holding farmers", benefit:"₹6,000 / year direct transfer", link:"https://pmkisan.gov.in"},
    {name:"PM Fasal Bima Yojana", emoji:"🛡️", desc:"Crop insurance against yield losses from sowing to post-harvest due to natural calamities.", elig:"All farmers incl. sharecroppers", benefit:"Up to full sum insured", link:"https://pmfby.gov.in"},
    {name:"Soil Health Card", emoji:"🧪", desc:"Free soil testing every 2 years with fertiliser recommendations for your exact plot.", elig:"All farmers", benefit:"Free testing + report", link:"https://soilhealth.dac.gov.in"},
    {name:"Kisan Credit Card", emoji:"💳", desc:"Working-capital credit for crops, dairy & fisheries at 4% effective interest with prompt repayment.", elig:"Farmers, SHGs, JLGs", benefit:"Credit up to ₹3 lakh", link:"https://www.myscheme.gov.in"},
    {name:"Agri Infrastructure Fund", emoji:"🏗️", desc:"₹1 lakh crore financing for pack-houses, cold chains, sorting & drying units with 3% subvention.", elig:"FPOs, farmers, agripreneurs", benefit:"3% interest subvention", link:"https://agriinfra.dac.gov.in"},
    {name:"Rythu Bharosa (Telangana)", emoji:"🌾", desc:"Telangana state investment support per acre per season, plus bonus on paddy procurement.", elig:"Telangana land holders", benefit:"Seasonal per-acre support", link:"https://rythubharosa.telangana.gov.in"}
  ];

  const UPDATES = [
    {tag:"Market", emoji:"📈", title:"Paddy procurement opens Oct 1 across Telangana", body:"State agencies will open 7,400+ procurement centres. MSP for common paddy fixed at ₹2,383/quintal.", date:"Sep 16, 2026"},
    {tag:"Weather", emoji:"🌦️", title:"Light showers likely in Nalgonda & Suryapet", body:"IMD predicts 3 days of light rain. Farmers advised to delay pesticide sprays and protect harvested heaps.", date:"Sep 17, 2026"},
    {tag:"Scheme", emoji:"🏛️", title:"PM-KISAN 20th instalment released", body:"Over ₹20,000 crore transferred to 9.7 crore farmers. Check beneficiary status on the portal.", date:"Sep 12, 2026"},
    {tag:"Tech", emoji:"🚁", title:"Drone spraying subsidies up to 50% for FPOs", body:"Custom hiring centres can now claim half the drone cost. Training batches open in Warangal.", date:"Sep 10, 2026"},
    {tag:"Crop", emoji:"🌾", title:"Millet demand up 34% after Shree Anna push", body:"Foxtail and ragi fetching premium prices. Experts advise staggered sowing for rabi.", date:"Sep 08, 2026"},
    {tag:"Price", emoji:"🧅", title:"Onion prices firm on export demand", body:"Hyderabad mandi arrivals steady. Traders expect ₹3,000/quintal by month-end.", date:"Sep 17, 2026"}
  ];

  const LOCATIONS = {
    "Telangana": {
      "Nalgonda": {"Nalgonda":["Dandampally","Nakrekal","Chityal"], "Miryalaguda":["Damaracherla","Neredcherla"]},
      "Suryapet": {"Suryapet":["Thungathurthy","Mothey"], "Kodad":["Huzurnagar","Chilkur"]},
      "Khammam": {"Khammam":["Wyra","Madhira"], "Kothagudem":["Yellandu","Pinapaka"]},
      "Warangal": {"Parkal":["Narsampet","Chennaraopet"], "Hanamkonda":["Kazipet","Inavolu"]},
      "Karimnagar": {"Huzurabad":["Jammikunta","Veenavanka"], "Manthani":["Peddapalli","Ramagundam"]},
      "Hyderabad": {"Uppal":["Ghatkesar","Nacharam"], "Secunderabad":["Malkajgiri","Alwal"]}
    }
  };

  const REVIEWS = [
    {user:"Priya S.", productId:"p4", rating:5, title:"Sweetest mangoes online", text:"Arrived in 2 days, perfectly ripe. Better than the supermarket.", date:"Sep 14, 2026", verified:true},
    {user:"Rahul V.", productId:"p6", rating:5, title:"Genuine Sona Masoori", text:"Cooks fluffy, no polish smell. Ordering 25kg every month now.", date:"Sep 11, 2026", verified:true},
    {user:"Fatima K.", productId:"p10", rating:5, title:"Colour & aroma unreal", text:"You can smell it's pure. My sambar tastes like childhood again.", date:"Sep 09, 2026", verified:true},
    {user:"Anil T.", productId:"p8", rating:4, title:"Thick creamy milk", text:"Good A2 milk, delivery sometimes 30 min late but quality consistent.", date:"Sep 15, 2026", verified:true},
    {user:"Sneha R.", productId:"p14", rating:5, title:"Fresh like just picked", text:"Strawberries survived Hyderabad heat in cool box. Impressive packing.", date:"Sep 13, 2026", verified:true},
    {user:"Kiran M.", productId:"p28", rating:5, title:"Grandmother-approved ghee", text:"Granular texture, divine smell. Worth every rupee.", date:"Sep 07, 2026", verified:true}
  ];

  const USERS = [
    {id:"u-customer", role:"customer", name:"Demo Customer", email:"customer@agrimarket.in", pass:"customer123", phone:"+91 90000 11111", addr:"H.No 2-45, Kothapet, Hyderabad"},
    {id:"u-farmer", role:"farmer", name:"Ramesh Patel", email:"farmer@agrimarket.in", pass:"farmer123", farmerId:"f1", phone:"+91 98480 11223"},
    {id:"u-admin", role:"admin", name:"Market Admin", email:"admin@agrimarket.in", pass:"admin123", phone:"+91 90000 99999"}
  ];

  return {FARMERS, CATS, PRODUCTS, MARKET, SCHEMES, UPDATES, LOCATIONS, REVIEWS, USERS};
})();
