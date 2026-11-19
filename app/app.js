"use strict";

const one = (selector, root = document) => root.querySelector(selector);
const all = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const canvas = one("#poster");
const screen = canvas.getContext("2d");

const layouts = {
  triple: { label: "Three panel", note: "Classic cover", count: 3 },
  double: { label: "Two panel", note: "Split scene", count: 2 },
  full: { label: "Full bleed", note: "Hero portrait", count: 1 }
};

const grades = {
  "Vice sunset": ["#25184d", "#d13b85", "#ff9d59"],
  "Neon night": ["#081b49", "#6520cf", "#12c9c7"],
  "Hot pink": ["#521341", "#f32b7b", "#ff8b65"],
  "Teal & orange": ["#073944", "#008c8d", "#ff7739"]
};

const model = {
  layout: "triple",
  width: 1080,
  height: 1350,
  grade: "Vice sunset",
  bloom: 38,
  grain: 22,
  active: 0,
  previewScale: 1,
  words: { eyebrow: "A SUNSET STORY", title: "VICE NIGHTS", credit: "A VANTA ORIGINAL · MMXXVI" },
  panels: Array.from({ length: 3 }, (_, index) => ({ image: null, name: "Built-in sample image", x: 0, y: 0, zoom: 1, sample: index })),
  pointer: null
};

function panelRects(width, height) {
  const gap = Math.max(5, width * 0.012);
  if (model.layout === "full") return [{ x: 0, y: 0, w: width, h: height }];
  if (model.layout === "double") {
    const split = width * 0.55;
    return [{ x: 0, y: 0, w: split - gap / 2, h: height }, { x: split + gap / 2, y: 0, w: width - split - gap / 2, h: height }];
  }
  const splitX = width * 0.56;
  const splitY = height * 0.5;
  return [
    { x: 0, y: 0, w: splitX - gap / 2, h: height },
    { x: splitX + gap / 2, y: 0, w: width - splitX - gap / 2, h: splitY - gap / 2 },
    { x: splitX + gap / 2, y: splitY + gap / 2, w: width - splitX - gap / 2, h: height - splitY - gap / 2 }
  ];
}

function randomAt(seed) {
  const wave = Math.sin(seed * 83.17 + 4.63) * 19731.417;
  return wave - Math.floor(wave);
}

function clipped(context, rect, paint) {
  context.save();
  context.beginPath();
  context.rect(rect.x, rect.y, rect.w, rect.h);
  context.clip();
  context.translate(rect.x, rect.y);
  paint(rect.w, rect.h);
  context.restore();
}

function gradientFill(context, width, height, colors) {
  const wash = context.createLinearGradient(0, 0, width * 0.8, height);
  wash.addColorStop(0, colors[0]);
  wash.addColorStop(0.56, colors[1]);
  wash.addColorStop(1, colors[2]);
  context.fillStyle = wash;
  context.fillRect(0, 0, width, height);
}

function speckles(context, width, height, seed, amount) {
  context.save();
  context.fillStyle = "#fff4dc";
  for (let dot = 0; dot < amount; dot += 1) {
    context.globalAlpha = 0.16 + randomAt(seed + dot) * 0.48;
    context.beginPath();
    context.arc(randomAt(seed + dot * 2) * width, randomAt(seed + dot * 2 + 1) * height * 0.75, 0.5 + randomAt(dot) * 1.2, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function lightBeam(context, width, height, start) {
  const glow = context.createLinearGradient(0, 0, width, height);
  glow.addColorStop(0, "#ffd5b955");
  glow.addColorStop(0.55, "#ff8fbd22");
  glow.addColorStop(1, "#ff8fbd00");
  context.save();
  context.globalCompositeOperation = "screen";
  context.fillStyle = glow;
  context.beginPath();
  context.moveTo(width * start, 0);
  context.lineTo(width * (start + 0.22), 0);
  context.lineTo(width * 0.78, height);
  context.lineTo(width * 0.42, height);
  context.fill();
  context.restore();
}

function portraitScene(context, width, height) {
  gradientFill(context, width, height, ["#1b1745", "#a43c83", "#f17a78"]);
  lightBeam(context, width, height, 0.05);
  speckles(context, width, height, 10, 90);
  const halo = context.createRadialGradient(width * 0.4, height * 0.4, 0, width * 0.4, height * 0.4, width * 0.4);
  halo.addColorStop(0, "#ff9fc055");
  halo.addColorStop(1, "#ff9fc000");
  context.fillStyle = halo;
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#171426";
  context.beginPath();
  context.ellipse(width * 0.49, height * 0.37, width * 0.15, height * 0.14, -0.1, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.moveTo(width * 0.39, height * 0.47);
  context.bezierCurveTo(width * 0.25, height * 0.56, width * 0.2, height * 0.78, width * 0.17, height);
  context.lineTo(width * 0.86, height);
  context.bezierCurveTo(width * 0.76, height * 0.65, width * 0.63, height * 0.49, width * 0.56, height * 0.47);
  context.fill();
  context.strokeStyle = "#ff8dbe";
  context.lineWidth = width * 0.012;
  context.shadowColor = "#ff5fac";
  context.shadowBlur = width * 0.04;
  context.beginPath();
  context.arc(width * 0.48, height * 0.39, width * 0.16, Math.PI * 0.65, Math.PI * 1.55);
  context.stroke();
}

function cityScene(context, width, height) {
  gradientFill(context, width, height, ["#111843", "#594080", "#eb6579"]);
  lightBeam(context, width, height, 0.35);
  speckles(context, width, height, 160, 70);
  const colors = ["#373052", "#211d3a", "#101321"];
  colors.forEach((color, layer) => {
    context.fillStyle = color;
    const baseline = height * (0.72 + layer * 0.07);
    for (let building = 0; building < 12; building += 1) {
      const unit = width / 11;
      const top = baseline - height * (0.12 + randomAt(building + layer * 30) * 0.28);
      context.fillRect(building * unit - layer * 12, top, unit * 0.68, height - top);
    }
  });
  context.fillStyle = "#090d18";
  context.fillRect(0, height * 0.82, width, height * 0.18);
  context.beginPath();
  context.moveTo(width * 0.12, height * 0.88);
  context.bezierCurveTo(width * 0.28, height * 0.72, width * 0.66, height * 0.73, width * 0.87, height * 0.88);
  context.lineTo(width * 0.78, height * 0.95);
  context.lineTo(width * 0.2, height * 0.95);
  context.fill();
  context.fillStyle = "#f24d9d";
  context.fillRect(width * 0.2, height * 0.84, width * 0.16, height * 0.018);
  context.fillStyle = "#5ee4e9";
  context.fillRect(width * 0.69, height * 0.845, width * 0.12, height * 0.015);
}

function drawPalm(context, width, height, x, size, lean) {
  context.save();
  context.translate(width * x, height * 1.05);
  context.rotate(lean);
  context.strokeStyle = "#111224";
  context.lineWidth = width * 0.035 * size;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(0, 0);
  context.bezierCurveTo(width * 0.03, -height * 0.22, -width * 0.03, -height * 0.5, width * 0.04, -height * 0.68);
  context.stroke();
  context.translate(width * 0.04, -height * 0.68);
  context.fillStyle = "#101123";
  for (let leaf = 0; leaf < 9; leaf += 1) {
    context.save();
    context.rotate(-Math.PI * 0.9 + leaf * Math.PI * 0.22);
    context.beginPath();
    context.moveTo(0, 0);
    context.quadraticCurveTo(width * 0.18 * size, -height * 0.03, width * 0.31 * size, height * 0.04);
    context.quadraticCurveTo(width * 0.17 * size, height * 0.06, 0, 0);
    context.fill();
    context.restore();
  }
  context.restore();
}

function palmScene(context, width, height) {
  gradientFill(context, width, height, ["#41205f", "#c33f77", "#ffae67"]);
  lightBeam(context, width, height, 0.02);
  speckles(context, width, height, 330, 50);
  const sun = context.createRadialGradient(width * 0.72, height * 0.3, 1, width * 0.72, height * 0.3, width * 0.2);
  sun.addColorStop(0, "#fff5bd");
  sun.addColorStop(0.5, "#ffc36e");
  sun.addColorStop(1, "#ff956d00");
  context.fillStyle = sun;
  context.fillRect(width * 0.45, height * 0.03, width * 0.55, height * 0.55);
  drawPalm(context, width, height, 0.2, 1, -0.08);
  drawPalm(context, width, height, 0.54, 0.7, 0.12);
  context.fillStyle = "#0b0f1e";
  context.beginPath();
  context.moveTo(0, height * 0.86);
  context.quadraticCurveTo(width * 0.45, height * 0.8, width, height * 0.86);
  context.lineTo(width, height);
  context.lineTo(0, height);
  context.fill();
}

const samples = [portraitScene, cityScene, palmScene];

function paintImage(context, rect, panel) {
  clipped(context, rect, (width, height) => {
    if (!panel.image) {
      samples[panel.sample](context, width, height);
      return;
    }
    const image = panel.image;
    const coverScale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * panel.zoom;
    const drawWidth = image.naturalWidth * coverScale;
    const drawHeight = image.naturalHeight * coverScale;
    context.drawImage(image, (width - drawWidth) / 2 + panel.x * width, (height - drawHeight) / 2 + panel.y * height, drawWidth, drawHeight);
  });
}

function colorGrade(context, width, height) {
  const colors = grades[model.grade];
  const overlay = context.createLinearGradient(0, 0, width, height);
  overlay.addColorStop(0, colors[0] + "55");
  overlay.addColorStop(0.55, colors[1] + "26");
  overlay.addColorStop(1, colors[2] + "3d");
  context.save();
  context.globalCompositeOperation = "color";
  context.fillStyle = overlay;
  context.fillRect(0, 0, width, height);
  context.restore();
  const bloom = context.createRadialGradient(width * 0.72, height * 0.25, 0, width * 0.72, height * 0.25, width * 0.55);
  bloom.addColorStop(0, `rgba(255,173,198,${model.bloom / 400})`);
  bloom.addColorStop(1, "rgba(255,173,198,0)");
  context.fillStyle = bloom;
  context.fillRect(0, 0, width, height);
}

function spacedText(context, text, x, y, spacing) {
  let cursor = x;
  for (const character of text) {
    context.fillText(character, cursor, y);
    cursor += context.measureText(character).width + spacing;
  }
}

function titleBlock(context, width, height) {
  const base = Math.min(width, height);
  const left = width * 0.065;
  context.fillStyle = "#fff";
  context.font = `800 ${base * 0.018}px Arial`;
  spacedText(context, model.words.eyebrow.toUpperCase(), left, height * 0.78, base * 0.008);
  let titleSize = base * 0.092;
  context.font = `900 ${titleSize}px Arial`;
  while (context.measureText(model.words.title).width > width * 0.88 && titleSize > 20) {
    titleSize -= 2;
    context.font = `900 ${titleSize}px Arial`;
  }
  context.shadowColor = "#d52e7d";
  context.shadowBlur = base * 0.009;
  context.lineWidth = base * 0.003;
  context.strokeStyle = "#d52e7d";
  context.strokeText(model.words.title.toUpperCase(), left, height * 0.885);
  context.fillText(model.words.title.toUpperCase(), left, height * 0.885);
  context.shadowBlur = 0;
  context.fillStyle = "#ffb066";
  context.fillRect(left, height * 0.91, width * 0.25, Math.max(2, height * 0.002));
  context.fillStyle = "#ffffff66";
  context.fillRect(left, height * 0.935, width * 0.87, 1);
  context.fillStyle = "#fff";
  context.font = `700 ${base * 0.011}px Arial`;
  const creditWidth = context.measureText(model.words.credit).width;
  context.fillText(model.words.credit.toUpperCase(), width - left - creditWidth, height * 0.966);
}

function grain(context, width, height) {
  const dots = Math.round(model.grain * width * height / 1800);
  context.save();
  context.fillStyle = "#fff";
  for (let index = 0; index < dots; index += 1) {
    context.globalAlpha = randomAt(index + 700) * 0.12;
    context.fillRect(randomAt(index * 2 + 800) * width, randomAt(index * 2 + 801) * height, 1, 1);
  }
  context.restore();
}

function render(context, width, height) {
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#211429";
  context.fillRect(0, 0, width, height);
  panelRects(width, height).forEach((rect, index) => paintImage(context, rect, model.panels[index]));
  colorGrade(context, width, height);
  const shade = context.createLinearGradient(0, height * 0.55, 0, height);
  shade.addColorStop(0, "#100b1700");
  shade.addColorStop(1, "#09070ee8");
  context.fillStyle = shade;
  context.fillRect(0, height * 0.5, width, height * 0.5);
  titleBlock(context, width, height);
  grain(context, width, height);
  context.strokeStyle = "#ffffff99";
  context.lineWidth = Math.max(1, width * 0.002);
  context.strokeRect(width * 0.025, height * 0.02, width * 0.95, height * 0.96);
}

function redraw() {
  canvas.width = model.width;
  canvas.height = model.height;
  const bay = one("#canvasBay");
  const fit = Math.min((bay.clientWidth - 44) / model.width, (bay.clientHeight - 44) / model.height) * model.previewScale;
  canvas.style.width = `${Math.round(model.width * fit)}px`;
  canvas.style.height = `${Math.round(model.height * fit)}px`;
  render(screen, model.width, model.height);
}

function makeLayoutControls() {
  const root = one("#layoutGrid");
  root.innerHTML = Object.entries(layouts).map(([key, item]) => `<button class="layout-choice ${key === model.layout ? "active" : ""}" data-layout="${key}"><span class="diagram ${key}">${"<i></i>".repeat(item.count)}</span><strong>${item.label}</strong><small>${item.note}</small></button>`).join("");
}

function makeGradeControls() {
  one("#gradeGrid").innerHTML = Object.entries(grades).map(([name, colors]) => `<button class="grade-choice ${name === model.grade ? "active" : ""}" data-grade="${name}" style="--colors:linear-gradient(135deg,${colors.join(",")})">${name}</button>`).join("");
}

function makePanelControls() {
  const count = layouts[model.layout].count;
  one("#panelCount").textContent = `${count} / ${count}`;
  one("#panelList").innerHTML = model.panels.slice(0, count).map((panel, index) => `<div class="panel-card ${index === model.active ? "active" : ""}" data-panel="${index}"><span class="swatch"></span><span><strong>PANEL 0${index + 1}</strong><small>${panel.name}</small></span><button data-reset="${index}" title="Reset image">↺</button></div>`).join("");
  one("#photoList").innerHTML = model.panels.filter((panel) => panel.image).map((panel, index) => `<div class="photo-card"><span class="swatch"></span><span><strong>PHOTO 0${index + 1}</strong><small>${panel.name}</small></span></div>`).join("") || '<p class="copy">Your imported photos will appear here.</p>';
}

function switchView(name) {
  all(".tool").forEach((button) => button.classList.toggle("selected", button.dataset.view === name));
  all(".view").forEach((panel) => panel.classList.toggle("visible", panel.dataset.viewPanel === name));
}

function chooseLayout(name) {
  model.layout = name;
  model.active = Math.min(model.active, layouts[name].count - 1);
  makeLayoutControls();
  makePanelControls();
  redraw();
}

function chooseGrade(name) {
  model.grade = name;
  makeGradeControls();
  redraw();
}

function loadPhotos(fileList) {
  Array.from(fileList).slice(0, 3).forEach((file, index) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const image = new Image();
      image.addEventListener("load", () => {
        Object.assign(model.panels[index], { image, name: file.name, x: 0, y: 0, zoom: 1 });
        makePanelControls();
        redraw();
      });
      image.src = reader.result;
    });
    reader.readAsDataURL(file);
  });
}

function exportPng(showOnly = false) {
  const output = document.createElement("canvas");
  output.width = model.width;
  output.height = model.height;
  render(output.getContext("2d"), output.width, output.height);
  const data = output.toDataURL("image/png");
  one("#exportImage").src = data;
  one("#exportDimensions").textContent = `${model.width} × ${model.height}`;
  one("#exportPreview").classList.add("open");
  one("#exportPreview").setAttribute("aria-hidden", "false");
  if (!showOnly) {
    const link = document.createElement("a");
    link.download = `vanta-cover-${model.width}x${model.height}.png`;
    link.href = data;
    link.click();
    one("#notice").classList.add("show");
    window.setTimeout(() => one("#notice").classList.remove("show"), 1800);
  }
}

function canvasPoint(event) {
  const box = canvas.getBoundingClientRect();
  return { x: (event.clientX - box.left) * model.width / box.width, y: (event.clientY - box.top) * model.height / box.height };
}

function panelAt(point) {
  return panelRects(model.width, model.height).findIndex((rect) => point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h);
}

function bindCanvas() {
  canvas.addEventListener("pointerdown", (event) => {
    const point = canvasPoint(event);
    const index = panelAt(point);
    if (index < 0) return;
    model.active = index;
    model.pointer = { x: event.clientX, y: event.clientY, panX: model.panels[index].x, panY: model.panels[index].y };
    canvas.setPointerCapture(event.pointerId);
    makePanelControls();
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!model.pointer) return;
    const panel = model.panels[model.active];
    panel.x = model.pointer.panX + (event.clientX - model.pointer.x) / canvas.clientWidth;
    panel.y = model.pointer.panY + (event.clientY - model.pointer.y) / canvas.clientHeight;
    redraw();
  });
  canvas.addEventListener("pointerup", () => { model.pointer = null; });
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    const panel = model.panels[model.active];
    panel.zoom = Math.min(4, Math.max(1, panel.zoom * (event.deltaY < 0 ? 1.08 : 0.92)));
    redraw();
  }, { passive: false });
  canvas.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const step = event.shiftKey ? 0.025 : 0.006;
    const panel = model.panels[model.active];
    if (event.key === "ArrowLeft") panel.x -= step;
    if (event.key === "ArrowRight") panel.x += step;
    if (event.key === "ArrowUp") panel.y -= step;
    if (event.key === "ArrowDown") panel.y += step;
    redraw();
  });
}

function bindInterface() {
  document.addEventListener("click", (event) => {
    const tool = event.target.closest("[data-view]");
    const layout = event.target.closest("[data-layout]");
    const grade = event.target.closest("[data-grade]");
    const panel = event.target.closest("[data-panel]");
    const reset = event.target.closest("[data-reset]");
    if (tool) switchView(tool.dataset.view);
    if (layout) chooseLayout(layout.dataset.layout);
    if (grade) chooseGrade(grade.dataset.grade);
    if (panel) { model.active = Number(panel.dataset.panel); makePanelControls(); }
    if (reset) {
      const item = model.panels[Number(reset.dataset.reset)];
      Object.assign(item, { image: null, name: "Built-in sample image", x: 0, y: 0, zoom: 1 });
      makePanelControls();
      redraw();
    }
  });
  all(".image-input").forEach((input) => input.addEventListener("change", () => loadPhotos(input.files)));
  [["eyebrowInput", "eyebrow"], ["titleInput", "title"], ["creditInput", "credit"]].forEach(([id, key]) => one(`#${id}`).addEventListener("input", (event) => { model.words[key] = event.target.value; redraw(); }));
  [["bloomInput", "bloom", "bloomValue"], ["grainInput", "grain", "grainValue"]].forEach(([id, key, output]) => one(`#${id}`).addEventListener("input", (event) => { model[key] = Number(event.target.value); one(`#${output}`).value = event.target.value; redraw(); }));
  all(".size-option").forEach((button) => button.addEventListener("click", () => {
    model.width = Number(button.dataset.width);
    model.height = Number(button.dataset.height);
    all(".size-option").forEach((item) => item.classList.toggle("active", item === button));
    one("#pixelLabel").textContent = `${model.width} × ${model.height}`;
    redraw();
  }));
  one("#previewSmaller").addEventListener("click", () => changePreview(-0.1));
  one("#previewLarger").addEventListener("click", () => changePreview(0.1));
  one("#exportButton").addEventListener("click", () => exportPng());
  one("#closePreview").addEventListener("click", () => { one("#exportPreview").classList.remove("open"); one("#exportPreview").setAttribute("aria-hidden", "true"); });
}

function changePreview(delta) {
  model.previewScale = Math.min(1.2, Math.max(0.7, model.previewScale + delta));
  one("#previewPercent").textContent = `${Math.round(model.previewScale * 100)}%`;
  redraw();
}

function start() {
  makeLayoutControls();
  makeGradeControls();
  makePanelControls();
  bindInterface();
  bindCanvas();
  window.addEventListener("resize", redraw);
  redraw();
  if (location.hash === "#grade") switchView("grade");
  if (location.hash === "#export") exportPng(true);
}

start();
