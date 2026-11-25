(() => {
  "use strict";

  const canvases = [...document.querySelectorAll("[data-holo-canvas]")];
  if (!canvases.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const VERTEX_SRC = `
    attribute vec2 a_pos;
    varying vec2 v_uv;
    void main() {
      v_uv = a_pos * 0.5 + 0.5;
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `;

  // Oceanic cerulean/cobalt sculptural liquid mesh (#001e4c -> #bfe0fa)
  // fused with tactile 35mm analog film grain (18fps organic film cadence, midtone-weighted)
  // modeled directly on the KansoAnki / echo LiquidMeshShader.metal aesthetic.
  const FRAGMENT_SRC = `
    precision highp float;
    varying vec2 v_uv;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_pointer;
    uniform float u_variant;

    float hash21(vec2 p) {
      p = fract(p * vec2(127.1, 311.7));
      p += dot(p, p + 34.23);
      return fract(p.x * p.y);
    }

    float valueNoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      float a = hash21(i);
      float b = hash21(i + vec2(1.0, 0.0));
      float c = hash21(i + vec2(0.0, 1.0));
      float d = hash21(i + vec2(1.0, 1.0));
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float amp = 0.54;
      mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
      for (int i = 0; i < 4; i++) {
        v += amp * valueNoise(p);
        p = rot * p * 2.03 + vec2(11.7, 6.3);
        amp *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = v_uv;
      float aspect = u_resolution.x / max(u_resolution.y, 1.0);
      vec2 p = uv - 0.5;
      p.x *= aspect;

      float t = u_time * 0.22;

      // Dual-layer flowing organic domain warp
      vec2 q = vec2(
        fbm(p * 1.4 + vec2(t * 0.52, -t * 0.34)),
        fbm(p * 1.4 + vec2(-t * 0.42 + 4.3, t * 0.45 + 1.9))
      );
      vec2 r = vec2(
        fbm(p * 1.85 + q * 1.55 + vec2(1.7, t * 0.28)),
        fbm(p * 1.85 + q * 1.55 + vec2(-2.9, -t * 0.24))
      );
      vec2 ptr = (u_pointer - 0.5) * vec2(aspect, 1.0) * 0.08;
      vec2 warped = p + (q - 0.5) * 0.36 + (r - 0.5) * 0.14 - ptr;

      // Sculptural optical water ripples biased cleanly into the luminous light field
      vec2 rippleOrigin = (u_variant > 0.5)
        ? vec2(0.28 * aspect, 0.05)
        : vec2(0.22 * aspect, 0.02);
      vec2 d1 = (warped - rippleOrigin) * vec2(1.02, 0.86);
      float dist1 = length(d1);
      float rings1 = sin(dist1 * 18.0 - t * 1.45 + (q.x - 0.5) * 3.0) * exp(-dist1 * 0.92);

      vec2 d2 = (warped - vec2(-0.18 * aspect, 0.26)) * vec2(0.92, 1.08);
      float dist2 = length(d2);
      float rings2 = sin(dist2 * 12.0 - t * 0.90 + (r.y - 0.5) * 2.4) * exp(-dist2 * 1.25);

      float wave = rings1 * 0.72 + rings2 * 0.36;
      vec2 refracted = warped + normalize(d1 + 0.0001) * (wave * 0.070);

      // Exact 6 oceanic cerulean/cobalt stops (#001e4c -> #bfe0fa)
      vec3 c0 = vec3(0.000, 0.118, 0.298);
      vec3 c1 = vec3(0.188, 0.345, 0.533);
      vec3 c2 = vec3(0.247, 0.506, 0.765);
      vec3 c3 = vec3(0.380, 0.651, 0.894);
      vec3 c4 = vec3(0.596, 0.784, 0.941);
      vec3 c5 = vec3(0.749, 0.878, 0.980);

      float invTwoSigmaSq = 1.0 / (2.0 * 0.38 * 0.38);

      vec2 a0 = vec2( 0.305,  0.008) * vec2(1.25, 1.15) + vec2(sin(t * 0.44), cos(t * 0.39)) * 0.07;
      vec2 a1 = vec2( 0.038,  0.299) * vec2(1.25, 1.15) + vec2(sin(t * 0.52 + 1.7), cos(t * 0.45 + 2.1)) * 0.07;
      vec2 a2 = vec2(-0.228,  0.169) * vec2(1.25, 1.15) + vec2(sin(t * 0.60 + 3.4), cos(t * 0.51 + 4.2)) * 0.07;
      vec2 a3 = vec2(-0.293, -0.005) * vec2(1.25, 1.15) + vec2(sin(t * 0.68 + 5.1), cos(t * 0.57 + 6.3)) * 0.07;
      vec2 a4 = vec2(-0.004, -0.264) * vec2(1.25, 1.15) + vec2(sin(t * 0.76 + 6.8), cos(t * 0.63 + 8.4)) * 0.07;
      vec2 a5 = vec2( 0.231, -0.129) * vec2(1.25, 1.15) + vec2(sin(t * 0.84 + 8.5), cos(t * 0.69 + 10.5)) * 0.07;

      float w0 = exp(-dot(refracted - a0, refracted - a0) * invTwoSigmaSq);
      float w1 = exp(-dot(refracted - a1, refracted - a1) * invTwoSigmaSq);
      float w2 = exp(-dot(refracted - a2, refracted - a2) * invTwoSigmaSq);
      float w3 = exp(-dot(refracted - a3, refracted - a3) * invTwoSigmaSq);
      float w4 = exp(-dot(refracted - a4, refracted - a4) * invTwoSigmaSq);
      float w5 = exp(-dot(refracted - a5, refracted - a5) * invTwoSigmaSq);
      float wSum = w0 + w1 + w2 + w3 + w4 + w5 + 0.0001;
      vec3 col = (c0*w0 + c1*w1 + c2*w2 + c3*w3 + c4*w4 + c5*w5) / wSum;

      // Sculptural deep cobalt troughs vs radiant sky-frost crests
      float crest = smoothstep(-0.40, 0.82, wave);
      float trough = smoothstep(0.28, -0.82, wave);
      col = mix(col, vec3(0.006, 0.105, 0.285), trough * 0.58);
      col = mix(col, vec3(0.54, 0.80, 0.99), crest * 0.38);

      // Luminous atmospheric glow near upper-right behind the live reel
      float crown = smoothstep(0.75, 0.0, length((uv - vec2(0.72, 0.74)) * vec2(1.1, 1.2)));
      col += vec3(0.11, 0.22, 0.36) * crown * 0.55;

      // Silky deep-navy readability gradient on the left so pure white text has >12:1 contrast
      float leftCalm = smoothstep(0.68, -0.05, uv.x);
      col = mix(col, vec3(0.008, 0.102, 0.265), leftCalm * 0.62);

      // Poster vignette
      float edgeDist = length((uv - vec2(0.56, 0.48)) * vec2(1.02, 0.94));
      float vignette = smoothstep(0.36, 1.12, edgeDist);
      col = mix(col, col * vec3(0.42, 0.54, 0.78), vignette * 0.52);

      // Punchy editorial contrast & saturation
      col = (col - 0.5) * 1.14 + 0.5;
      float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(vec3(luma), col, 1.18);

      // Tactile 35mm analog film grain (18fps organic film cadence, midtone-weighted — exact echo grain!)
      float grainTick = floor(u_time * 18.0);
      vec2 grainCoord = floor(gl_FragCoord.xy * 0.86);
      float g1 = hash21(grainCoord + vec2(grainTick * 17.3, grainTick * 31.7));
      float g2 = hash21(grainCoord * 1.73 - vec2(grainTick * 11.1, grainTick * 7.9));
      float fineGrain = (g1 + g2 - 1.0);
      float midtoneWeight = 1.0 - abs(luma - 0.48) * 0.52;
      vec3 grainRGB = vec3(fineGrain, fineGrain * 0.97, fineGrain * 1.03) * (0.074 * midtoneWeight);
      col = clamp(col + grainRGB, 0.0, 1.0);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function createStage(canvas) {
    const gl =
      canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "low-power",
      }) ||
      canvas.getContext("experimental-webgl");

    if (!gl) return;

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const aPos = gl.getAttribLocation(program, "a_pos");
    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uPtr = gl.getUniformLocation(program, "u_pointer");
    const uVariant = gl.getUniformLocation(program, "u_variant");
    const variant = canvas.dataset.holoCanvas === "cta" ? 1.0 : 0.0;

    let width = 0;
    let height = 0;
    let visible = !("IntersectionObserver" in window);
    let raf = 0;
    let startTime = performance.now();
    let pointerX = 0.65;
    let pointerY = 0.55;
    let targetX = 0.65;
    let targetY = 0.55;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const nextW = Math.max(2, Math.round(rect.width * dpr));
      const nextH = Math.max(2, Math.round(rect.height * dpr));
      if (nextW === width && nextH === height) return;
      width = nextW;
      height = nextH;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }

    function draw(now) {
      raf = 0;
      resize();
      if (!width || !height) return;

      pointerX += (targetX - pointerX) * 0.045;
      pointerY += (targetY - pointerY) * 0.045;

      const elapsed = reducedMotion.matches ? 3.2 : (now - startTime) * 0.001 + 3.2;

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(uRes, width, height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uPtr, pointerX, pointerY);
      gl.uniform1f(uVariant, variant);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      canvas.classList.add("is-ready");

      if (visible && !document.hidden && !reducedMotion.matches) {
        raf = window.requestAnimationFrame(draw);
      }
    }

    function sync() {
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
      if (visible && !document.hidden) {
        draw(performance.now());
      }
    }

    const host = canvas.parentElement;
    if (host && window.matchMedia("(pointer: fine)").matches) {
      host.addEventListener(
        "pointermove",
        (event) => {
          const rect = host.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          targetX = (event.clientX - rect.left) / rect.width;
          targetY = 1.0 - (event.clientY - rect.top) / rect.height;
        },
        { passive: true },
      );
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          sync();
        },
        { threshold: 0.01 },
      ).observe(canvas);
    }

    if ("ResizeObserver" in window) {
      new ResizeObserver(() => {
        resize();
        if (visible && reducedMotion.matches) draw(performance.now());
      }).observe(canvas);
    }

    document.addEventListener("visibilitychange", sync);
    reducedMotion.addEventListener?.("change", sync);
    sync();
  }

  canvases.forEach(createStage);
})();
