(() => {
  "use strict";

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Silent 4-card 3D orbital rotating hero deck (NO fullscreen modal, NO audio playback)
  const deck = document.querySelector("[data-hero-deck]");
  const cards = deck ? [...deck.querySelectorAll("[data-deck-card]")] : [];
  const pips = [...document.querySelectorAll("[data-deck-pick]")];

  if (deck && cards.length) {
    let activeIndex = 0;
    let cycleTimer = 0;
    const total = cards.length;
    const CYCLE_MS = 4400;

    function renderSlots() {
      cards.forEach((card, cardIndex) => {
        // Compute clean modular orbital slot:
        // 0 = Center Spotlight, 1 = Right Wing, 2 = Rear Horizon, 3 = Left Wing
        const slot = (cardIndex - activeIndex + total) % total;
        card.dataset.slot = String(slot);
        card.setAttribute("aria-current", slot === 0 ? "true" : "false");
      });

      pips.forEach((pip) => {
        const idx = Number(pip.dataset.deckPick);
        pip.setAttribute("aria-selected", String(idx === activeIndex));
      });
    }

    function stepTo(index) {
      activeIndex = ((index % total) + total) % total;
      renderSlots();
    }

    function restartAutoRotate() {
      window.clearInterval(cycleTimer);
      if (motionPreference.matches) return;
      cycleTimer = window.setInterval(() => {
        if (document.hidden) return;
        stepTo(activeIndex + 1);
      }, CYCLE_MS);
    }

    cards.forEach((card, idx) => {
      const handleSelect = () => {
        // Clicking any side card rotates it straight to center; clicking the centered card glides to the next game.
        if (idx === activeIndex) {
          stepTo(activeIndex + 1);
        } else {
          stepTo(idx);
        }
        restartAutoRotate();
      };

      card.addEventListener("click", handleSelect);
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleSelect();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          stepTo(activeIndex + 1);
          restartAutoRotate();
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          stepTo(activeIndex - 1);
          restartAutoRotate();
        }
      });
    });

    pips.forEach((pip) => {
      pip.addEventListener("click", () => {
        stepTo(Number(pip.dataset.deckPick));
        restartAutoRotate();
      });
    });

    // Mobile swipe support to smoothly rotate cards on phones
    let touchStartX = 0;
    let touchStartY = 0;
    deck.addEventListener(
      "touchstart",
      (event) => {
        const t = event.touches[0];
        if (!t) return;
        touchStartX = t.clientX;
        touchStartY = t.clientY;
      },
      { passive: true },
    );
    deck.addEventListener(
      "touchend",
      (event) => {
        const t = event.changedTouches[0];
        if (!t) return;
        const dx = t.clientX - touchStartX;
        const dy = t.clientY - touchStartY;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
          stepTo(dx < 0 ? activeIndex + 1 : activeIndex - 1);
          restartAutoRotate();
        }
      },
      { passive: true },
    );

    // Subtle desktop pointer parallax
    if (window.matchMedia("(pointer: fine)").matches && !motionPreference.matches) {
      const hero = deck.closest(".hero");
      hero?.addEventListener(
        "pointermove",
        (event) => {
          const rect = hero.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          const nx = (event.clientX - rect.left) / rect.width - 0.5;
          const ny = (event.clientY - rect.top) / rect.height - 0.5;
          deck.style.setProperty("--px", `${(nx * -18).toFixed(1)}px`);
          deck.style.setProperty("--py", `${(ny * -14).toFixed(1)}px`);
        },
        { passive: true },
      );
      hero?.addEventListener("pointerleave", () => {
        deck.style.setProperty("--px", "0px");
        deck.style.setProperty("--py", "0px");
      });
    }

    renderSlots();
    restartAutoRotate();
  }

  // Strictly silent, smooth playback across all hero video cards (pauses cleanly when tab hidden)
  const heroVideos = [...document.querySelectorAll(".hero-deck video")];
  function syncHeroVideos() {
    const ok = !document.hidden && !motionPreference.matches && !navigator.connection?.saveData;
    heroVideos.forEach((vid) => {
      vid.muted = true;
      if (ok) {
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  }
  document.addEventListener("visibilitychange", syncHeroVideos);
  motionPreference.addEventListener?.("change", syncHeroVideos);
  window.addEventListener("load", syncHeroVideos);
  syncHeroVideos();

  // Gentle scroll reveal for editorial sections
  if ("IntersectionObserver" in window && !motionPreference.matches) {
    const revealNodes = document.querySelectorAll("[data-reveal]");
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove("reveal-pending");
          entry.target.classList.add("reveal-done");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
    );
    revealNodes.forEach((node) => {
      node.classList.add("reveal-pending");
      revealObserver.observe(node);
    });
  }
})();
