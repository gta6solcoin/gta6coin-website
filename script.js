const CONTRACT = "EaxAUcXxNnVwcqm2BBocbows7D1XVY2Q63V38NEypump";
const RELEASE_DATE = new Date("2026-11-19T00:00:00");
const DEXSCREENER_PAIR_API = "https://api.dexscreener.com/latest/dex/pairs/solana/9kgswjrkczs3ebukvbkbgdwj8bwtdwzzqxkufdhaps2a";

const pad = (number, length = 2) => String(Math.max(0, number)).padStart(length, "0");

const siteHeader = document.querySelector(".site-header");
const menuToggle = document.getElementById("menuToggle");
const mainNavigation = document.getElementById("mainNavigation");
const headerDays = document.getElementById("headerDays");

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

function updateStickyHeader() {
  siteHeader.classList.toggle("scrolled", window.scrollY > 280);
}

updateStickyHeader();
window.addEventListener("scroll", updateStickyHeader, { passive: true });

function updateCountdown() {
  const distance = RELEASE_DATE.getTime() - Date.now();

  if (distance <= 0) {
    document.getElementById("days").textContent = "000";
    headerDays.textContent = "000";
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
  headerDays.textContent = pad(days, 3);
  document.getElementById("hours").textContent = pad(hours);
  document.getElementById("minutes").textContent = pad(minutes);
  document.getElementById("seconds").textContent = pad(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);

const marketPrice = document.getElementById("marketPrice");
const marketCap = document.getElementById("marketCap");
const marketLiquidity = document.getElementById("marketLiquidity");
const marketVolume = document.getElementById("marketVolume");
const marketChange = document.getElementById("marketChange");
const marketUpdated = document.getElementById("marketUpdated");

const compactCurrency = value => {
  if (!Number.isFinite(Number(value))) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2
  }).format(Number(value));
};

const tokenPrice = value => {
  const price = Number(value);
  if (!Number.isFinite(price)) return "—";
  const digits = price >= 1 ? 2 : price >= .01 ? 4 : 8;
  return `$${price.toLocaleString("en-US", { maximumFractionDigits: digits })}`;
};

async function updateMarketStats() {
  try {
    const response = await fetch(DEXSCREENER_PAIR_API, { cache: "no-store" });
    if (!response.ok) throw new Error(`Dexscreener returned ${response.status}`);
    const data = await response.json();
    const pair = data.pair || data.pairs?.[0];
    if (!pair) throw new Error("Market pair unavailable");

    const change = Number(pair.priceChange?.h24);
    marketPrice.textContent = tokenPrice(pair.priceUsd);
    marketCap.textContent = compactCurrency(pair.marketCap || pair.fdv);
    marketLiquidity.textContent = compactCurrency(pair.liquidity?.usd);
    marketVolume.textContent = compactCurrency(pair.volume?.h24);
    marketChange.textContent = Number.isFinite(change) ? `${change >= 0 ? "+" : ""}${change.toFixed(2)}%` : "—";
    marketChange.classList.toggle("positive", change >= 0);
    marketChange.classList.toggle("negative", change < 0);
    marketUpdated.textContent = `Live Dexscreener data · updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    marketUpdated.textContent = "Live figures temporarily unavailable · open Dexscreener for current data";
  }
}

updateMarketStats();
setInterval(updateMarketStats, 30000);

const toast = document.getElementById("toast");

document.querySelectorAll("[data-copy-contract]").forEach(copyButton => {
  const copyText = copyButton.querySelector("span");
  const defaultText = copyText.textContent;

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
      copyText.textContent = defaultText;
      toast.classList.remove("show");
    }, 1800);
  });
});

const observer = new IntersectionObserver(
  entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  }),
  { threshold: 0.06, rootMargin: "0px 0px -10% 0px" }
);

document.querySelectorAll(".reveal").forEach(element => observer.observe(element));
document.getElementById("year").textContent = new Date().getFullYear();

const RADIO_STATIONS = [
  { name: "Synthetic Pleasures", artist: "MOKKA", frequency: "88.6", file: "assets/audio/mokka-synthetic-pleasures.mp3" },
  { name: "Interface", artist: "Three Chain Links", frequency: "104.2", file: "assets/audio/three-chain-links-interface.mp3" },
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
