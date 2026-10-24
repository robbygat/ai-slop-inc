(() => {
  const portrait = document.querySelector("[data-art-portrait]");
  const canvas = portrait?.querySelector("[data-art-canvas]");
  const context = canvas?.getContext("2d");
  if (!portrait || !canvas || !context) return;

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const source = new Image();
  const outgoing = document.createElement("canvas");
  const outgoingContext = outgoing.getContext("2d");
  if (!outgoingContext) return;

  const columns = 18;
  const rows = 20;
  const printDuration = 1150;
  const pulseDuration = 750;
  let width = 0;
  let height = 0;
  let frame = 0;
  let ready = false;
  let visible = !("IntersectionObserver" in window);
  let transitionAt = null;
  let pulseAt = -Infinity;
  let pointer = { x: 0, y: 0 };
  let crop = { x: 0, y: 0, width: 0, height: 0 };

  const clamp = (value) => Math.max(0, Math.min(1, value));
  const canAnimate = () =>
    visible && !document.hidden && !reducedMotion.matches;

  function readCrop() {
    const position = getComputedStyle(portrait).backgroundPosition.split(" ");
    const fraction = (value) => clamp(parseFloat(value) / 100 || 0);
    return {
      x: ((source.naturalWidth * 2) / 3) * fraction(position[0]),
      y: (source.naturalHeight / 2) * fraction(position[1]),
      width: source.naturalWidth / 3,
      height: source.naturalHeight / 2,
    };
  }

  function drawPortrait() {
    context.drawImage(
      source,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      width,
      height,
    );
  }

  function drawTile(column, row, offsetX = 0, offsetY = 0) {
    context.drawImage(
      source,
      crop.x + (column * crop.width) / columns,
      crop.y + (row * crop.height) / rows,
      crop.width / columns,
      crop.height / rows,
      (column * width) / columns + offsetX,
      (row * height) / rows + offsetY,
      width / columns,
      height / rows,
    );
  }

  function paint(time = performance.now()) {
    if (!ready || !width || !height) return false;
    context.clearRect(0, 0, width, height);
    const progress =
      transitionAt === null ? 1 : clamp((time - transitionAt) / printDuration);

    if (progress < 1) {
      // The complete outgoing print stays underneath every incoming ink cell.
      // This also preserves an interrupted transition without reading pixels.
      context.drawImage(outgoing, 0, 0, width, height);
      const tileWidth = width / columns;
      const tileHeight = height / rows;
      const radius = Math.hypot(tileWidth, tileHeight) / 2;
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const delay =
            ((0.6 * column) / (columns - 1) + (0.4 * row) / (rows - 1)) * 0.48;
          const cell = clamp((progress - delay) / 0.52);
          if (!cell) continue;
          if (cell === 1) {
            drawTile(column, row);
            continue;
          }
          const ink = cell * cell * (3 - 2 * cell);
          const x = column * tileWidth;
          const y = row * tileHeight;
          context.save();
          context.beginPath();
          context.rect(x, y, tileWidth, tileHeight);
          context.clip();
          context.beginPath();
          context.arc(
            x + tileWidth / 2,
            y + tileHeight / 2,
            radius * ink,
            0,
            Math.PI * 2,
          );
          context.clip();
          drawTile(column, row);
          context.restore();
        }
      }
      return true;
    }

    transitionAt = null;
    drawPortrait();
    const pulse = (time - pulseAt) / pulseDuration;
    if (!canAnimate() || pulse < 0 || pulse >= 1) return false;
    const diagonal = Math.hypot(width, height);
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const dx = ((column + 0.5) * width) / columns - pointer.x;
        const dy = ((row + 0.5) * height) / rows - pointer.y;
        const distance = Math.hypot(dx, dy);
        const ring = distance / diagonal - pulse * 1.15;
        const ripple =
          Math.sin(ring * 24) * Math.exp(-ring * ring * 28) * (1 - pulse) * 3;
        drawTile(
          column,
          row,
          (ripple * dx) / (distance || 1),
          (ripple * dy) / (distance || 1),
        );
      }
    }
    return true;
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
    if (transitionAt !== null || performance.now() - pulseAt < pulseDuration) {
      frame = requestAnimationFrame(tick);
    }
  }

  function settle() {
    cancelAnimationFrame(frame);
    frame = 0;
    transitionAt = null;
    pulseAt = -Infinity;
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
    context.setTransform(
      canvas.width / width,
      0,
      0,
      canvas.height / height,
      0,
      0,
    );
    if (ready) {
      paint();
      portrait.classList.add("has-canvas");
    }
    wake();
  }

  portrait.addEventListener(
    "pointermove",
    (event) => {
      if (
        !ready ||
        !width ||
        !height ||
        !canAnimate() ||
        event.pointerType === "touch" ||
        transitionAt !== null
      )
        return;
      const bounds = portrait.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      pointer = {
        x: ((event.clientX - bounds.left) * width) / bounds.width,
        y: ((event.clientY - bounds.top) * height) / bounds.height,
      };
      pulseAt = performance.now();
      wake();
    },
    { passive: true },
  );

  new MutationObserver(() => {
    if (!ready) return;
    const next = readCrop();
    if (next.x === crop.x && next.y === crop.y) return;
    if (!width || !height || !canAnimate()) {
      crop = next;
      settle();
      return;
    }

    const time = performance.now();
    paint(time);
    outgoing.width = canvas.width;
    outgoing.height = canvas.height;
    outgoingContext.drawImage(canvas, 0, 0);
    crop = next;
    pulseAt = -Infinity;
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

  source.onload = () => {
    ready = true;
    crop = readCrop();
    resize();
  };
  source.src = new URL(
    "./assets/slop-art-portraits.png",
    document.currentScript?.src || document.baseURI,
  ).href;
})();
