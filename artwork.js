(() => {
  const portrait = document.querySelector("[data-art-portrait]");
  const canvas = portrait?.querySelector("[data-art-canvas]");
  const context = canvas?.getContext("2d");
  if (!portrait || !canvas || !context) return;

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const source = new Image();
  const outgoing = document.createElement("canvas");
  const outgoingContext = outgoing.getContext("2d");
  const incoming = document.createElement("canvas");
  const incomingContext = incoming.getContext("2d");
  if (!outgoingContext || !incomingContext) return;

  const dissolveDuration = 1400;
  const colorways = [
    { x: 1, y: 0, paper: "#e7bbce" },
    { x: 2, y: 1, paper: "#bdd4de" },
    { x: 0, y: 0, paper: "#f0c5a7" },
    { x: 1, y: 1, paper: "#ccbfdd" },
  ];
  let width = 0;
  let height = 0;
  let frame = 0;
  let ready = false;
  let visible = !("IntersectionObserver" in window);
  let transitionAt = null;
  let colorwayIndex = 0;

  const clamp = (value) => Math.max(0, Math.min(1, value));
  const canAnimate = () =>
    visible &&
    !document.hidden &&
    !reducedMotion.matches &&
    !navigator.connection?.saveData;

  function readColorwayIndex() {
    const position = getComputedStyle(portrait).backgroundPosition.split(" ");
    const fraction = (value) => clamp(parseFloat(value) / 100 || 0);
    return Math.max(
      0,
      colorways.findIndex(
        (colorway) =>
          colorway.x === 2 * fraction(position[0]) &&
          colorway.y === fraction(position[1]),
      ),
    );
  }

  function preparePlate() {
    if (!ready || !width || !height) return;
    incomingContext.clearRect(0, 0, width, height);
    const cropWidth = source.naturalWidth / 3;
    const cropHeight = source.naturalHeight / 2;
    for (let quadrant = 0; quadrant < 4; quadrant++) {
      const colorway = colorways[(colorwayIndex + quadrant) % colorways.length];
      const x = (quadrant % 2) * (width / 2);
      const y = Math.floor(quadrant / 2) * (height / 2);
      incomingContext.fillStyle = colorway.paper;
      incomingContext.fillRect(x, y, width / 2, height / 2);
      incomingContext.drawImage(
        source,
        colorway.x * cropWidth,
        colorway.y * cropHeight,
        cropWidth,
        cropHeight,
        x,
        y,
        width / 2,
        height / 2,
      );
    }
  }

  function paint(time = performance.now()) {
    if (!ready || !width || !height) return false;
    context.clearRect(0, 0, width, height);
    const progress =
      transitionAt === null
        ? 1
        : clamp((time - transitionAt) / dissolveDuration);

    if (progress < 1) {
      // Keep the complete outgoing print opaque while the next colorway
      // dissolves over it. Nothing moves, fragments, or fades to white.
      context.drawImage(outgoing, 0, 0, width, height);
      if (progress > 0) {
        context.globalAlpha = progress * progress * (3 - 2 * progress);
        context.drawImage(incoming, 0, 0, width, height);
        context.globalAlpha = 1;
      }
      return true;
    }

    transitionAt = null;
    context.drawImage(incoming, 0, 0, width, height);
    return false;
  }

  function tick(time) {
    frame = 0;
    if (!canAnimate()) {
      settle();
      return;
    }
    if (paint(time)) frame = requestAnimationFrame(tick);
  }

  function wake() {
    if (!ready || !width || !height || !canAnimate() || frame) return;
    if (transitionAt !== null) {
      frame = requestAnimationFrame(tick);
    }
  }

  function settle() {
    cancelAnimationFrame(frame);
    frame = 0;
    transitionAt = null;
    paint();
  }

  function resize() {
    const style = getComputedStyle(portrait);
    width = parseFloat(style.width);
    height = parseFloat(style.height);
    if (!width || !height) return;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    incoming.width = canvas.width;
    incoming.height = canvas.height;
    context.setTransform(
      canvas.width / width,
      0,
      0,
      canvas.height / height,
      0,
      0,
    );
    incomingContext.setTransform(
      canvas.width / width,
      0,
      0,
      canvas.height / height,
      0,
      0,
    );
    if (ready) {
      preparePlate();
      paint();
      portrait.classList.add("has-canvas");
    }
    wake();
  }

  new MutationObserver(() => {
    if (!ready) return;
    const next = readColorwayIndex();
    if (next === colorwayIndex) return;
    if (!width || !height || !canAnimate()) {
      colorwayIndex = next;
      preparePlate();
      settle();
      return;
    }

    const time = performance.now();
    paint(time);
    outgoing.width = canvas.width;
    outgoing.height = canvas.height;
    outgoingContext.drawImage(canvas, 0, 0);
    colorwayIndex = next;
    preparePlate();
    transitionAt = time;
    wake();
  }).observe(portrait, { attributes: true, attributeFilter: ["style"] });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) wake();
        else settle();
      },
      { threshold: 0.05 },
    ).observe(portrait);
  }
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(portrait);
  else window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () =>
    document.hidden ? settle() : wake(),
  );
  reducedMotion.addEventListener("change", settle);
  navigator.connection?.addEventListener?.("change", settle);

  source.onload = () => {
    ready = true;
    colorwayIndex = readColorwayIndex();
    resize();
  };
  source.src = new URL(
    "./assets/slop-art-portraits.png",
    document.currentScript?.src || document.baseURI,
  ).href;
})();
