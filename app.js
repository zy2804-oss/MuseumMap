const museums = [
  {id:'met', logo:'THE<br>MET', name:'The Met', category:'art', categoryLabel:'Art Museum', coords:[40.7794,-73.9632], price:'$30 adult; NY residents & NY/NJ/CT students pay what they wish', address:'1000 Fifth Avenue, New York, NY 10028', hours:'Sun–Thu 10 am–5 pm; Fri–Sat 10 am–9 pm; closed Wed', highlight:'Temple of Dendur', access:'Step-free entrances at 81st St & Fifth Ave; wheelchairs available first-come, first-served.', booking:'Advance tickets are optional; group visits of 10+ must register.', website:'https://www.metmuseum.org/plan-your-visit', image:'linear-gradient(135deg,#606d57,#e1c698)'},
  {id:'moma', logo:'MoMA', name:'MoMA', category:'art', categoryLabel:'Art Museum', coords:[40.7614,-73.9776], price:'$30 adult; free for members', address:'11 West 53 Street, New York, NY 10019', hours:'Sun–Fri 10:30 am–5:30 pm; Sat 10:30 am–7 pm', highlight:'Vincent van Gogh, The Starry Night', access:'Accessible entrance, elevators, wheelchairs and assistive listening available.', booking:'Timed tickets are recommended; purchase online before arrival.', website:'https://www.moma.org/visit/plan-your-visit/', image:'linear-gradient(135deg,#d77758,#e5d2bd)'},
  {id:'amnh', logo:'AMNH', name:'American Museum of Natural History', category:'natural', categoryLabel:'Natural History & Science', coords:[40.7813,-73.9740], price:'$37 adult; NY State residents pay what they wish for general admission', address:'200 Central Park West, New York, NY 10024', hours:'Daily 10 am–5:30 pm; closed Thanksgiving & Christmas', highlight:'Titanosaur & the Rose Center for Earth and Space', access:'Step-free entrances at Gilder Center, Rose Center & garage; accessible routes available.', booking:'Advance tickets recommended for faster entry; ticketed exhibitions select an entry time.', website:'https://www.amnh.org/plan-your-visit', image:'linear-gradient(135deg,#587d8a,#ddbc7d)'}
];

const state = {category:'all', filters:new Set(['open']), visits:JSON.parse(localStorage.getItem('museum-visits') || '[]'), userLocation:null};
const menu = document.querySelector('#menu'), detail = document.querySelector('#detail-panel'), account = document.querySelector('#account-panel'), scrim = document.querySelector('.scrim'), caption = document.querySelector('#map-caption');
const map = L.map('map', {zoomControl:false, attributionControl:true}).setView([40.7735, -73.9705], 14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'© OpenStreetMap contributors'}).addTo(map);

const markerIcon = L.divIcon({className:'museum-pin', html:'<span>●</span>', iconSize:[28,28], iconAnchor:[14,28]});
museums.forEach(m => L.marker(m.coords, {icon:markerIcon, title:m.name}).addTo(map).on('click', () => openDetail(m.id)));

function milesBetween(a,b) { const rad = x => x * Math.PI / 180, earth = 3958.8, dLat=rad(b[0]-a[0]), dLng=rad(b[1]-a[1]); const h=Math.sin(dLat/2)**2 + Math.cos(rad(a[0]))*Math.cos(rad(b[0]))*Math.sin(dLng/2)**2; return 2*earth*Math.asin(Math.sqrt(h)); }
function displayDistance(m) { return state.userLocation ? `${milesBetween(state.userLocation,m.coords).toFixed(1)} mi` : 'Distance unavailable'; }
function locateUser() {
  if (!navigator.geolocation) { caption.innerHTML='<span>●</span> Location is not supported in this browser'; return; }
  navigator.geolocation.getCurrentPosition(position => {
    state.userLocation=[position.coords.latitude,position.coords.longitude];
    const userIcon=L.divIcon({className:'user-pin', html:'<span></span>', iconSize:[22,22], iconAnchor:[11,11]});
    L.marker(state.userLocation,{icon:userIcon,interactive:false}).addTo(map).bindTooltip('You are here',{permanent:true,direction:'top',offset:[0,-11]});
    map.setView(state.userLocation, 14); caption.innerHTML='<span>●</span> You are here · museums nearby'; renderCards();
  }, () => { caption.innerHTML='<span>●</span> New York museums · location not shared'; renderCards(); }, {enableHighAccuracy:true,timeout:10000,maximumAge:600000});
}

function closePanels() { [menu,detail,account].forEach(p => {p.classList.remove('is-open');p.setAttribute('aria-hidden','true');}); scrim.classList.remove('is-visible'); document.querySelector('#menu-button').setAttribute('aria-expanded','false'); }
function openPanel(panel) { closePanels(); panel.classList.add('is-open'); panel.setAttribute('aria-hidden','false'); scrim.classList.add('is-visible'); }
function logo(m) { return `<span class="museum-logo ${m.id}">${m.logo}</span>`; }
function renderCards() {
  const list = museums.filter(m => (state.category==='all'||m.category===state.category) && (!state.filters.has('free') || m.price.includes('pay what'))).sort((a,b) => state.filters.has('near') && state.userLocation ? milesBetween(state.userLocation,a.coords)-milesBetween(state.userLocation,b.coords) : 0);
  document.querySelector('#museum-cards').innerHTML = list.length ? list.map(m => `<button class="museum-card" data-museum="${m.id}">${logo(m)}<span><strong>${m.name}</strong><small>${m.categoryLabel}</small></span><span class="distance">${displayDistance(m)}</span></button>`).join('') : '<p class="empty">No museums match these filters.</p>';
}
function openDetail(id) {
  const m=museums.find(x=>x.id===id);
  detail.innerHTML=`<div class="detail-image" style="background:${m.image}"></div><button class="icon-button detail-close" aria-label="Close museum details and return to map">×</button><div class="detail-top"><div><p class="detail-type">${m.categoryLabel}</p><h2>${m.name}</h2></div></div><p class="detail-distance">● ${displayDistance(m)} away</p><section class="highlight"><p class="eyebrow">Collection highlight</p><p>${m.highlight}</p></section><dl class="facts"><div><dt>Hours</dt><dd>${m.hours}</dd></div><div><dt>Address</dt><dd>${m.address}</dd></div><div><dt>Admission</dt><dd>${m.price}</dd></div><div><dt>Accessibility</dt><dd>${m.access}</dd></div><div><dt>Reservation</dt><dd>${m.booking}</dd></div></dl><button class="visit-button" data-visit-form="${id}">I went here</button><a class="official-link" href="${m.website}" target="_blank" rel="noopener noreferrer">Official website ↗</a>`;
  openPanel(detail);
}
function renderAccount(mode) {
  const title=mode==='next'?'Next visit':'My museum trail';
  const content=mode==='next'?'<p class="empty">This space is waiting for your next museum idea.</p>':`<div class="stats"><div><b>${state.visits.length}</b><small>visits</small></div><div><b>${new Set(state.visits.map(v=>v.museum)).size}</b><small>museums</small></div></div>${state.visits.length?`<div class="timeline">${state.visits.slice().reverse().map(v=>`<div class="timeline-item"><time>${v.date}</time><div><strong>${museums.find(m=>m.id===v.museum).name}</strong>${v.note||'Visited'}</div></div>`).join('')}</div>`:'<p class="empty">Mark a museum as visited to begin your personal timeline.</p>'}`;
  account.dataset.mode=mode; account.innerHTML=`<div class="account-top"><div><p class="eyebrow">${mode==='account'?'Your record':'Your list'}</p><h2>${title}</h2></div><button class="icon-button account-close" aria-label="Close ${title} and return to map">×</button></div><p class="account-subtitle">${mode==='account'?'A private record stored on this device.':' '}</p>${content}`; openPanel(account);
}

document.querySelector('#menu-button').addEventListener('click',()=>{openPanel(menu);document.querySelector('#menu-button').setAttribute('aria-expanded','true');});
document.querySelector('.close-menu').addEventListener('click',closePanels); scrim.addEventListener('click',closePanels); document.querySelector('.wordmark').addEventListener('click',closePanels);
document.addEventListener('click', event => {
  const t=event.target.closest('[data-museum],[data-page],[data-visit-form],[data-zoom],.detail-close,.account-close,.tabs button,.filter'); if(!t)return;
  if(t.dataset.museum) openDetail(t.dataset.museum); if(t.dataset.page&&t.dataset.page!=='home') renderAccount(t.dataset.page); if(t.dataset.zoom) t.dataset.zoom==='in'?map.zoomIn():map.zoomOut();
  if(t.dataset.visitForm){const id=t.dataset.visitForm;t.insertAdjacentHTML('afterend',`<form class="visit-form" data-visit="${id}"><label>Date <input required type="date" name="date" value="${new Date().toISOString().slice(0,10)}"></label><label>Note <textarea name="note" placeholder="What stayed with you?"></textarea></label><label>Photo <input type="file" name="photo" accept="image/*"></label><button class="submit-visit">Add to my trail</button></form>`);t.remove();}
  if(t.matches('.detail-close,.account-close'))closePanels(); if(t.matches('.tabs button')){state.category=t.dataset.category;document.querySelectorAll('.tabs button').forEach(b=>b.setAttribute('aria-selected',String(b===t)));renderCards();} if(t.matches('.filter')){const f=t.dataset.filter;state.filters.has(f)?state.filters.delete(f):state.filters.add(f);t.classList.toggle('is-active',state.filters.has(f));renderCards();}
});
document.addEventListener('submit',async event=>{if(!event.target.matches('[data-visit]'))return;event.preventDefault();const data=new FormData(event.target),photo=data.get('photo');let image='';if(photo&&photo.size)image=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(photo);});state.visits.push({museum:event.target.dataset.visit,date:data.get('date'),note:data.get('note'),image});localStorage.setItem('museum-visits',JSON.stringify(state.visits));openDetail(event.target.dataset.visit);});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closePanels();});
renderCards(); locateUser();
