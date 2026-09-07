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
  const logoCanvas = asciiStage.querySelector("[data-dot-logo]");
  const logoContext = logoCanvas?.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let dotLogo = null;
  let isVisible = false;
  let bounceFrame = 0;
  let lastBounceTime = 0;
  let positionX = 0;
  let positionY = 0;
  let velocityX = 0;
  let velocityY = 0;
  let maxX = 0;
  let maxY = 0;
  let collisionCount = 0;
  let cornerRun = null;
  let hasBouncePosition = false;
  let dotImpact = null;

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
    let impact = 0;

    if (dotImpact) {
      const progress = Math.min(1, (time - dotImpact.startedAt) / dotImpact.duration);

      if (progress < 1) {
        impact = Math.sin(progress * Math.PI) * dotImpact.strength;
      } else {
        dotImpact = null;
      }
    }

    const bloomRadius = Math.min(dotLogo.width, dotLogo.height) * 0.24;
    const baseRadius = dotLogo.radius * 0.72;

    logoContext.fillStyle = "#000";
    logoContext.beginPath();

    dotLogo.points.forEach(([x, y]) => {
      const distance = Math.hypot(x - ambientX, y - ambientY);
      const bloom = Math.exp(-(distance * distance) / (2 * bloomRadius * bloomRadius));
      const ripple = reduceMotion.matches ? 0.5 : 0.5 + Math.sin(seconds * 2.3 - distance * 0.032) * 0.5;
      const radius =
        baseRadius +
        dotLogo.radius * (0.02 * breath + 0.42 * bloom + 0.015 * bloom * ripple) +
        impact * dotLogo.radius * 0.08 * bloom;

      logoContext.moveTo(x + radius, y);
      logoContext.arc(x, y, radius, 0, Math.PI * 2);
    });

    logoContext.fill();
  };

  const paintBouncePosition = () => {
    asciiStage.style.transform = `translate3d(${positionX.toFixed(2)}px, ${positionY.toFixed(2)}px, 0)`;
  };

  const setLeavingVelocity = (cornerX, cornerY) => {
    const speed = Math.max(46, Math.min(78, (bounceStage?.clientWidth || 800) * 0.06));
    velocityX = (cornerX === 0 ? 1 : -1) * speed;
    velocityY = (cornerY === 0 ? 1 : -1) * speed * 0.73;
  };

  const showBounceImpact = (isCorner) => {
    const now = performance.now();
    const currentImpactProgress = dotImpact ? (now - dotImpact.startedAt) / dotImpact.duration : 1;

    if (currentImpactProgress >= 0.65) {
      dotImpact = {
        startedAt: now,
        duration: isCorner ? 1450 : 1150,
        strength: isCorner ? 1 : 0.72,
      };
    }

    asciiStage.dataset.lastImpact = isCorner ? "corner" : "edge";
    if (isCorner) {
      asciiStage.dataset.cornerHits = String(Number(asciiStage.dataset.cornerHits || 0) + 1);
    }
    asciiStage.classList.remove("is-impact");
    requestAnimationFrame(() => asciiStage.classList.add("is-impact"));
    window.setTimeout(() => asciiStage.classList.remove("is-impact"), 360);
  };

  const aimForCorner = (targetX, targetY, duration = 5200) => {
    cornerRun = {
      startX: positionX,
      startY: positionY,
      targetX,
      targetY,
      startedAt: performance.now(),
      duration,
    };
  };

  const measureBounce = () => {
    if (!bounceStage) return;

    const logoRatio = (dotLogo?.width || logoCanvas?.width || 970) / (dotLogo?.height || logoCanvas?.height || 865);
    const preferredWidth = window.matchMedia("(max-width: 760px)").matches
      ? Math.min(window.innerWidth * 0.616, 258)
      : Math.min(Math.max(window.innerWidth * 0.336, 315), 462, window.innerWidth - 48);
    const fittedWidth = Math.max(
      1,
      Math.min(preferredWidth, bounceStage.clientWidth - 8, Math.max(1, bounceStage.clientHeight - 24) * logoRatio),
    );

    if (Math.abs(asciiStage.offsetWidth - fittedWidth) > 0.5) {
      asciiStage.style.width = `${fittedWidth.toFixed(2)}px`;
    }

    maxX = Math.max(0, bounceStage.clientWidth - asciiStage.offsetWidth);
    maxY = Math.max(0, bounceStage.clientHeight - asciiStage.offsetHeight);

    if (!hasBouncePosition) {
      positionX = maxX * 0.12;
      positionY = maxY * 0.16;
      hasBouncePosition = true;
      aimForCorner(maxX, maxY, 4800);
    } else {
      positionX = Math.min(maxX, Math.max(0, positionX));
      positionY = Math.min(maxY, Math.max(0, positionY));

      if (cornerRun) {
        cornerRun.targetX = cornerRun.targetX > maxX / 2 ? maxX : 0;
        cornerRun.targetY = cornerRun.targetY > maxY / 2 ? maxY : 0;
      }
    }

    if (reduceMotion.matches) {
      cornerRun = null;
      positionX = maxX / 2;
      positionY = maxY / 2;
    } else {
      if (maxX === 0) {
        positionX = 0;
        velocityX = 0;
      }

      if (maxY === 0) {
        positionY = 0;
        velocityY = 0;
      }

      if (maxX === 0 && maxY === 0) cornerRun = null;
    }

    paintBouncePosition();
    paintDotField(performance.now());
  };

  const moveBounce = (time) => {
    if (!bounceFrame) return;

    if (!lastBounceTime) lastBounceTime = time;
    const elapsed = Math.min((time - lastBounceTime) / 1000, 0.032);
    lastBounceTime = time;

    const canBounceX = maxX > 0.5;
    const canBounceY = maxY > 0.5;

    if (cornerRun && (canBounceX || canBounceY)) {
      const progress = Math.min(1, (time - cornerRun.startedAt) / cornerRun.duration);
      positionX = cornerRun.startX + (cornerRun.targetX - cornerRun.startX) * progress;
      positionY = cornerRun.startY + (cornerRun.targetY - cornerRun.startY) * progress;

      if (progress >= 1) {
        const cornerX = cornerRun.targetX;
        const cornerY = cornerRun.targetY;
        cornerRun = null;
        collisionCount = 0;
        setLeavingVelocity(cornerX, cornerY);
        showBounceImpact(true);
      }
    } else if (canBounceX || canBounceY) {
      if (canBounceX) positionX += velocityX * elapsed;
      if (canBounceY) positionY += velocityY * elapsed;
      let hitX = false;
      let hitY = false;

      if (canBounceX && (positionX <= 0 || positionX >= maxX)) {
        positionX = Math.min(maxX, Math.max(0, positionX));
        velocityX *= -1;
        hitX = true;
      }

      if (canBounceY && (positionY <= 0 || positionY >= maxY)) {
        positionY = Math.min(maxY, Math.max(0, positionY));
        velocityY *= -1;
        hitY = true;
      }

      if (hitX || hitY) {
        collisionCount += 1;
        showBounceImpact(hitX && hitY, hitX, hitY);

        if (collisionCount >= 4 && !(hitX && hitY)) {
          const targetX = positionX < maxX / 2 ? maxX : 0;
          const targetY = positionY < maxY / 2 ? maxY : 0;
          aimForCorner(targetX, targetY);
        }
      }
    }

    paintDotField(time);
    paintBouncePosition();
    bounceFrame = requestAnimationFrame(moveBounce);
  };

  const syncBounce = () => {
    if (bounceFrame) cancelAnimationFrame(bounceFrame);
    bounceFrame = 0;
    lastBounceTime = 0;
    measureBounce();
    paintDotField(performance.now());

    if (reduceMotion.matches || !isVisible || document.hidden) return;

    if (cornerRun) {
      cornerRun.startX = positionX;
      cornerRun.startY = positionY;
      cornerRun.startedAt = performance.now();
    }

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

    cycleTimer = window.setInterval(() => {
      activateWord((activeWord + 1) % words.length);
    }, 560);
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
