(() => {
  const portrait = document.querySelector("[data-art-portrait]");
  const canvas = portrait?.querySelector("[data-art-canvas]");
  const context = canvas?.getContext("2d");
  if (!portrait || !canvas || !context) return;

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const source = new Image();
  const columns = 18;
  const rows = 20;
  let width = 0;
  let height = 0;
  let frame = 0;
  let ready = false;
  let visible = !("IntersectionObserver" in window);
  let introPending = !reducedMotion.matches;
  let introAt = -Infinity;
  let pulseAt = -Infinity;
  let pointer = { x: 0, y: 0 };
  let crop = { x: 0, y: 0, width: 0, height: 0 };

  function updateCrop() {
    const position = getComputedStyle(portrait).backgroundPosition.split(" ");
    const fraction = (value) =>
      Math.max(0, Math.min(1, parseFloat(value) / 100 || 0));
    crop = {
      x: ((source.naturalWidth * 2) / 3) * fraction(position[0]),
      y: (source.naturalHeight / 2) * fraction(position[1]),
      width: source.naturalWidth / 3,
      height: source.naturalHeight / 2,
    };
  }

  function paint(time = Infinity) {
    if (!ready || !width || !height) return;
    context.clearRect(0, 0, width, height);
    const intro = Math.min(1, (time - introAt) / 1000);
    const pulse = (time - pulseAt) / 850;
    const moving = !reducedMotion.matches && (intro < 1 || pulse < 1);
    if (!moving) {
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
      return;
    }

    const diagonal = Math.hypot(width, height);
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const x = (column * width) / columns;
        const y = (row * height) / rows;
        const tileWidth = width / columns;
        const tileHeight = height / rows;
        const delay = 0.22 * (row / rows + column / columns);
        const progress = Math.max(
          0,
          Math.min(1, (intro - delay) / (1 - delay)),
        );
        const assembly = Math.pow(1 - progress, 3);
        const distanceX = x + tileWidth / 2 - pointer.x;
        const distanceY = y + tileHeight / 2 - pointer.y;
        const distance = Math.hypot(distanceX, distanceY);
        const ring = distance / diagonal - pulse * 1.15;
        const ripple =
          pulse >= 0 && pulse < 1
            ? Math.sin(ring * 24) *
              Math.exp(-ring * ring * 28) *
              (1 - pulse) *
              7
            : 0;
        const offsetX =
          assembly * Math.sin(column * 0.8) * 8 +
          (ripple * distanceX) / (distance || 1);
        const offsetY = assembly * 16 + (ripple * distanceY) / (distance || 1);
        context.drawImage(
          source,
          crop.x + (column * crop.width) / columns,
          crop.y + (row * crop.height) / rows,
          crop.width / columns,
          crop.height / rows,
          x + offsetX,
          y + offsetY,
          tileWidth,
          tileHeight,
        );
      }
    }
  }

  function tick(time) {
    frame = 0;
    if (!visible || document.hidden || reducedMotion.matches) return;
    paint(time);
    if (time - introAt < 1000 || time - pulseAt < 850) {
      frame = requestAnimationFrame(tick);
    }
  }

  function wake() {
    if (!ready || !visible || document.hidden || reducedMotion.matches) return;
    if (introPending) {
      introPending = false;
      introAt = performance.now();
    }
    if (!frame) frame = requestAnimationFrame(tick);
  }

  function settle() {
    cancelAnimationFrame(frame);
    frame = 0;
    introAt = pulseAt = -Infinity;
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
    paint();
    wake();
  }

  portrait.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch" || reducedMotion.matches) return;
      const bounds = portrait.getBoundingClientRect();
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
    updateCrop();
    settle();
    introPending = !reducedMotion.matches;
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
  reducedMotion.addEventListener("change", () => {
    introPending = false;
    settle();
  });

  source.onload = () => {
    ready = true;
    updateCrop();
    resize();
    if (width && height) portrait.classList.add("has-canvas");
    wake();
  };
  source.src = new URL(
    "./assets/slop-art-portraits.png",
    document.currentScript?.src || document.baseURI,
  ).href;
})();
