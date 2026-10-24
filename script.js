document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const portrait = document.querySelector("[data-art-portrait]");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const prints = ["50% 0%", "100% 100%", "0% 0%", "50% 100%"];
let printIndex = 0;
let portraitVisible = !("IntersectionObserver" in window);
let printTimer = 0;

function nextPrint() {
  if (!portrait) return;
  printIndex = (printIndex + 1) % prints.length;
  portrait.style.backgroundPosition = prints[printIndex];
}

function canCyclePrint() {
  return (
    portrait &&
    portraitVisible &&
    !document.hidden &&
    !motionPreference.matches &&
    !navigator.connection?.saveData
  );
}

function syncPrintCycle() {
  window.clearTimeout(printTimer);
  printTimer = 0;
  if (!canCyclePrint()) return;
  printTimer = window.setTimeout(() => {
    printTimer = 0;
    if (canCyclePrint()) nextPrint();
    syncPrintCycle();
  }, 6000);
}

if (portrait) {
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => {
        portraitVisible =
          entry.isIntersecting && entry.intersectionRatio >= 0.15;
        syncPrintCycle();
      },
      { threshold: 0.15 },
    ).observe(portrait);
  }
  motionPreference.addEventListener("change", syncPrintCycle);
  document.addEventListener("visibilitychange", syncPrintCycle);
  navigator.connection?.addEventListener?.("change", syncPrintCycle);
  syncPrintCycle();
}

const film = document.querySelector("[data-film]");
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
    ".product__heading, .anki-copy, .approach__copy, .approach h2, .recognition__copy, .recognition__logos",
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
