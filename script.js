const menuButton = document.querySelector("[data-menu-button]");
const navigation = document.querySelector("[data-nav]");
function closeMenu() {
  menuButton?.setAttribute("aria-expanded", "false");
  if (menuButton)
    menuButton.innerHTML = 'Menu <span aria-hidden="true">+</span>';
  navigation?.classList.remove("is-open");
}
menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.innerHTML = open
    ? 'Close <span aria-hidden="true">−</span>'
    : 'Menu <span aria-hidden="true">+</span>';
  navigation?.classList.toggle("is-open", open);
});
navigation
  ?.querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuButton?.getAttribute("aria-expanded") === "true"
  ) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia("(min-width: 761px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});
document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const portrait = document.querySelector("[data-art-portrait]");
const print = document.querySelector("[data-art-print]");
const remix = document.querySelector("[data-remix]");
const prints = [
  { position: "50% 0%", paper: "#e7bbce", rotation: "-5deg" },
  { position: "100% 100%", paper: "#b5cbd4", rotation: "3deg" },
  { position: "0% 0%", paper: "#ebbd9b", rotation: "-3deg" },
  { position: "50% 100%", paper: "#e5b8cb", rotation: "5deg" },
];
let printIndex = 0;
remix?.addEventListener("click", () => {
  printIndex = (printIndex + 1) % prints.length;
  const next = prints[printIndex];
  portrait.style.backgroundPosition = next.position;
  print.style.background = next.paper;
  print.style.transform = "rotate(" + next.rotation + ")";
});

const film = document.querySelector("[data-film]");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
let filmVisible = false;
function syncFilmPlayback() {
  if (!film) return;
  if (
    filmVisible &&
    !document.hidden &&
    !motionPreference.matches &&
    !navigator.connection?.saveData
  ) {
    film.play().catch(() => {
      /* The poster remains visible if autoplay is unavailable. */
    });
  } else {
    film.pause();
  }
}
if (film && "IntersectionObserver" in window) {
  new IntersectionObserver(
    (entries) => {
      filmVisible = entries[0].isIntersecting;
      syncFilmPlayback();
    },
    { threshold: 0.15 },
  ).observe(film);
  motionPreference.addEventListener("change", syncFilmPlayback);
  document.addEventListener("visibilitychange", syncFilmPlayback);
}
