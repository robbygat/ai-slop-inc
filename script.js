document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

const films = [...document.querySelectorAll("[data-film]")];
const filmVisibility = new Map(films.map((film) => [film, false]));
const nearbyFilms = new Set();
const warmedFilms = new WeakSet();
function canUseFilmMotion() {
  return (
    !document.hidden &&
    !motionPreference.matches &&
    !navigator.connection?.saveData
  );
}
function warmFilm(film) {
  if (warmedFilms.has(film) || !canUseFilmMotion()) return;
  warmedFilms.add(film);
  film.preload = "auto";
  // Begin buffering once, before playback; never reload on a later scroll.
  film.load();
}
function syncFilmPlayback(film) {
  const panelHidden = Boolean(film.closest("[hidden]"));
  const visible = filmVisibility.get(film) && !panelHidden;
  if (!panelHidden && (nearbyFilms.has(film) || visible)) warmFilm(film);
  if (visible && canUseFilmMotion()) {
    if (film.paused) {
      film.play().catch(() => {
        /* The poster remains visible if autoplay is unavailable. */
      });
    }
  } else {
    film.pause();
  }
}
function syncAllFilmPlayback() {
  films.forEach(syncFilmPlayback);
}
if (films.length) {
  if ("IntersectionObserver" in window) {
    const warmObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) nearbyFilms.add(entry.target);
          else nearbyFilms.delete(entry.target);
          syncFilmPlayback(entry.target);
        });
      },
      { rootMargin: "400px 0px", threshold: 0 },
    );
    const filmObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Start at 15%, then keep playing down to 2% to avoid edge chatter.
          const threshold = filmVisibility.get(entry.target) ? 0.02 : 0.15;
          filmVisibility.set(
            entry.target,
            entry.isIntersecting && entry.intersectionRatio >= threshold,
          );
          syncFilmPlayback(entry.target);
        });
      },
      { threshold: [0.02, 0.15] },
    );
    films.forEach((film) => {
      warmObserver.observe(film);
      filmObserver.observe(film);
    });
  }
  motionPreference.addEventListener("change", syncAllFilmPlayback);
  document.addEventListener("visibilitychange", syncAllFilmPlayback);
  navigator.connection?.addEventListener?.("change", syncAllFilmPlayback);
  syncAllFilmPlayback();
}

const productRail = document.querySelector("[data-product-rail]");
if (productRail) {
  const cards = [...productRail.querySelectorAll(".product")];
  const compactRail = window.matchMedia("(max-width: 760px)");
  let railVisible = !("IntersectionObserver" in window);
  let interacted = false;
  let hovered = false;
  let direction = 1;
  let advanceTimer = 0;
  let settleTimer = 0;

  function positions() {
    const padding = parseFloat(getComputedStyle(productRail).paddingLeft) || 0;
    const maximum = productRail.scrollWidth - productRail.clientWidth;
    return cards.map((card) =>
      Math.max(0, Math.min(maximum, card.offsetLeft - padding)),
    );
  }
  function currentCard() {
    const offsets = positions();
    return offsets.reduce(
      (best, value, index) =>
        Math.abs(value - productRail.scrollLeft) <
        Math.abs(offsets[best] - productRail.scrollLeft)
          ? index
          : best,
      0,
    );
  }
  function stopAdvance() {
    window.clearTimeout(advanceTimer);
    advanceTimer = 0;
  }
  function moveTo(index) {
    productRail.scrollTo({
      left: positions()[index],
      behavior: motionPreference.matches ? "auto" : "smooth",
    });
  }
  function scheduleAdvance() {
    stopAdvance();
    if (
      interacted ||
      hovered ||
      !railVisible ||
      !compactRail.matches ||
      !canUseFilmMotion() ||
      productRail.scrollWidth <= productRail.clientWidth + 2
    )
      return;
    const index = currentCard();
    const video = cards[index].querySelector("video");
    if (!video || video.paused || video.readyState < 2) return;
    const remaining =
      video && Number.isFinite(video.duration)
        ? (video.duration - video.currentTime) * 1000 + 400
        : 16000;
    advanceTimer = window.setTimeout(
      () => {
        advanceTimer = 0;
        if (index + direction >= cards.length || index + direction < 0)
          direction *= -1;
        moveTo(index + direction);
      },
      Math.max(8000, Math.min(24000, remaining)),
    );
  }
  function manualInteraction() {
    interacted = true;
    stopAdvance();
  }
  productRail.addEventListener("pointerdown", manualInteraction, {
    passive: true,
  });
  productRail.addEventListener("focusin", manualInteraction);
  productRail.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaX) > 0) manualInteraction();
    },
    { passive: true },
  );
  productRail.addEventListener("pointerenter", () => {
    hovered = true;
    stopAdvance();
  });
  productRail.addEventListener("pointerleave", () => {
    hovered = false;
    scheduleAdvance();
  });
  productRail.addEventListener("keydown", (event) => {
    if (event.target !== productRail) return;
    const index = currentCard();
    const target = {
      ArrowRight: Math.min(cards.length - 1, index + 1),
      ArrowLeft: Math.max(0, index - 1),
      Home: 0,
      End: cards.length - 1,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    manualInteraction();
    moveTo(target);
  });
  productRail.addEventListener(
    "scroll",
    () => {
      stopAdvance();
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(scheduleAdvance, 220);
    },
    { passive: true },
  );
  cards.forEach((card, index) => {
    const video = card.querySelector("video");
    ["pause", "waiting"].forEach((event) =>
      video?.addEventListener(event, () => {
        if (index === currentCard()) stopAdvance();
      }),
    );
    ["loadedmetadata", "playing"].forEach((event) =>
      video?.addEventListener(event, () => {
        if (
          index === currentCard() &&
          (event === "loadedmetadata" || !advanceTimer)
        )
          scheduleAdvance();
      }),
    );
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => {
        railVisible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
        scheduleAdvance();
      },
      { threshold: [0, 0.25] },
    ).observe(productRail);
  }
  compactRail.addEventListener("change", scheduleAdvance);
  motionPreference.addEventListener("change", scheduleAdvance);
  document.addEventListener("visibilitychange", scheduleAdvance);
  navigator.connection?.addEventListener?.("change", scheduleAdvance);
  window.addEventListener("resize", scheduleAdvance);
  scheduleAdvance();
}

if ("IntersectionObserver" in window) {
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
    ".recognition__copy, .recognition__logos",
  );
  revealNodes.forEach((node) => {
    if (!motionPreference.matches) node.classList.add("is-reveal-pending");
    revealObserver.observe(node);
  });
  motionPreference.addEventListener("change", () => {
    revealNodes.forEach((node) => node.classList.remove("is-reveal-pending"));
  });
}
