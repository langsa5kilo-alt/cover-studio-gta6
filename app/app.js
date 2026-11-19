"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const cover = $("#cover");
const preview = cover.getContext("2d");

const GRADES = {
  "Vice sunset": { shadow: "#30215f", mid: "#eb3f88", light: "#ffb35c" },
  "Neon night": { shadow: "#071b47", mid: "#6c22dd", light: "#08d6cf" },
  "Hot pink": { shadow: "#5e164f", mid: "#fc277f", light: "#ff875f" },
  "Teal & orange": { shadow: "#073c49", mid: "#008f91", light: "#ff7a38" }
};

const LAYOUTS = {
  single: () => [{ x: 0, y: 0, width: 1, height: 1 }],
  double: (gap) => [
    { x: 0, y: 0, width: 0.55 - gap / 2, height: 1 },
    { x: 0.55 + gap / 2, y: 0, width: 0.45 - gap / 2, height: 1 }
  ],
  triple: (gap) => [
    { x: 0, y: 0, width: 0.56 - gap / 2, height: 1 },
    { x: 0.56 + gap / 2, y: 0, width: 0.44 - gap / 2, height: 0.5 - gap / 2 },
    { x: 0.56 + gap / 2, y: 0.5 + gap / 2, width: 0.44 - gap / 2, height: 0.5 - gap / 2 }
  ]
};

const state = {
  layout: "triple", size: [1080, 1350], grade: "Vice sunset",
  upper: "A SUNSET STORY", title: "VICE NIGHTS", credit: "A VANTA ORIGINAL · MMXXVI",
  bloom: 38, grain: 22, activePanel: 0, drag: null,
  panels: Array.from({ length: 3 }, (_, sample) => ({ image: null, panX: 0, panY: 0, zoom: 1, sample }))
};

function layoutRects(width, height) {
  return LAYOUTS[state.layout](0.014).map((rect) => ({
    x: rect.x * width, y: rect.y * height,
    width: rect.width * width, height: rect.height * height
  }));
}

function withClip(context, rect, draw) {
  context.save();
  context.beginPath();
  context.rect(rect.x, rect.y, rect.width, rect.height);
  context.clip();
  draw();
  context.restore();
}

function seeded(index) {
  const value = Math.sin(index * 91.731 + 18.421) * 43758.5453;
  return value - Math.floor(value);
}

function fillSky(context, width, height, stops) {
  const sky = context.createLinearGradient(0, 0, width * 0.8, height);
  stops.forEach(([position, color]) => sky.addColorStop(position, color));
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);
}

function drawHaze(context, width, height, bands = 5) {
  context.save();
  context.globalCompositeOperation = "screen";
  for (let index = 0; index < bands; index += 1) {
    const centerY = height * (0.28 + index * 0.13);
    const haze = context.createLinearGradient(0, centerY - height * 0.1, 0, centerY + height * 0.1);
    haze.addColorStop(0, "#f6a6d000");
    haze.addColorStop(0.5, index % 2 ? "#ff85bd24" : "#8ac9ff20");
    haze.addColorStop(1, "#f6a6d000");
    context.fillStyle = haze;
    context.fillRect(0, centerY - height * 0.1, width, height * 0.2);
  }
  context.restore();
}

function drawLightRay(context, width, height, originX, opacity = 0.2) {
  const ray = context.createLinearGradient(0, 0, width, height);
  ray.addColorStop(0, `rgba(255,211,174,${opacity})`);
  ray.addColorStop(0.48, `rgba(255,141,188,${opacity * 0.45})`);
  ray.addColorStop(1, "rgba(255,141,188,0)");
  context.save();
  context.globalCompositeOperation = "screen";
  context.fillStyle = ray;
  context.beginPath();
  context.moveTo(originX, 0);
  context.lineTo(Math.min(width, originX + width * 0.25), 0);
  context.lineTo(width * 0.78, height);
  context.lineTo(width * 0.42, height);
  context.closePath();
  context.fill();
  context.restore();
}

function drawStarSpecks(context, width, height, seedOffset, count) {
  context.save();
  context.fillStyle = "#fff5df";
  for (let index = 0; index < count; index += 1) {
    const x = seeded(seedOffset + index * 2) * width;
    const y = seeded(seedOffset + index * 2 + 1) * height * 0.72;
    const radius = 0.45 + seeded(seedOffset + index * 3) * Math.max(0.8, width / 600);
    context.globalAlpha = 0.18 + seeded(index + seedOffset) * 0.55;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function drawPortraitPanel(context, width, height) {
  fillSky(context, width, height, [[0, "#171a4a"], [0.4, "#713078"], [0.73, "#d74580"], [1, "#f18479"]]);
  drawLightRay(context, width, height, width * 0.05, 0.24);
  drawHaze(context, width, height, 7);
  drawStarSpecks(context, width, height, 14, 90);

  const glow = context.createRadialGradient(width * 0.38, height * 0.38, 0, width * 0.38, height * 0.38, width * 0.38);
  glow.addColorStop(0, "#ff9ec05c");
  glow.addColorStop(1, "#ff9ec000");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  context.save();
  context.shadowColor = "#ff78b8";
  context.shadowBlur = width * 0.035;
  context.strokeStyle = "#ff9ec8";
  context.lineWidth = width * 0.014;
  context.beginPath();
  context.arc(width * 0.48, height * 0.39, width * 0.15, Math.PI * 0.62, Math.PI * 1.55);
  context.stroke();
  context.beginPath();
  context.moveTo(width * 0.39, height * 0.49);
  context.bezierCurveTo(width * 0.3, height * 0.56, width * 0.22, height * 0.73, width * 0.2, height);
  context.stroke();
  context.restore();

  context.fillStyle = "#121326";
  context.beginPath();
  context.ellipse(width * 0.5, height * 0.39, width * 0.15, height * 0.13, -0.08, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.moveTo(width * 0.42, height * 0.48);
  context.bezierCurveTo(width * 0.31, height * 0.52, width * 0.22, height * 0.7, width * 0.17, height);
  context.lineTo(width * 0.84, height);
  context.bezierCurveTo(width * 0.78, height * 0.68, width * 0.67, height * 0.53, width * 0.57, height * 0.48);
  context.closePath();
  context.fill();
  context.fillStyle = "#252142";
  context.beginPath();
  context.moveTo(width * 0.33, height);
  context.lineTo(width * 0.48, height * 0.57);
  context.lineTo(width * 0.61, height);
  context.closePath();
  context.fill();

  const foreground = context.createLinearGradient(0, height * 0.66, 0, height);
  foreground.addColorStop(0, "#17152a00");
  foreground.addColorStop(1, "#090914cc");
  context.fillStyle = foreground;
  context.fillRect(0, height * 0.62, width, height * 0.38);
}

function drawSkylinePanel(context, width, height) {
  fillSky(context, width, height, [[0, "#11194b"], [0.5, "#293f79"], [0.78, "#9e3f79"], [1, "#f06d76"]]);
  drawLightRay(context, width, height, width * 0.42, 0.17);
  drawHaze(context, width, height, 4);
  drawStarSpecks(context, width, height, 240, 72);

  const layers = [
    { base: 0.67, color: "#343359", alpha: 0.55, step: 0.12 },
    { base: 0.76, color: "#22223f", alpha: 0.8, step: 0.1 },
    { base: 0.83, color: "#101527", alpha: 1, step: 0.085 }
  ];
  layers.forEach((layer, layerIndex) => {
    context.globalAlpha = layer.alpha;
    context.fillStyle = layer.color;
    for (let index = 0; index < 12; index += 1) {
      const buildingWidth = width * (layer.step * 0.72);
      const x = width * (index * layer.step - layerIndex * 0.035);
      const top = height * (layer.base - seeded(index + layerIndex * 20) * 0.3);
      context.fillRect(x, top, buildingWidth, height - top);
      if (layerIndex === 2 && index % 2 === 0) {
        context.fillStyle = index % 4 ? "#f053a5" : "#55dbea";
        context.fillRect(x + buildingWidth * 0.2, top + height * 0.05, buildingWidth * 0.08, height * 0.12);
        context.fillStyle = layer.color;
      }
    }
  });
  context.globalAlpha = 1;

  context.fillStyle = "#080c18";
  context.fillRect(0, height * 0.83, width, height * 0.17);
  context.beginPath();
  context.moveTo(width * 0.14, height * 0.85);
  context.bezierCurveTo(width * 0.24, height * 0.76, width * 0.62, height * 0.74, width * 0.78, height * 0.83);
  context.lineTo(width * 0.92, height * 0.88);
  context.lineTo(width * 0.88, height * 0.94);
  context.lineTo(width * 0.12, height * 0.94);
  context.closePath();
  context.fill();
  context.fillStyle = "#e64b9f";
  context.fillRect(width * 0.2, height * 0.84, width * 0.14, height * 0.018);
  context.fillStyle = "#60e5ec";
  context.fillRect(width * 0.7, height * 0.845, width * 0.11, height * 0.015);

  const roadGlow = context.createLinearGradient(0, height * 0.87, 0, height);
  roadGlow.addColorStop(0, "#e84b9f85");
  roadGlow.addColorStop(1, "#e84b9f00");
  context.fillStyle = roadGlow;
  context.beginPath();
  context.moveTo(width * 0.18, height * 0.87);
  context.lineTo(width * 0.37, height * 0.87);
  context.lineTo(width * 0.47, height);
  context.lineTo(width * 0.08, height);
  context.closePath();
  context.fill();
}

function drawPalmPanel(context, width, height) {
  fillSky(context, width, height, [[0, "#412060"], [0.38, "#a63576"], [0.7, "#ef6375"], [1, "#ffad6c"]]);
  drawLightRay(context, width, height, width * 0.02, 0.2);
  drawHaze(context, width, height, 5);
  drawStarSpecks(context, width, height, 520, 48);

  const sun = context.createRadialGradient(width * 0.72, height * 0.3, width * 0.015, width * 0.72, height * 0.3, width * 0.19);
  sun.addColorStop(0, "#fff3b8");
  sun.addColorStop(0.48, "#ffc977");
  sun.addColorStop(1, "#ff9a7900");
  context.fillStyle = sun;
  context.fillRect(width * 0.48, height * 0.05, width * 0.48, height * 0.5);
  context.fillStyle = "#ffd58b";
  context.beginPath();
  context.arc(width * 0.72, height * 0.3, width * 0.105, 0, Math.PI * 2);
  context.fill();

  function palm(x, base, scale, lean) {
    context.save();
    context.translate(x, base);
    context.rotate(lean);
    context.strokeStyle = "#131326";
    context.lineWidth = width * 0.035 * scale;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(0, 0);
    context.bezierCurveTo(width * 0.02, -height * 0.2, -width * 0.03, -height * 0.48, width * 0.04, -height * 0.67);
    context.stroke();
    context.translate(width * 0.04, -height * 0.67);
    context.fillStyle = "#101124";
    for (let index = 0; index < 9; index += 1) {
      const angle = -Math.PI * 0.9 + index * Math.PI * 0.22;
      context.save();
      context.rotate(angle);
      context.beginPath();
      context.moveTo(0, 0);
      context.quadraticCurveTo(width * 0.17 * scale, -height * 0.035, width * 0.31 * scale, height * 0.035);
      context.quadraticCurveTo(width * 0.17 * scale, height * 0.055, 0, 0);
      context.fill();
      context.restore();
    }
    context.restore();
  }
  palm(width * 0.2, height * 1.03, 1, -0.08);
  palm(width * 0.5, height * 1.08, 0.7, 0.12);

  context.fillStyle = "#0c1020";
  context.beginPath();
  context.moveTo(0, height * 0.87);
  context.quadraticCurveTo(width * 0.34, height * 0.8, width * 0.58, height * 0.9);
  context.quadraticCurveTo(width * 0.8, height * 0.96, width, height * 0.84);
  context.lineTo(width, height);
  context.lineTo(0, height);
  context.closePath();
  context.fill();
}

const SAMPLE_SCENES = [drawPortraitPanel, drawSkylinePanel, drawPalmPanel];

function drawSample(context, rect, panel, scaleX, scaleY) {
  context.save();
  context.translate(
    rect.x + rect.width / 2 + panel.panX * scaleX,
    rect.y + rect.height / 2 + panel.panY * scaleY
  );
  context.scale(panel.zoom, panel.zoom);
  context.translate(-rect.width / 2, -rect.height / 2);
  SAMPLE_SCENES[panel.sample](context, rect.width, rect.height);
  context.restore();
}

function drawCoverImage(context, image, rect, panel, scaleX, scaleY) {
  const imageRatio = image.width / image.height;
  const rectRatio = rect.width / rect.height;
  let width;
  let height;
  if (imageRatio > rectRatio) {
    height = rect.height;
    width = height * imageRatio;
  } else {
    width = rect.width;
    height = width / imageRatio;
  }
  width *= panel.zoom;
  height *= panel.zoom;
  const x = rect.x + (rect.width - width) / 2 + panel.panX * scaleX;
  const y = rect.y + (rect.height - height) / 2 + panel.panY * scaleY;
  context.drawImage(image, x, y, width, height);
}

function drawPanels(context, width, height) {
  const scaleX = width / cover.width;
  const scaleY = height / cover.height;
  layoutRects(width, height).forEach((rect, index) => withClip(context, rect, () => {
    const panel = state.panels[index];
    if (panel.image) drawCoverImage(context, panel.image, rect, panel, scaleX, scaleY);
    else drawSample(context, rect, panel, scaleX, scaleY);
  }));
}

function drawGrade(context, width, height) {
  const grade = GRADES[state.grade];
  const wash = context.createLinearGradient(0, 0, width, height);
  wash.addColorStop(0, `${grade.shadow}66`);
  wash.addColorStop(0.55, `${grade.mid}24`);
  wash.addColorStop(1, `${grade.light}70`);
  context.save();
  context.globalCompositeOperation = "screen";
  context.fillStyle = wash;
  context.fillRect(0, 0, width, height);
  context.restore();
  const vignette = context.createRadialGradient(width * 0.52, height * 0.42, height * 0.08, width * 0.5, height * 0.48, height * 0.8);
  vignette.addColorStop(0.4, "#10091a00");
  vignette.addColorStop(1, "#0907119c");
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);
}

function measuredText(context, text, x, y, size, tracking, align = "left") {
  const characters = [...text.toUpperCase()];
  context.font = `900 ${size}px Impact, Arial Narrow, Arial, sans-serif`;
  const width = characters.reduce((total, character, index) => total + context.measureText(character).width + (index ? tracking : 0), 0);
  let cursor = align === "center" ? x - width / 2 : align === "right" ? x - width : x;
  characters.forEach((character) => {
    context.fillText(character, cursor, y);
    cursor += context.measureText(character).width + tracking;
  });
}

function drawTypography(context, width, height) {
  const grade = GRADES[state.grade];
  const band = context.createLinearGradient(0, height * 0.58, 0, height);
  band.addColorStop(0, "#100b1800");
  band.addColorStop(0.26, "#100b1866");
  band.addColorStop(0.62, "#0c0915dc");
  band.addColorStop(1, "#06060bfc");
  context.fillStyle = band;
  context.fillRect(0, height * 0.58, width, height * 0.42);
  context.fillStyle = "#ffffff";
  measuredText(context, state.upper, width * 0.067, height * 0.748, height * 0.013, height * 0.0065);
  const titleSize = Math.min(height * 0.102, width / (Math.max(8, state.title.length) * 0.57));
  context.save();
  context.shadowColor = grade.mid;
  context.shadowBlur = height * (state.bloom / 100) * 0.018;
  measuredText(context, state.title, width * 0.065, height * 0.875, titleSize, -titleSize * 0.075);
  context.restore();
  context.fillStyle = grade.light;
  context.fillRect(width * 0.065, height * 0.905, width * 0.25, Math.max(3, height * 0.004));
  context.fillStyle = "#ffffff52";
  context.fillRect(width * 0.065, height * 0.935, width * 0.87, Math.max(1, height * 0.001));
  context.fillStyle = "#ffffff";
  measuredText(context, state.credit, width * 0.935, height * 0.968, height * 0.0105, height * 0.0022, "right");
  context.strokeStyle = "#ffffffaa";
  context.lineWidth = Math.max(2, width * 0.002);
  context.strokeRect(width * 0.025, height * 0.02, width * 0.95, height * 0.96);
}

function drawGrain(context, width, height) {
  if (!state.grain) return;
  context.save();
  context.globalAlpha = state.grain / 280;
  const count = Math.round(width * height / 810);
  for (let index = 0; index < count; index += 1) {
    const x = (index * 73) % width;
    const y = (index * 191) % height;
    const size = 0.8 + seeded(index) * Math.max(1.2, width / 720);
    context.fillStyle = index % 2 ? "#ffffff" : "#000000";
    context.fillRect(x, y, size, size);
  }
  context.restore();
}

function renderTo(context, width, height) {
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#15131d";
  context.fillRect(0, 0, width, height);
  drawPanels(context, width, height);
  drawGrade(context, width, height);
  drawTypography(context, width, height);
  drawGrain(context, width, height);
}

function render() {
  renderTo(preview, cover.width, cover.height);
  updatePanelList();
  $("#zoomLabel").textContent = `${Math.round(state.panels[state.activePanel].zoom * 100)}%`;
  cover.setAttribute("aria-label", `Cover preview. Panel ${state.activePanel + 1} selected. Drag to pan, or use arrow keys to nudge; hold Shift for a larger step.`);
}

function nudgeActivePanel(key, largeStep) {
  const panel = state.panels[state.activePanel];
  const distance = largeStep ? 12 : 3;
  panel.panX += key === "ArrowLeft" ? -distance : key === "ArrowRight" ? distance : 0;
  panel.panY += key === "ArrowUp" ? -distance : key === "ArrowDown" ? distance : 0;
  render();
}

function updatePanelList() {
  const list = $("#panelList");
  list.replaceChildren();
  layoutRects(cover.width, cover.height).forEach((_, index) => {
    const panel = state.panels[index];
    const card = document.createElement("div");
    card.className = `panel-card${index === state.activePanel ? " active" : ""}`;
    card.tabIndex = 0;
    card.setAttribute("role", "group");
    card.setAttribute("aria-label", `Focus panel ${index + 1} for keyboard nudging`);
    card.innerHTML = `<span class="thumb"></span><span><b>PANEL ${String(index + 1).padStart(2, "0")}</b><small>${panel.image ? "Your local photo" : "Built-in sample image"}</small></span><button title="Reset panel">↺</button>`;
    card.addEventListener("click", () => { state.activePanel = index; render(); });
    card.addEventListener("focus", () => {
      state.activePanel = index;
      $$(".panel-card").forEach((item, itemIndex) => item.classList.toggle("active", itemIndex === index));
      cover.setAttribute("aria-label", `Cover preview. Panel ${index + 1} selected. Drag to pan, or use arrow keys to nudge; hold Shift for a larger step.`);
    });
    card.addEventListener("keydown", (event) => {
      if (!event.key.startsWith("Arrow")) return;
      event.preventDefault();
      nudgeActivePanel(event.key, event.shiftKey);
      $$(".panel-card")[index].focus();
    });
    $("button", card).addEventListener("click", (event) => {
      event.stopPropagation();
      Object.assign(panel, { panX: 0, panY: 0, zoom: 1 });
      render();
    });
    list.append(card);
  });
  $(".counter").textContent = `${layoutRects(cover.width, cover.height).length} / 3`;
}

function canvasPoint(event) {
  const bounds = cover.getBoundingClientRect();
  return { x: (event.clientX - bounds.left) * cover.width / bounds.width, y: (event.clientY - bounds.top) * cover.height / bounds.height };
}

function panelAt(point) {
  return layoutRects(cover.width, cover.height).findIndex((rect) => point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height);
}

cover.addEventListener("pointerdown", (event) => {
  const index = panelAt(canvasPoint(event));
  if (index >= 0) state.activePanel = index;
  state.drag = { x: event.clientX, y: event.clientY };
  cover.setPointerCapture(event.pointerId);
  cover.focus();
  render();
});
cover.addEventListener("pointermove", (event) => {
  if (!state.drag) return;
  const bounds = cover.getBoundingClientRect();
  const panel = state.panels[state.activePanel];
  panel.panX += (event.clientX - state.drag.x) * cover.width / bounds.width;
  panel.panY += (event.clientY - state.drag.y) * cover.height / bounds.height;
  state.drag = { x: event.clientX, y: event.clientY };
  render();
});
cover.addEventListener("pointerup", () => { state.drag = null; });
cover.addEventListener("pointercancel", () => { state.drag = null; });
cover.addEventListener("wheel", (event) => {
  event.preventDefault();
  const panel = state.panels[state.activePanel];
  panel.zoom = Math.max(0.6, Math.min(3, panel.zoom * (event.deltaY < 0 ? 1.06 : 0.94)));
  render();
}, { passive: false });
cover.addEventListener("keydown", (event) => {
  if (!event.key.startsWith("Arrow")) return;
  event.preventDefault();
  nudgeActivePanel(event.key, event.shiftKey);
});

function loadFiles(files) {
  [...files].slice(0, 3).forEach((file, index) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const image = new Image();
      image.addEventListener("load", () => { state.panels[index].image = image; render(); });
      image.src = reader.result;
    });
    reader.readAsDataURL(file);
  });
}

function makeExportCanvas() {
  const output = document.createElement("canvas");
  [output.width, output.height] = state.size;
  renderTo(output.getContext("2d"), output.width, output.height);
  return output;
}

function safeFilename(value) {
  return (value || "vanta-cover").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function exportPng(download = true) {
  const output = makeExportCanvas();
  $("#exportImage").src = output.toDataURL("image/png");
  $("#exportView label").textContent = `EXPORT PREVIEW · ${output.width} × ${output.height} PNG`;
  if (download) {
    output.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${safeFilename(state.title)}.png`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
    const toast = $("#toast");
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2200);
  }
  return output;
}

function buildGradeButtons() {
  Object.entries(GRADES).forEach(([name, colors]) => {
    const button = document.createElement("button");
    button.className = `grade${name === state.grade ? " active" : ""}`;
    button.textContent = name;
    button.style.background = `linear-gradient(140deg, ${colors.shadow}, ${colors.mid}, ${colors.light})`;
    button.addEventListener("click", () => {
      state.grade = name;
      $$(".grade").forEach((item) => item.classList.toggle("active", item === button));
      render();
    });
    $("#grades").append(button);
  });
}

$$('.rail-tab').forEach((button) => button.addEventListener("click", () => {
  $$(".rail-tab").forEach((item) => item.classList.toggle("active", item === button));
  $$(".pane").forEach((pane) => pane.classList.toggle("active", pane.dataset.pane === button.dataset.tab));
}));
$$('.layout').forEach((button) => button.addEventListener("click", () => {
  state.layout = button.dataset.layout;
  state.activePanel = Math.min(state.activePanel, LAYOUTS[state.layout](0).length - 1);
  $$(".layout").forEach((item) => item.classList.toggle("active", item === button));
  render();
}));
$$('.format').forEach((button) => button.addEventListener("click", () => {
  state.size = button.dataset.size.split(",").map(Number);
  [cover.width, cover.height] = state.size;
  $("#dimensions").textContent = state.size.join(" × ");
  $$(".format").forEach((item) => item.classList.toggle("active", item === button));
  render();
}));
["upper", "title", "credit"].forEach((id) => $(`#${id}`).addEventListener("input", (event) => { state[id] = event.target.value; render(); }));
["bloom", "grain"].forEach((id) => $(`#${id}`).addEventListener("input", (event) => {
  state[id] = Number(event.target.value);
  $(`#${id}Out`).textContent = event.target.value;
  render();
}));

const fileInput = $("#fileInput");
const dropzone = $("#dropzone");
fileInput.addEventListener("change", () => loadFiles(fileInput.files));
dropzone.addEventListener("dragover", (event) => { event.preventDefault(); dropzone.style.borderColor = "#ff3d8f"; });
dropzone.addEventListener("dragleave", () => { dropzone.style.borderColor = ""; });
dropzone.addEventListener("drop", (event) => { event.preventDefault(); loadFiles(event.dataTransfer.files); dropzone.style.borderColor = ""; });
$("#zoomPlus").addEventListener("click", () => { state.panels[state.activePanel].zoom = Math.min(3, state.panels[state.activePanel].zoom * 1.08); render(); });
$("#zoomMinus").addEventListener("click", () => { state.panels[state.activePanel].zoom = Math.max(0.6, state.panels[state.activePanel].zoom / 1.08); render(); });
$("#exportBtn").addEventListener("click", () => exportPng(true));
$("#closeExport").addEventListener("click", () => $("#exportView").classList.remove("open"));

buildGradeButtons();
const query = new URLSearchParams(location.search);
if (query.get("shot") === "grade") {
  state.panels[0].panX = 48;
  state.panels[0].panY = -22;
  document.body.classList.add("demo-drag");
  $('[data-tab="grade"]').click();
}
render();
if (query.get("shot") === "export") {
  exportPng(false);
  $("#exportView").classList.add("open");
}
