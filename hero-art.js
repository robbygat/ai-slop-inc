(() => {
  "use strict";

  const root = document.querySelector("[data-ink-art]");
  const canvas = root?.querySelector("[data-ink-canvas]");
  const context = canvas?.getContext("2d");
  if (!root || !canvas || !context) return;

  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const network = navigator.connection;
  const source = new Image();
  const colors = [
    [24, 24, 24],
    [220, 45, 34],
  ];
  const plates = colors.map(() => document.createElement("canvas"));
  const plateContexts = plates.map((plate) => plate.getContext("2d"));
  if (plateContexts.some((plate) => !plate)) return;

  const HOLD_MS = 4800;
  const TRANSITION_MS = 1200;
  const MAX_PARTICLES = 1200;
  const groups = Array.from({ length: 6 }, () => []);
  let particles = [];
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let colorIndex = 0;
  let visible = !("IntersectionObserver" in window);
  let ready = false;
  let frame = 0;
  let timer = 0;
  let transitionStart = null;

  const clamp = (value) => Math.max(0, Math.min(1, value));
  const ease = (value) => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };
  // Each sample has a fixed trajectory. Resizing never generates new noise.
  const seeded = (index, salt) => {
    let value = Math.imul(index + 1, 374761393) ^ Math.imul(salt, 668265263);
    value = Math.imul(value ^ (value >>> 13), 1274126177);
    return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
  };
  const quiet = () => preference.matches || Boolean(network?.saveData);
  const canAnimate = () =>
    ready &&
    width > 0 &&
    height > 0 &&
    particles.length > 0 &&
    visible &&
    !document.hidden &&
    !quiet();

  function clear() {
    context.globalCompositeOperation = "source-over";
    context.globalAlpha = 1;
    context.clearRect(0, 0, width, height);
  }

  function drawStill() {
    if (!ready || !width || !height) return false;
    clear();
    context.drawImage(plates[colorIndex], 0, 0);
    return true;
  }

  function cancelMotion() {
    window.clearTimeout(timer);
    timer = 0;
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    transitionStart = null;
  }

  function rest() {
    cancelMotion();
    if (quiet()) colorIndex = 0;
    drawStill();
    if (!canAnimate()) return;
    timer = window.setTimeout(() => {
      timer = 0;
      if (!canAnimate()) return;
      transitionStart = null;
      frame = window.requestAnimationFrame(paintTransition);
    }, HOLD_MS);
  }

  function paintTransition(time) {
    frame = 0;
    if (!canAnimate()) {
      rest();
      return;
    }
    if (transitionStart === null) transitionStart = time;
    const progress = clamp((time - transitionStart) / TRANSITION_MS);
    const nextColor = (colorIndex + 1) % colors.length;
    if (progress >= 1) {
      colorIndex = nextColor;
      rest();
      return;
    }

    clear();
    const burst = Math.pow(Math.sin(progress * Math.PI), 1.35);
    const outgoingAlpha = 1 - ease((progress - 0.04) / 0.4);
    const incomingAlpha = ease((progress - 0.56) / 0.4);
    if (outgoingAlpha > 0) {
      context.globalAlpha = outgoingAlpha;
      context.drawImage(plates[colorIndex], 0, 0);
    }
    if (incomingAlpha > 0) {
      context.globalAlpha = incomingAlpha;
      context.drawImage(plates[nextColor], 0, 0);
    }

    const blend = ease(progress);
    const ink = colors[colorIndex].map((channel, index) =>
      Math.round(channel + (colors[nextColor][index] - channel) * blend),
    );
    context.fillStyle = `rgb(${ink.join(",")})`;
    // Six alpha buckets keep the entire splash to six fill operations per frame.
    groups.forEach((group, index) => {
      context.globalAlpha = ((index + 0.5) / groups.length) * burst;
      context.beginPath();
      group.forEach((particle) => {
        const bend = Math.sin(progress * Math.PI * 2 + particle.phase) * burst;
        const x = particle.x + particle.dx * burst + bend * width * 0.012;
        const y = particle.y + particle.dy * burst;
        const radius = particle.radius * (1 + burst * 0.2);
        context.moveTo(x + radius, y);
        context.arc(x, y, radius, 0, Math.PI * 2);
      });
      context.fill();
    });
    context.globalAlpha = 1;
    frame = window.requestAnimationFrame(paintTransition);
  }

  function sampleSource() {
    const sample = document.createElement("canvas");
    sample.width = 128;
    sample.height = Math.round(
      (128 * source.naturalHeight) / source.naturalWidth,
    );
    const sampleContext = sample.getContext("2d", { willReadFrequently: true });
    if (!sampleContext) return;
    sampleContext.drawImage(source, 0, 0, sample.width, sample.height);
    let pixels;
    try {
      pixels = sampleContext.getImageData(
        0,
        0,
        sample.width,
        sample.height,
      ).data;
    } catch {
      // File-origin restrictions may prevent sampling. The crisp still still works.
      return;
    }
    const candidates = [];
    for (let y = 1; y < sample.height; y += 2) {
      for (let x = 1; x < sample.width; x += 2) {
        const alpha = pixels[(y * sample.width + x) * 4 + 3] / 255;
        if (alpha > 0.08)
          candidates.push({ u: x / sample.width, v: y / sample.height, alpha });
      }
    }
    const count = Math.min(MAX_PARTICLES, candidates.length);
    particles = Array.from({ length: count }, (_, index) => {
      const point = candidates[Math.floor((index * candidates.length) / count)];
      const particle = {
        ...point,
        spreadX: seeded(index, 1) - 0.5,
        spreadY: seeded(index, 2) - 0.5,
        phase: seeded(index, 3) * Math.PI * 2,
        size: 0.8 + seeded(index, 4) * 0.6,
      };
      groups[
        Math.min(groups.length - 1, Math.floor(point.alpha * groups.length))
      ].push(particle);
      return particle;
    });
  }

  function resize() {
    const bounds = root.getBoundingClientRect();
    const nextRatio = Math.min(window.devicePixelRatio || 1, 2);
    const nextWidth = Math.round(bounds.width * nextRatio);
    const nextHeight = Math.round(bounds.height * nextRatio);
    if (!nextWidth || !nextHeight) {
      cancelMotion();
      return;
    }
    if (
      width === nextWidth &&
      height === nextHeight &&
      pixelRatio === nextRatio
    )
      return;
    cancelMotion();
    width = nextWidth;
    height = nextHeight;
    pixelRatio = nextRatio;
    canvas.width = width;
    canvas.height = height;
    if (!ready) return;

    const sourceRatio = source.naturalWidth / source.naturalHeight;
    const drawWidth = Math.min(width * 0.88, height * 0.88 * sourceRatio);
    const drawHeight = drawWidth / sourceRatio;
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;
    plates.forEach((plate, index) => {
      plate.width = width;
      plate.height = height;
      const plateContext = plateContexts[index];
      plateContext.globalCompositeOperation = "source-over";
      plateContext.clearRect(0, 0, width, height);
      plateContext.drawImage(source, x, y, drawWidth, drawHeight);
      plateContext.globalCompositeOperation = "source-in";
      plateContext.fillStyle = `rgb(${colors[index].join(",")})`;
      plateContext.fillRect(0, 0, width, height);
      plateContext.globalCompositeOperation = "source-over";
    });
    const baseRadius = Math.max(
      pixelRatio * 0.9,
      Math.min(pixelRatio * 2.4, width / 240),
    );
    particles.forEach((particle) => {
      particle.x = x + particle.u * drawWidth;
      particle.y = y + particle.v * drawHeight;
      particle.dx =
        (particle.u - 0.5) * drawWidth * 0.22 +
        particle.spreadX * drawWidth * 0.11;
      particle.dy =
        (particle.v - 0.53) * drawHeight * 0.18 +
        particle.spreadY * drawHeight * 0.13;
      particle.radius = baseRadius * particle.size;
    });
    if (quiet()) colorIndex = 0;
    if (drawStill()) root.classList.add("has-ink-canvas");
    rest();
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.1;
        rest();
      },
      { threshold: [0, 0.1] },
    ).observe(root);
  }
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(root);
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", rest);
  preference.addEventListener?.("change", rest);
  network?.addEventListener?.("change", rest);

  source.onload = () => {
    if (!source.naturalWidth || !source.naturalHeight) return;
    ready = true;
    sampleSource();
    // A pre-load resize may already have measured the same bounds.
    width = 0;
    height = 0;
    resize();
  };
  source.onerror = () => {
    ready = false;
    cancelMotion();
    root.classList.remove("has-ink-canvas");
  };
  source.src = new URL(
    root.dataset.inkSource || "./assets/hero-slop-portrait.png",
    document.baseURI,
  ).href;
})();
