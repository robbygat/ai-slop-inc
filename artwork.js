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

  const dissolveDuration = 900;
  const paper = "#fafafa";
  const colorways = [
    { x: 1, y: 0 },
    { x: 2, y: 1 },
    { x: 0, y: 0 },
    { x: 1, y: 1 },
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

  function drawPortrait(target, index, x, y, size, offset = 0, alpha = 1) {
    const cropWidth = source.naturalWidth / 3;
    const cropHeight = source.naturalHeight / 2;
    const colorway = colorways[index];
    target.globalAlpha = alpha;
    target.drawImage(
      source,
      colorway.x * cropWidth,
      colorway.y * cropHeight,
      cropWidth,
      cropHeight,
      x + offset,
      y,
      size,
      size,
    );
    target.globalAlpha = 1;
  }

  function preparePlate() {
    if (!ready || !width || !height) return;
    incomingContext.clearRect(0, 0, width, height);
    incomingContext.fillStyle = paper;
    incomingContext.fillRect(0, 0, width, height);
    const size = Math.min(width, height) * 0.86;
    const x = (width - size) / 2;
    const y = (height - size) / 2;
    const quiet = reducedMotion.matches || navigator.connection?.saveData;
    const alternate = (colorwayIndex + 1) % colorways.length;

    // Registration is part of the still composition, not an idle animation.
    if (!quiet) {
      drawPortrait(incomingContext, alternate, x, y, size, -size * 0.008, 0.12);
    }
    drawPortrait(incomingContext, colorwayIndex, x, y, size);
    if (quiet) return;

    // Two restrained signal breaks leave the eyes and mouth readable.
    for (const [top, depth, offset] of [
      [0.27, 0.046, 0.018],
      [0.64, 0.025, -0.026],
    ]) {
      incomingContext.save();
      incomingContext.beginPath();
      incomingContext.rect(0, y + size * top, width, size * depth);
      incomingContext.clip();
      incomingContext.fillRect(0, 0, width, height);
      drawPortrait(incomingContext, colorwayIndex, x, y, size, size * offset);
      drawPortrait(
        incomingContext,
        alternate,
        x,
        y,
        size,
        size * (offset - 0.012),
        0.2,
      );
      incomingContext.restore();
    }
  }

  function drawPlate(plate) {
    // A viewport resize must never stretch the outgoing portrait.
    const scale = Math.min(width / plate.width, height / plate.height);
    const drawWidth = plate.width * scale;
    const drawHeight = plate.height * scale;
    context.drawImage(
      plate,
      (width - drawWidth) / 2,
      (height - drawHeight) / 2,
      drawWidth,
      drawHeight,
    );
  }

  function drawSignalPass(progress) {
    // Only two displacement beats, softened by opacity over the full dissolve.
    const beat =
      progress >= 0.12 && progress < 0.34
        ? { start: 0.12, end: 0.34, offset: 0.036 }
        : progress >= 0.48 && progress < 0.72
          ? { start: 0.48, end: 0.72, offset: -0.024 }
          : null;
    if (!beat) return;
    const opacity =
      Math.sin(((progress - beat.start) / (beat.end - beat.start)) * Math.PI) *
      0.76;
    const size = Math.min(width, height) * 0.86;
    const y = (height - size) / 2;
    for (const [top, depth, direction] of [
      [0.23, 0.065, 1],
      [0.49, 0.018, -1],
      [0.7, 0.045, 0.65],
    ]) {
      context.save();
      context.beginPath();
      context.rect(0, y + size * top, width, size * depth);
      context.clip();
      context.globalAlpha = opacity;
      context.drawImage(
        incoming,
        size * beat.offset * direction,
        0,
        width,
        height,
      );
      context.restore();
    }
  }

  function paint(time = performance.now()) {
    if (!ready || !width || !height) return false;
    context.clearRect(0, 0, width, height);
    context.fillStyle = paper;
    context.fillRect(0, 0, width, height);
    const progress =
      transitionAt === null
        ? 1
        : clamp((time - transitionAt) / dissolveDuration);

    if (progress < 1) {
      // An opaque, complete portrait remains underneath every transition frame.
      drawPlate(outgoing);
      if (progress > 0) {
        context.globalAlpha = progress * progress * (3 - 2 * progress);
        drawPlate(incoming);
        context.globalAlpha = 1;
        drawSignalPass(progress);
      }
      return true;
    }

    transitionAt = null;
    drawPlate(incoming);
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
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.15;
        if (visible) wake();
        else settle();
      },
      { threshold: 0.15 },
    ).observe(portrait);
  }
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(portrait);
  else window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () =>
    document.hidden ? settle() : wake(),
  );
  const refreshPreference = () => {
    preparePlate();
    settle();
  };
  reducedMotion.addEventListener("change", refreshPreference);
  navigator.connection?.addEventListener?.("change", refreshPreference);

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
