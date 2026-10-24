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
  print.style.setProperty("--print-angle", next.rotation);
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

// Motion follows the visitor's scroll rather than running an idle animation loop.
const scenes = [...document.querySelectorAll("[data-motion-scene]")];
const activeScenes = new Set();
let sceneFrame = 0;
function paintScenes() {
  sceneFrame = 0;
  if (document.hidden || motionPreference.matches) return;
  const viewport = window.innerHeight;
  activeScenes.forEach((scene) => {
    const rect = scene.getBoundingClientRect();
    const progress = Math.max(
      -1,
      Math.min(
        1,
        (rect.top + rect.height / 2 - viewport / 2) /
          (viewport / 2 + rect.height / 2),
      ),
    );
    scene.style.setProperty("--scene-progress", progress.toFixed(3));
  });
}
function queueSceneFrame() {
  if (!sceneFrame && !motionPreference.matches && !document.hidden) {
    sceneFrame = requestAnimationFrame(paintScenes);
  }
}
if ("IntersectionObserver" in window) {
  const sceneObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) activeScenes.add(entry.target);
      else activeScenes.delete(entry.target);
    });
    queueSceneFrame();
  });
  scenes.forEach((scene) => sceneObserver.observe(scene));
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove("is-reveal-pending");
        entry.target.classList.add("is-revealed");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0, rootMargin: "0px 0px 60px 0px" },
  );
  const revealNodes = document.querySelectorAll(
    ".product__heading, .anki-copy, .approach__copy, .approach h2, .rhythm, .recognition__copy, .recognition__logos, .footer__top",
  );
  revealNodes.forEach((node) => {
    if (!motionPreference.matches) node.classList.add("is-reveal-pending");
    revealObserver.observe(node);
  });
  window.addEventListener("scroll", queueSceneFrame, { passive: true });
  window.addEventListener("resize", queueSceneFrame, { passive: true });
  document.addEventListener("visibilitychange", queueSceneFrame);
  motionPreference.addEventListener("change", () => {
    revealNodes.forEach((node) => node.classList.remove("is-reveal-pending"));
    scenes.forEach((scene) => scene.style.setProperty("--scene-progress", "0"));
    queueSceneFrame();
  });
}

const art = document.querySelector(".hero-art");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
art?.addEventListener("pointermove", (event) => {
  if (motionPreference.matches || !finePointer.matches) return;
  const rect = art.getBoundingClientRect();
  art.style.setProperty(
    "--art-y",
    (((event.clientX - rect.left) / rect.width) * 6 - 3).toFixed(2) + "deg",
  );
  art.style.setProperty(
    "--art-x",
    (3 - ((event.clientY - rect.top) / rect.height) * 6).toFixed(2) + "deg",
  );
});
function resetArtPose() {
  art?.style.setProperty("--art-x", "0deg");
  art?.style.setProperty("--art-y", "0deg");
}
art?.addEventListener("pointerleave", resetArtPose);
motionPreference.addEventListener("change", resetArtPose);
