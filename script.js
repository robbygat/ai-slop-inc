document.querySelector("[data-year]").textContent = new Date().getFullYear();

const typePalettes = {
  brand: {
    core: ["sans", "display", "mono", "serif", "grotesk", "syne"],
    accents: ["poster", "graphic", "bodoni", "wide", "condensed", "pixel"],
    accentCount: 3,
  },
  statement: {
    core: ["sans", "display", "mono", "serif", "grotesk", "syne"],
    accents: ["poster", "graphic", "bodoni", "wide", "condensed", "pixel"],
    accentCount: 4,
  },
  title: {
    core: ["sans", "display", "mono", "serif", "grotesk", "syne"],
    accents: ["poster", "graphic", "bodoni", "wide", "condensed", "pixel"],
    accentCount: 6,
  },
};

const getStructuredText = (element) =>
  [...element.childNodes]
    .map((node) => (node.nodeName === "BR" ? "\n" : node.textContent.replace(/\s+/g, " ")))
    .join("")
    .replace(/ *\n */g, "\n")
    .trim();

const getTextSeed = (text) =>
  Array.from(text).reduce((hash, character) => (hash * 31 + character.codePointAt(0)) >>> 0, 0);

const pageTypeSeed = (() => {
  if (window.crypto?.getRandomValues) {
    return window.crypto.getRandomValues(new Uint32Array(1))[0];
  }

  return Date.now() >>> 0;
})();

const createRandom = (seed) => {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffleTypeFaces = (faces, random) => {
  const shuffled = [...faces];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
};

const createFaceDeck = (role, text, elementIndex) => {
  const palette = typePalettes[role] || typePalettes.title;
  const random = createRandom(pageTypeSeed ^ getTextSeed(text) ^ Math.imul(elementIndex + 1, 0x9e3779b1));
  const accents = shuffleTypeFaces(palette.accents, random).slice(0, palette.accentCount);
  const faces = [...palette.core, ...accents];
  let deck = [];
  let previousFace = "";

  return () => {
    if (!deck.length) {
      deck = shuffleTypeFaces(faces, random);

      if (deck[0] === previousFace && deck.length > 1) {
        [deck[0], deck[1]] = [deck[1], deck[0]];
      }
    }

    const face = deck.shift();
    previousFace = face;
    return face;
  };
};

const typesetMixedText = (element, role, elementIndex) => {
  const structuredText = getStructuredText(element);
  if (!structuredText) return;

  const spokenText = structuredText.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
  const nextFace = createFaceDeck(role, spokenText, elementIndex);
  const screenReaderText = document.createElement("span");
  const visualText = document.createElement("span");
  let wordIndex = 0;

  screenReaderText.className = "sr-only";
  screenReaderText.textContent = spokenText;
  visualText.className = "mixed-type__visual";
  visualText.setAttribute("aria-hidden", "true");

  structuredText.split("\n").forEach((line, lineIndex, lines) => {
    line.split(" ").filter(Boolean).forEach((word, index, words) => {
      const wordElement = document.createElement("span");
      const face = nextFace();

      wordElement.className = `mixed-type__word type-face--${face}`;
      wordElement.style.setProperty("--word-index", String(wordIndex));
      wordElement.textContent = word;

      visualText.append(wordElement);
      wordIndex += 1;

      if (index < words.length - 1) {
        visualText.append(document.createTextNode(element.hasAttribute("data-tight-words") ? "" : " "));
      }
    });

    if (lineIndex < lines.length - 1) {
      visualText.append(document.createElement("br"));
    }
  });

  element.replaceChildren(screenReaderText, visualText);
  element.classList.add("is-typeset");
};

document.querySelectorAll("[data-mixed-type], [data-word-cycle]").forEach((element, elementIndex) => {
  const role = element.matches("[data-word-cycle]") ? "statement" : element.dataset.mixedType;
  typesetMixedText(element, role, elementIndex);
});

const asciiStage = document.querySelector(".ascii-lockup");

if (asciiStage) {
  const bounceStage = asciiStage.closest(".ascii-bounce-stage");
  const heroArt = document.querySelector(".hero-corner-art");
  const logoCanvas = asciiStage.querySelector("[data-dot-logo]");
  const logoContext = logoCanvas?.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let dotLogo = null;
  let isVisible = false;
  let bounceFrame = 0;
  let positionX = 0;
  let positionY = 0;
  let anchorX = 0;
  let anchorY = 0;
  let driftX = 0;
  let driftY = 0;
  let logoColorFrom = [0, 0, 0];
  let logoColorTo = [0, 0, 0];
  let logoColorChangedAt = performance.now();
  const logoColorTransitionDuration = 360;

  const parseHexColor = (hex) => {
    const value = hex.replace("#", "");
    return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
  };

  const easeLogoColor = (progress) => {
    let lower = 0;
    let upper = 1;
    let parameter = progress;

    for (let iteration = 0; iteration < 12; iteration += 1) {
      const inverse = 1 - parameter;
      const x =
        3 * inverse * inverse * parameter * 0.37 +
        3 * inverse * parameter * parameter * 0.63 +
        parameter * parameter * parameter;

      if (x < progress) lower = parameter;
      else upper = parameter;

      parameter = (lower + upper) * 0.5;
    }

    const inverse = 1 - parameter;
    return 3 * inverse * parameter * parameter + parameter * parameter * parameter;
  };

  const getLogoColor = (time) => {
    if (reduceMotion.matches) return logoColorTo;

    const progress = Math.min(1, Math.max(0, (time - logoColorChangedAt) / logoColorTransitionDuration));
    const easedProgress = easeLogoColor(progress);

    return logoColorFrom.map((channel, index) =>
      Math.round(channel + (logoColorTo[index] - channel) * easedProgress),
    );
  };

  const paintDotField = (time) => {
    if (!logoCanvas || !logoContext || !dotLogo || !logoCanvas.clientWidth || !logoCanvas.clientHeight) return;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.max(1, Math.round(logoCanvas.clientWidth * pixelRatio));
    const pixelHeight = Math.max(1, Math.round(logoCanvas.clientHeight * pixelRatio));

    if (logoCanvas.width !== pixelWidth || logoCanvas.height !== pixelHeight) {
      logoCanvas.width = pixelWidth;
      logoCanvas.height = pixelHeight;
    }

    logoContext.setTransform(1, 0, 0, 1, 0, 0);
    logoContext.clearRect(0, 0, logoCanvas.width, logoCanvas.height);
    logoContext.setTransform(
      logoCanvas.width / dotLogo.width,
      0,
      0,
      logoCanvas.height / dotLogo.height,
      0,
      0,
    );

    const seconds = time / 1000;
    const ambientX = reduceMotion.matches
      ? dotLogo.width * 0.5
      : dotLogo.width * (0.5 + Math.sin((seconds * Math.PI * 2) / 7.8) * 0.36);
    const ambientY = reduceMotion.matches
      ? dotLogo.height * 0.5
      : dotLogo.height * (0.5 + Math.sin((seconds * Math.PI * 2) / 10.4 + 1.1) * 0.34);
    const breath = reduceMotion.matches ? 0.5 : 0.5 + Math.sin((seconds * Math.PI * 2) / 6.4) * 0.5;
    const bloomRadius = Math.min(dotLogo.width, dotLogo.height) * 0.24;
    const baseRadius = dotLogo.radius * 0.72;

    const [red, green, blue] = getLogoColor(time);
    logoContext.fillStyle = `rgb(${red} ${green} ${blue})`;
    logoContext.beginPath();

    dotLogo.points.forEach(([x, y]) => {
      const distance = Math.hypot(x - ambientX, y - ambientY);
      const bloom = Math.exp(-(distance * distance) / (2 * bloomRadius * bloomRadius));
      const ripple = reduceMotion.matches ? 0.5 : 0.5 + Math.sin(seconds * 2.3 - distance * 0.032) * 0.5;
      const radius =
        baseRadius +
        dotLogo.radius * (0.02 * breath + 0.42 * bloom + 0.015 * bloom * ripple);

      logoContext.moveTo(x + radius, y);
      logoContext.arc(x, y, radius, 0, Math.PI * 2);
    });

    logoContext.fill();
  };

  const paintBouncePosition = () => {
    asciiStage.style.transform = `translate3d(${positionX.toFixed(2)}px, ${positionY.toFixed(2)}px, 0)`;
  };

  const measureBounce = () => {
    if (!bounceStage) return;

    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    const logoRatio = (dotLogo?.width || logoCanvas?.width || 970) / (dotLogo?.height || logoCanvas?.height || 865);
    const preferredWidth = isMobile
      ? Math.min(window.innerWidth * 0.616, 258)
      : Math.min(Math.max(window.innerWidth * 0.36, 320), 500, window.innerWidth - 48);
    const stageRect = bounceStage.getBoundingClientRect();
    const artRect = heroArt?.getBoundingClientRect();
    const desiredAnchorX = isMobile
      ? Math.max(0, bounceStage.clientWidth - preferredWidth - 12)
      : Math.max(24, bounceStage.clientWidth * 0.045);
    let collisionSafeWidth = Number.POSITIVE_INFINITY;

    if (artRect?.width) {
      if (isMobile) {
        const artTop = artRect.top - stageRect.top;
        if (artTop > 40) collisionSafeWidth = Math.max(1, (artTop - 20) * logoRatio);
      } else {
        const artLeft = artRect.left - stageRect.left;
        collisionSafeWidth = Math.max(1, artLeft - desiredAnchorX - 18 - 28);
      }
    }

    const fittedWidth = Math.max(
      1,
      Math.min(
        preferredWidth,
        collisionSafeWidth,
        bounceStage.clientWidth - 8,
        Math.max(1, bounceStage.clientHeight - 24) * logoRatio,
      ),
    );

    if (Math.abs(asciiStage.offsetWidth - fittedWidth) > 0.5) {
      asciiStage.style.width = `${fittedWidth.toFixed(2)}px`;
    }

    const availableX = Math.max(0, bounceStage.clientWidth - asciiStage.offsetWidth);
    const availableY = Math.max(0, bounceStage.clientHeight - asciiStage.offsetHeight);

    if (isMobile) {
      anchorX = availableX * 0.5;
      anchorY = Math.min(availableY, Math.max(8, bounceStage.clientHeight * 0.025));
      driftX = Math.min(4, availableX * 0.025);
      driftY = Math.min(3, anchorY, Math.max(0, availableY - anchorY));
    } else {
      anchorX = Math.min(availableX, Math.max(24, bounceStage.clientWidth * 0.045));
      anchorY = Math.min(availableY, Math.max(20, availableY * 0.42));
      driftX = Math.min(18, Math.max(0, availableX - anchorX), anchorX);
      driftY = Math.min(12, Math.max(0, availableY - anchorY), anchorY);
    }

    positionX = anchorX;
    positionY = anchorY;

    paintBouncePosition();
    paintDotField(performance.now());
  };

  const moveBounce = (time) => {
    if (!bounceFrame) return;

    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    const period = isMobile ? 26000 : 19000;
    const phase = (time / period) * Math.PI * 2;
    positionX = anchorX + Math.sin(phase) * driftX;
    positionY = anchorY + Math.sin(phase * 0.73 + 0.8) * driftY;

    paintDotField(time);
    paintBouncePosition();
    bounceFrame = requestAnimationFrame(moveBounce);
  };

  const syncBounce = () => {
    if (bounceFrame) cancelAnimationFrame(bounceFrame);
    bounceFrame = 0;
    measureBounce();
    paintDotField(performance.now());

    if (reduceMotion.matches || !isVisible || document.hidden) return;

    bounceFrame = requestAnimationFrame(moveBounce);
  };

  const syncAnimation = () => {
    syncBounce();
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      isVisible = entry.isIntersecting;
      syncAnimation();
    },
    { rootMargin: "120px" },
  );

  observer.observe(bounceStage || asciiStage);
  const bounceResizeObserver = bounceStage ? new ResizeObserver(measureBounce) : null;
  if (bounceStage) {
    bounceResizeObserver.observe(bounceStage);
    bounceResizeObserver.observe(asciiStage);
  }
  document.fonts?.ready.then(measureBounce);
  document.addEventListener("visibilitychange", syncAnimation);
  reduceMotion.addEventListener?.("change", syncAnimation);
  heroArt?.addEventListener("warholframechange", ({ detail }) => {
    if (!detail?.color) return;

    const now = performance.now();
    logoColorFrom = getLogoColor(now);
    logoColorTo = parseHexColor(detail.color);
    logoColorChangedAt = now;
    paintDotField(now);
  });

  const setDotLogo = (data) => {
    dotLogo = data;
    asciiStage.classList.add("is-logo-ready");
    syncAnimation();
  };

  if (window.AISlopHeroDots) {
    setDotLogo(window.AISlopHeroDots);
  } else if (logoCanvas?.dataset.dotSource) {
    fetch(logoCanvas.dataset.dotSource)
      .then((response) => {
        if (!response.ok) throw new Error(`Dot logo failed to load (${response.status})`);
        return response.json();
      })
      .then(setDotLogo)
      .catch((error) => {
        console.error(error);
        asciiStage.classList.add("is-logo-error");
      });
  }
}

const teamSection = document.querySelector(".team");
const teamDotCanvas = teamSection?.querySelector("[data-team-dots]");

if (teamSection && teamDotCanvas) {
  const context = teamDotCanvas.getContext("2d");
  const reduceTeamMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let isTeamVisible = false;
  let teamDotFrame = 0;
  let lastTeamDotPaint = 0;
  let teamColorIndex = 0;
  let teamColorTimer = 0;
  const teamColors = ["#2d3e7c", "#f196a8", "#1e9f2c", "#f6bc20", "#ef0976", "#f3e107"];

  const showNextTeamColor = () => {
    teamColorIndex = (teamColorIndex + 1) % teamColors.length;
    teamSection.style.setProperty("--team-art-color", teamColors[teamColorIndex]);
  };

  const syncTeamColors = () => {
    window.clearInterval(teamColorTimer);
    teamColorTimer = 0;

    if (!reduceTeamMotion.matches && isTeamVisible && !document.hidden) {
      teamColorTimer = window.setInterval(showNextTeamColor, 1000);
    }
  };

  const paintTeamDots = (time) => {
    const width = teamDotCanvas.clientWidth;
    const height = teamDotCanvas.clientHeight;
    if (!context || !width || !height) return;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.max(1, Math.round(width * pixelRatio));
    const pixelHeight = Math.max(1, Math.round(height * pixelRatio));

    if (teamDotCanvas.width !== pixelWidth || teamDotCanvas.height !== pixelHeight) {
      teamDotCanvas.width = pixelWidth;
      teamDotCanvas.height = pixelHeight;
    }

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, pixelWidth, pixelHeight);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const seconds = time / 1000;
    const reduced = reduceTeamMotion.matches;
    const ambientX = reduced
      ? width * 0.68
      : width * (0.5 + Math.sin((seconds * Math.PI * 2) / 11.8) * 0.43);
    const ambientY = reduced
      ? height * 0.34
      : height * (0.5 + Math.sin((seconds * Math.PI * 2) / 15.7 + 1.15) * 0.39);
    const breath = reduced ? 0.5 : 0.5 + Math.sin((seconds * Math.PI * 2) / 7.2) * 0.5;
    const spacing = width <= 760 ? 17 : 20;
    const bloomRadius = Math.max(170, Math.min(width, height) * 0.31);

    context.fillStyle = "rgba(23, 23, 20, 0.22)";
    context.beginPath();

    for (let y = spacing * 0.5; y < height; y += spacing) {
      for (let x = spacing * 0.5; x < width; x += spacing) {
        const distance = Math.hypot(x - ambientX, y - ambientY);
        const bloom = Math.exp(-(distance * distance) / (2 * bloomRadius * bloomRadius));
        const ripple = reduced ? 0.5 : 0.5 + Math.sin(seconds * 2.05 - distance * 0.035) * 0.5;
        const radius = 0.72 + 0.08 * breath + 1.55 * bloom + 0.16 * bloom * ripple;
        context.moveTo(x + radius, y);
        context.arc(x, y, radius, 0, Math.PI * 2);
      }
    }

    context.fill();
  };

  const animateTeamDots = (time) => {
    if (!teamDotFrame) return;

    if (time - lastTeamDotPaint >= 33) {
      paintTeamDots(time);
      lastTeamDotPaint = time;
    }

    teamDotFrame = requestAnimationFrame(animateTeamDots);
  };

  const syncTeamDots = () => {
    if (teamDotFrame) cancelAnimationFrame(teamDotFrame);
    teamDotFrame = 0;
    lastTeamDotPaint = 0;
    paintTeamDots(performance.now());

    if (reduceTeamMotion.matches || !isTeamVisible || document.hidden) return;
    teamDotFrame = requestAnimationFrame(animateTeamDots);
  };

  new ResizeObserver(() => paintTeamDots(performance.now())).observe(teamSection);
  new IntersectionObserver(
    ([entry]) => {
      isTeamVisible = entry.isIntersecting;
      syncTeamDots();
      syncTeamColors();
    },
    { rootMargin: "150px" },
  ).observe(teamSection);
  document.addEventListener("visibilitychange", () => {
    syncTeamDots();
    syncTeamColors();
  });
  reduceTeamMotion.addEventListener?.("change", () => {
    syncTeamDots();
    syncTeamColors();
  });
  teamSection.style.setProperty("--team-art-color", teamColors[0]);
  syncTeamDots();
  syncTeamColors();
}

const heroWarholSprite = document.querySelector("[data-hero-warhol-sprite]");

if (heroWarholSprite) {
  const frames = [
    { source: "photo", color: "#000000" },
    { source: [0, 0], color: "#d1060b" },
    { source: [1, 0], color: "#000000" },
    { source: [2, 0], color: "#2b850e" },
    { source: [0, 1], color: "#e57623" },
    { source: [1, 1], color: "#f51e76" },
    { source: [2, 1], color: "#3e509a" },
  ];
  const layers = [...heroWarholSprite.querySelectorAll(".hero-corner-art__frame")];
  const reduceWarholMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frameIndex = 0;
  let activeLayer = 0;
  let warholTimer = 0;
  let warholVisible = false;

  const paintWarholFrame = (layer, index) => {
    const frame = frames[index];
    const isPhoto = frame.source === "photo";
    layer.classList.toggle("is-photo", isPhoto);

    if (isPhoto) {
      layer.style.removeProperty("--hero-sprite-x");
      layer.style.removeProperty("--hero-sprite-y");
      return;
    }

    const [column, row] = frame.source;
    layer.style.setProperty("--hero-sprite-x", `${column * 50}%`);
    layer.style.setProperty("--hero-sprite-y", `${row * 100}%`);
  };

  const showNextWarholFrame = () => {
    const nextLayer = activeLayer === 0 ? 1 : 0;
    frameIndex = (frameIndex + 1) % frames.length;
    paintWarholFrame(layers[nextLayer], frameIndex);
    layers[nextLayer].classList.add("is-active");
    layers[activeLayer].classList.remove("is-active");
    activeLayer = nextLayer;
    heroWarholSprite.dispatchEvent(
      new CustomEvent("warholframechange", {
        detail: { index: frameIndex, color: frames[frameIndex].color },
      }),
    );
  };

  const syncWarholLoop = () => {
    window.clearInterval(warholTimer);
    warholTimer = 0;

    if (!reduceWarholMotion.matches && warholVisible && !document.hidden) {
      warholTimer = window.setInterval(showNextWarholFrame, 500);
    }
  };

  paintWarholFrame(layers[0], 0);
  paintWarholFrame(layers[1], 1);
  heroWarholSprite.dispatchEvent(
    new CustomEvent("warholframechange", { detail: { index: 0, color: frames[0].color } }),
  );

  new IntersectionObserver(
    ([entry]) => {
      warholVisible = entry.isIntersecting;
      syncWarholLoop();
    },
    { rootMargin: "120px" },
  ).observe(heroWarholSprite);
  document.addEventListener("visibilitychange", syncWarholLoop);
  reduceWarholMotion.addEventListener?.("change", syncWarholLoop);
}

const wordCycle = document.querySelector("[data-word-cycle]");

if (wordCycle) {
  const words = [...wordCycle.querySelectorAll(".mixed-type__word")];
  const reduceWordMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeWord = 0;
  let cycleTimer = 0;
  let wordsVisible = false;
  let pointerIsChoosing = false;

  const activateWord = (index) => {
    words.forEach((word, wordIndex) => {
      word.classList.toggle("is-active", wordIndex === index);
    });
    activeWord = index;
  };

  const stopWordCycle = () => {
    if (cycleTimer) window.clearInterval(cycleTimer);
    cycleTimer = 0;
  };

  const syncWordCycle = () => {
    stopWordCycle();
    if (!wordsVisible || document.hidden || reduceWordMotion.matches || pointerIsChoosing) return;

    if (heroWarholSprite) return;

    cycleTimer = window.setInterval(() => {
      activateWord((activeWord + 1) % words.length);
    }, 500);
  };

  const advanceWithWarhol = () => {
    if (!wordsVisible || document.hidden || reduceWordMotion.matches || pointerIsChoosing) return;
    activateWord((activeWord + 1) % words.length);
  };

  words.forEach((word, index) => {
    word.addEventListener("pointerenter", () => {
      pointerIsChoosing = true;
      stopWordCycle();
      activateWord(index);
    });
  });

  wordCycle.addEventListener("pointerleave", () => {
    pointerIsChoosing = false;
    syncWordCycle();
  });

  const wordObserver = new IntersectionObserver(
    ([entry]) => {
      wordsVisible = entry.isIntersecting;
      syncWordCycle();
    },
    { rootMargin: "80px" },
  );

  activateWord(0);
  heroWarholSprite?.addEventListener("warholframechange", advanceWithWarhol);
  wordObserver.observe(wordCycle);
  document.addEventListener("visibilitychange", syncWordCycle);
  reduceWordMotion.addEventListener?.("change", syncWordCycle);
}

const manifestoSprite = document.querySelector("[data-manifesto-sprite]");

if (manifestoSprite) {
  const spriteFrames = [
    [0, 0],
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ];
  const spriteLayers = [...manifestoSprite.querySelectorAll(".manifesto-art__frame")];
  const reduceSpriteMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let spriteIndex = 0;
  let activeSpriteLayer = 0;
  let spriteTimer = 0;
  let spriteVisible = false;

  const paintSpriteFrame = (layer, frameIndex) => {
    const [column, row] = spriteFrames[frameIndex];
    layer.style.setProperty("--sprite-x", `${column * 50}%`);
    layer.style.setProperty("--sprite-y", `${row * 100}%`);
  };

  const showNextSpriteFrame = () => {
    const nextLayer = activeSpriteLayer === 0 ? 1 : 0;
    spriteIndex = (spriteIndex + 1) % spriteFrames.length;
    paintSpriteFrame(spriteLayers[nextLayer], spriteIndex);
    spriteLayers[nextLayer].classList.add("is-active");
    spriteLayers[activeSpriteLayer].classList.remove("is-active");
    activeSpriteLayer = nextLayer;
  };

  const syncSpriteLoop = () => {
    window.clearInterval(spriteTimer);
    spriteTimer = 0;

    if (!reduceSpriteMotion.matches && spriteVisible && !document.hidden) {
      spriteTimer = window.setInterval(showNextSpriteFrame, 1000);
    }
  };

  paintSpriteFrame(spriteLayers[0], 0);
  paintSpriteFrame(spriteLayers[1], 1);

  const spriteObserver = new IntersectionObserver(
    ([entry]) => {
      spriteVisible = entry.isIntersecting;
      syncSpriteLoop();
    },
    { rootMargin: "120px" },
  );

  spriteObserver.observe(manifestoSprite);
  document.addEventListener("visibilitychange", syncSpriteLoop);
  reduceSpriteMotion.addEventListener?.("change", syncSpriteLoop);
}

const slopCarousel = document.querySelector(".slop-carousel");

if (slopCarousel) {
  const carouselVideo = slopCarousel.querySelector("video");
  const reduceCarouselMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (carouselVideo) {
    carouselVideo.muted = true;
    carouselVideo.defaultMuted = true;
    carouselVideo.playsInline = true;
  }

  const setCarouselPaused = (isPaused) => {
    slopCarousel.classList.toggle("is-paused", isPaused);

    if (!carouselVideo) return;

    if (isPaused) {
      carouselVideo.pause();
    } else {
      carouselVideo.play().catch(() => {});
    }
  };

  const syncCarouselMotion = () => {
    setCarouselPaused(reduceCarouselMotion.matches || document.hidden);
  };

  document.addEventListener("visibilitychange", syncCarouselMotion);
  window.addEventListener("pageshow", syncCarouselMotion);
  reduceCarouselMotion.addEventListener?.("change", syncCarouselMotion);
  syncCarouselMotion();
}

const productSlopStage = document.querySelector("#productSlopStage");

if (productSlopStage) {
  productSlopStage.addEventListener("slopskinchange", (event) => {
    const detail = event.detail;
    if (!detail) return;

    if (detail.colors) {
      productSlopStage.style.setProperty("--slop-glow", detail.colors.glow);
      productSlopStage.style.setProperty("--slop-mid", detail.colors.mid);
    }
  });
}
