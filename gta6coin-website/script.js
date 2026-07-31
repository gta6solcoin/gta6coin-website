const CONTRACT = "EaxAUcXxNnVwcqm2BBocbows7D1XVY2Q63V38NEypump";
const RELEASE_DATE = new Date("2026-11-19T00:00:00");

const pad = (number, length = 2) => String(Math.max(0, number)).padStart(length, "0");

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
