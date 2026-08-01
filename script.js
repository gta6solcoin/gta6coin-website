const CONTRACT = "EaxAUcXxNnVwcqm2BBocbows7D1XVY2Q63V38NEypump";
const RELEASE_DATE = new Date("2026-11-19T00:00:00");

const pad = (number, length = 2) => String(Math.max(0, number)).padStart(length, "0");

const siteHeader = document.querySelector(".site-header");
const menuToggle = document.getElementById("menuToggle");
const mainNavigation = document.getElementById("mainNavigation");

function closeSectionMenu() {
  siteHeader.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open section menu");
}

menuToggle.addEventListener("click", event => {
  event.stopPropagation();
  const open = siteHeader.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close section menu" : "Open section menu");
});

mainNavigation.querySelectorAll("a").forEach(link => link.addEventListener("click", closeSectionMenu));
document.addEventListener("click", event => {
  if (!siteHeader.contains(event.target)) closeSectionMenu();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeSectionMenu();
});

function updateCountdown() {
  const distance = RELEASE_DATE.getTime() - Date.now();

  if (distance <= 0) {
    document.getElementById("days").textContent = "000";
    document.getElementById("hours").textContent = "00";
    document.getElementById("minutes").textContent = "00";
    document.getElementById("seconds").textContent = "00";
    return;
  }

  const days = Math.floor(distance / 86400000);
  const hours = Math.floor((distance % 86400000) / 3600000);
  const minutes = Math.floor((distance % 3600000) / 60000);
  const seconds = Math.floor((distance % 60000) / 1000);

  document.getElementById("days").textContent = pad(days, 3);
  document.getElementById("hours").textContent = pad(hours);
  document.getElementById("minutes").textContent = pad(minutes);
  document.getElementById("seconds").textContent = pad(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);

const copyButton = document.getElementById("copyContract");
const copyText = document.getElementById("copyText");
const toast = document.getElementById("toast");

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(CONTRACT);
  } catch {
    const area = document.createElement("textarea");
    area.value = CONTRACT;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }

  copyText.textContent = "Copied";
  toast.classList.add("show");
  setTimeout(() => {
    copyText.textContent = "Copy";
    toast.classList.remove("show");
  }, 1800);
});

const observer = new IntersectionObserver(
  entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  }),
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach(element => observer.observe(element));
document.getElementById("year").textContent = new Date().getFullYear();

const RADIO_STATIONS = [
  { name: "Interface", artist: "Three Chain Links", frequency: "104.2", file: "assets/audio/three-chain-links-interface.mp3" },
  { name: "Synthetic Pleasures", artist: "MOKKA", frequency: "88.6", file: "assets/audio/mokka-synthetic-pleasures.mp3" },
  { name: "Planet X", artist: "LIL MORĪ", frequency: "101.6", file: "assets/audio/lil-mori-planet-x.mp3" },
  { name: "VHS", artist: "Sci Fi Cyberpunk", frequency: "98.3", file: "assets/audio/sci-fi-cyberpunk-vhs.mp3" }
];

const radio = document.getElementById("radio");
const radioPanel = document.getElementById("radioPanel");
const radioFab = document.getElementById("radioFab");
const radioClose = document.getElementById("radioClose");
const radioPlay = document.getElementById("radioPlay");
const radioPrevious = document.getElementById("radioPrevious");
const radioNext = document.getElementById("radioNext");
const radioVolume = document.getElementById("radioVolume");
const radioStations = document.getElementById("radioStations");
const radioStation = document.getElementById("radioStation");
const radioGenre = document.getElementById("radioGenre");
const radioFabStation = document.getElementById("radioFabStation");

let stationIndex = 0;
let radioIsPlaying = false;
const radioAudio = new Audio(RADIO_STATIONS[0].file);
radioAudio.preload = "metadata";
radioAudio.volume = Number(radioVolume.value) / 100;

function updateRadioStation() {
  const station = RADIO_STATIONS[stationIndex];
  radioStation.textContent = station.name;
  radioFabStation.textContent = station.name;
  radioGenre.textContent = `${station.artist} · ${station.frequency} FM`;
  document.querySelectorAll(".radio-station").forEach((button, index) => {
    button.classList.toggle("active", index === stationIndex);
    button.setAttribute("aria-pressed", index === stationIndex ? "true" : "false");
  });
}

async function setStation(index) {
  const wasPlaying = radioIsPlaying;
  stationIndex = (index + RADIO_STATIONS.length) % RADIO_STATIONS.length;
  radioAudio.src = RADIO_STATIONS[stationIndex].file;
  radioAudio.load();
  updateRadioStation();
  if (wasPlaying) {
    try {
      await radioAudio.play();
    } catch {
      setRadioPlaying(false);
    }
  }
}

function setRadioPlaying(playing) {
  radioIsPlaying = playing;
  radio.classList.toggle("playing", playing);
  radioPlay.textContent = playing ? "❚❚" : "▶";
  radioPlay.setAttribute("aria-label", playing ? "Pause radio" : "Play radio");
  radioPlay.setAttribute("aria-pressed", String(playing));
}

RADIO_STATIONS.forEach((station, index) => {
  const button = document.createElement("button");
  button.className = "radio-station";
  button.type = "button";
  button.innerHTML = `<strong>${station.name}</strong><small>${station.artist}</small>`;
  button.addEventListener("click", () => setStation(index));
  radioStations.appendChild(button);
});

radioFab.addEventListener("click", () => {
  const open = radio.classList.toggle("open");
  radioFab.setAttribute("aria-expanded", String(open));
  radioPanel.setAttribute("aria-hidden", String(!open));
});

radioClose.addEventListener("click", () => {
  radio.classList.remove("open");
  radioFab.setAttribute("aria-expanded", "false");
  radioPanel.setAttribute("aria-hidden", "true");
  radioFab.focus();
});

radioPlay.addEventListener("click", async () => {
  if (radioIsPlaying) {
    radioAudio.pause();
    setRadioPlaying(false);
  } else {
    try {
      await radioAudio.play();
      setRadioPlaying(true);
    } catch {
      setRadioPlaying(false);
    }
  }
});

radioPrevious.addEventListener("click", () => setStation(stationIndex - 1));
radioNext.addEventListener("click", () => setStation(stationIndex + 1));
radioVolume.addEventListener("input", () => {
  radioAudio.volume = Number(radioVolume.value) / 100;
});
radioAudio.addEventListener("ended", () => setStation(stationIndex + 1));
radioAudio.addEventListener("error", () => setRadioPlaying(false));

updateRadioStation();

async function startRadioSoftly() {
  if (radioIsPlaying) return;
  try {
    await radioAudio.play();
    setRadioPlaying(true);
    document.removeEventListener("pointerdown", startRadioSoftly);
    document.removeEventListener("keydown", startRadioSoftly);
  } catch {
    document.addEventListener("pointerdown", startRadioSoftly, { once: true });
    document.addEventListener("keydown", startRadioSoftly, { once: true });
  }
}

startRadioSoftly();
