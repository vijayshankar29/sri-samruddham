// Sri Samruddham invitation interactions
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyROnIKrkk8tMieYmprClykNLtnmRYvjea7mc1YSd4RIOxW7dJpDPh7H3A-JZTd7ltBPw/exec";

const opening = document.getElementById("invitation");
const mainInvitation = document.getElementById("mainInvitation");
const openButton = document.getElementById("openInvitation");
const header = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

document.body.classList.add("locked");

openButton.addEventListener("click", () => {
  opening.classList.add("exit");
  mainInvitation.classList.add("open");
  mainInvitation.setAttribute("aria-hidden", "false");
  document.body.classList.remove("locked");
  setTimeout(() => document.getElementById("home").scrollIntoView({behavior:"smooth"}), 260);
});

if(menuToggle){
  menuToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
}
navMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  navMenu.classList.remove("open");
  if(menuToggle) menuToggle.setAttribute("aria-expanded", "false");
}));
window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 30), {passive:true});

// Reveal sections
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, {threshold:.14});
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

// Subtle 3D house movement (mouse only; stays calm on touch devices)
const houseCard = document.getElementById("houseCard");
const houseStage = houseCard?.closest(".house-stage");
if (houseCard && houseStage && matchMedia("(pointer:fine)").matches) {
  houseStage.addEventListener("mousemove", e => {
    const r = houseStage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    houseCard.style.transform = `rotateY(${x * 10 - 4}deg) rotateX(${-y * 7 + 2}deg) translateZ(22px)`;
  });
  houseStage.addEventListener("mouseleave", () => {
    houseCard.style.transform = "rotateY(-7deg) rotateX(2deg) translateZ(18px)";
  });
}

// Countdown: 15 Nov 2026, 6:30 AM IST
const eventTime = new Date("2026-11-15T06:30:00+05:30").getTime();
const ids = ["days","hours","minutes","seconds"];
function updateCountdown(){
  const diff = eventTime - Date.now();
  if(diff <= 0){
    ids.forEach(id => document.getElementById(id).textContent = "00");
    document.getElementById("happening").hidden = false;
    return;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  [d,h,m,s].forEach((v,i) => document.getElementById(ids[i]).textContent = String(v).padStart(2,"0"));
}
updateCountdown();
setInterval(updateCountdown, 1000);

// Calm gold particles like the reference site's restrained floating accents.
const particleHost = document.querySelector(".gold-particles");
if(particleHost){
  for(let i=0;i<24;i++){
    const dot = document.createElement("i");
    dot.style.left = `${Math.random()*100}%`;
    dot.style.top = `${25 + Math.random()*75}%`;
    dot.style.setProperty("--dur", `${4.5 + Math.random()*5}s`);
    dot.style.setProperty("--delay", `${-Math.random()*8}s`);
    particleHost.appendChild(dot);
  }
}

// RSVP: clicking either choice immediately submits name + availability + server timestamp.
// The Google Sheet URL itself is never placed in this client code.
const form = document.getElementById("rsvpForm");
const nameInput = document.getElementById("guestName");
const statusEl = document.getElementById("formStatus");
const choices = [...document.querySelectorAll(".rsvp-choice")];

async function sendRSVP(attendance){
  const name = nameInput.value.trim();
  if(!name){
    statusEl.textContent = "Please enter your name first.";
    statusEl.className = "status error";
    nameInput.focus();
    return;
  }
  if(document.getElementById("website").value) return; // bot honeypot
  if(!APPS_SCRIPT_URL.startsWith("https://script.google.com/")){
    statusEl.textContent = "RSVP backend is not connected yet. Add the Apps Script Web App URL in script.js.";
    statusEl.className = "status error";
    return;
  }

  choices.forEach(b => b.disabled = true);
  statusEl.textContent = "Sending your RSVP…";
  statusEl.className = "status";

  try{
    // text/plain avoids a CORS preflight. Apps Script parses JSON from e.postData.contents.
    const response = await fetch(APPS_SCRIPT_URL, {
      method:"POST",
      headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify({
        name,
        attendance,
        page:location.href,
        clientTime:new Date().toISOString()
      })
    });
    const result = await response.json();
    if(!result.ok) throw new Error(result.error || "Submission failed");

    statusEl.textContent = attendance === "I'll be there"
      ? "Thank you — we’re looking forward to celebrating with you!"
      : "Thank you for letting us know. We’ll miss you!";
    statusEl.className = "status success";
    choices.forEach(b => b.disabled = false);
  }catch(err){
    statusEl.textContent = "We couldn’t save the RSVP just now. Please try again.";
    statusEl.className = "status error";
    choices.forEach(b => b.disabled = false);
  }
}
choices.forEach(btn => btn.addEventListener("click", () => sendRSVP(btn.dataset.attendance)));
form.addEventListener("submit", e => e.preventDefault());
