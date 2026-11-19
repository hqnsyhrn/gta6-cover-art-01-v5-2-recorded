// Neon Coast 9-Panel Cover Studio — editor wiring: state, undo/redo, uploads, export, ?shot= scenes.
import { drawCover, layoutPanels, LAYOUTS, GRADES, SIZES } from './cover.js';
import { PRESETS, applyPreset } from './presets.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const SAMPLES = ['car-palms', 'woman-car', 'man-rooftop', 'friends-neon', 'man-pier', 'skyline-dusk', 'pier', 'boulevard', 'harbour-night', 'beach-tower', 'diner-neon', 'motel-dusk', 'hero-woman-car', 'hero-woman-neon', 'hero-woman-heist', 'duo-convertible', 'duo-hood', 'marina-sunset', 'street-sunset', 'convertible-sunset'];

const state = {
  layout: 'collage9', grade: 'inkStrong', ink: 0.8, title: 'SUNSET DUO', subtitle: 'welcome to Leonida',
  tagline: 'TWO OUTLAWS. ONE SUNSET.',
  stars: '★★★★★', grain: true, vignette: true, size: 'square',
  captions: [], showCaptions: true,
  quote: '“NEON, SUN AND ONE LAST SCORE” — THE LEONIDA LEDGER',
  credit: 'TWO OUTLAWS · ONE COAST · ALL ORIGINAL ART — NEON COAST PRESS',
  volume: 'VOL. 01', ribbon: "COLLECTOR'S EDITION", hud: 'WANTED ★★★★★',
  panels: Array.from({ length: 9 }, () => ({ img: null, photo: null, zoom: 1, ox: 0, oy: 0 })),
};
let selectedPanel = 0;
let pendingPhoto = null; // sample id tapped while no panel was armed
const library = {}; // photo id -> Image
let undoStack = [], redoStack = [];

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadLibrary() {
  for (const id of SAMPLES) {
    try { library[id] = await loadImage(`samples/${id}.jpg`); } catch { /* sample missing: skip */ }
  }
}

function snapshot() {
  return JSON.stringify({ ...state, panels: state.panels.map((p) => ({ photo: p.photo, zoom: p.zoom, ox: p.ox, oy: p.oy })) });
}
function pushUndo() { undoStack.push(snapshot()); if (undoStack.length > 40) undoStack.shift(); redoStack = []; }
function restore(json) {
  const s = JSON.parse(json);
  Object.assign(state, s);
  state.panels = s.panels.map((p) => ({ ...p, img: p.photo ? library[p.photo] ?? null : null }));
  syncControls();
  redraw();
}
function undo() { if (!undoStack.length) return; redoStack.push(snapshot()); restore(undoStack.pop()); }
function redo() { if (!redoStack.length) return; undoStack.push(snapshot()); restore(redoStack.pop()); }

function redraw() {
  drawCover(canvas, state);
  document.getElementById('panelLabel').textContent = `Panel ${selectedPanel + 1} of 9`;
  renderSlots();
}

function renderSlots() {
  const el = document.getElementById('slots');
  el.innerHTML = '';
  state.panels.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = i === selectedPanel ? 'sel' : '';
    b.title = `Panel ${i + 1}`;
    if (p.img) {
      const im = document.createElement('img');
      im.src = p.img.src;
      im.alt = `Panel ${i + 1}`;
      b.appendChild(im);
    } else b.textContent = `${i + 1}`;
    b.addEventListener('click', () => {
      selectedPanel = i;
      if (pendingPhoto) { placePhoto(pendingPhoto); pendingPhoto = null; }
      syncControls();
      redraw();
    });
    el.appendChild(b);
  });
}

function placePhoto(id) {
  pushUndo();
  const p = state.panels[selectedPanel];
  p.photo = id;
  p.img = library[id] ?? null;
  redraw();
}

function buildChips(el, items, current, onPick) {
  el.innerHTML = '';
  for (const [key, label] of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    if (key === current) b.classList.add('active');
    b.addEventListener('click', () => { pushUndo(); onPick(key); buildChips(el, items, key, onPick); redraw(); });
    el.appendChild(b);
  }
}

function syncControls() {
  const p = state.panels[selectedPanel];
  document.getElementById('zoom').value = p.zoom;
  document.getElementById('offX').value = p.ox;
  document.getElementById('offY').value = p.oy;
  const cap = state.captions[selectedPanel] || {};
  document.getElementById('capPlace').value = cap.place || '';
  document.getElementById('capTime').value = cap.time || '';
  document.getElementById('capHook').value = cap.hook || '';
  document.getElementById('showCaptions').checked = state.showCaptions !== false;
  document.getElementById('title').value = state.title;
  document.getElementById('subtitle').value = state.subtitle;
  document.getElementById('tagline').value = state.tagline;
  document.getElementById('quote').value = state.quote || '';
  document.getElementById('credit').value = state.credit || '';
  document.getElementById('volume').value = state.volume || '';
  document.getElementById('ribbon').value = state.ribbon || '';
  document.getElementById('hud').value = state.hud || '';
  document.getElementById('stars').value = state.stars;
  document.getElementById('grain').checked = state.grain;
  document.getElementById('vignette').checked = state.vignette;
  document.getElementById('ink').value = state.ink ?? 0.8;
  buildChips(document.getElementById('layouts'), Object.entries(LAYOUTS).map(([k, v]) => [k, v.name]), state.layout, (k) => { state.layout = k; });
  buildChips(document.getElementById('grades'), Object.entries(GRADES).map(([k, v]) => [k, v.name]), state.grade, (k) => { state.grade = k; });
  buildChips(document.getElementById('sizes'), Object.entries(SIZES).map(([k, v]) => [k, v.name]), state.size, (k) => { state.size = k; applySize(); });
}

function applySize() {
  const s = SIZES[state.size];
  canvas.width = s.w;
  canvas.height = s.h;
  redraw();
}

function renderSamples() {
  const el = document.getElementById('samples');
  el.innerHTML = '';
  for (const id of SAMPLES) {
    if (!library[id]) continue;
    const im = document.createElement('img');
    im.src = library[id].src;
    im.alt = id;
    im.title = id;
    im.addEventListener('click', () => {
      el.querySelectorAll('img').forEach((x) => x.classList.remove('sel'));
      im.classList.add('sel');
      placePhoto(id);
      status.textContent = `${id} → panel ${selectedPanel + 1}`;
    });
    el.appendChild(im);
  }
}

function renderPresets() {
  const el = document.getElementById('presets');
  if (!el) return;
  el.innerHTML = '';
  for (const [key, p] of Object.entries(PRESETS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = p.label;
    b.addEventListener('click', () => {
      pushUndo();
      applyPreset(state, library, key);
      syncControls();
      redraw();
      status.textContent = `Preset “${p.label}” applied — a finished poster in one tap.`;
    });
    el.appendChild(b);
  }
}

function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function exportSize(key) {
  const s = SIZES[key];
  const off = document.createElement('canvas');
  off.width = s.w;
  off.height = s.h;
  drawCover(off, state);
  off.toBlob((blob) => {
    if (!blob) return;
    download(blob, `neon-coast-cover-${s.w}x${s.h}.png`);
    status.textContent = `Saved neon-coast-cover-${s.w}x${s.h}.png`;
  }, 'image/png');
}

// ---- events ----
document.getElementById('undo').addEventListener('click', undo);
document.getElementById('redo').addEventListener('click', redo);
document.getElementById('shuffle').addEventListener('click', () => {
  pushUndo();
  const ids = Object.keys(library);
  state.panels.forEach((p) => { p.photo = ids[Math.floor(Math.random() * ids.length)]; p.img = library[p.photo]; });
  const grades = Object.keys(GRADES);
  state.grade = grades[Math.floor(Math.random() * grades.length)];
  syncControls();
  redraw();
  status.textContent = 'Shuffled photos and grade — tap Export when you like it.';
});
document.getElementById('fillAll').addEventListener('click', () => {
  const p = state.panels[selectedPanel];
  if (!p.photo) { status.textContent = 'Tap a sample into a panel first.'; return; }
  pushUndo();
  state.panels.forEach((q) => { q.photo = p.photo; q.img = p.img; });
  redraw();
  status.textContent = `All 9 panels now use ${p.photo}.`;
});
document.getElementById('upload').addEventListener('change', async (e) => {
  for (const file of e.target.files) {
    const id = `up-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    library[id] = await loadImage(URL.createObjectURL(file));
    SAMPLES.push(id);
    placePhoto(id);
  }
  renderSamples();
  status.textContent = `${e.target.files.length} photo(s) added.`;
  e.target.value = '';
});
for (const [id, key] of [['zoom', 'zoom'], ['offX', 'ox'], ['offY', 'oy']]) {
  document.getElementById(id).addEventListener('input', (e) => {
    state.panels[selectedPanel][key] = Number(e.target.value);
    redraw();
  });
  document.getElementById(id).addEventListener('change', () => pushUndo());
}
document.getElementById('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
document.getElementById('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
document.getElementById('tagline').addEventListener('input', (e) => { state.tagline = e.target.value; redraw(); });
document.getElementById('quote').addEventListener('input', (e) => { state.quote = e.target.value; redraw(); });
document.getElementById('credit').addEventListener('input', (e) => { state.credit = e.target.value; redraw(); });
document.getElementById('volume').addEventListener('input', (e) => { state.volume = e.target.value; redraw(); });
document.getElementById('ribbon').addEventListener('input', (e) => { state.ribbon = e.target.value; redraw(); });
document.getElementById('hud').addEventListener('input', (e) => { state.hud = e.target.value; redraw(); });
document.getElementById('showCaptions').addEventListener('change', (e) => { pushUndo(); state.showCaptions = e.target.checked; redraw(); });
function editCaption(field, value) {
  const cap = state.captions[selectedPanel] || (state.captions[selectedPanel] = { place: '', time: '', hook: '' });
  cap[field] = value;
  redraw();
}
document.getElementById('capPlace').addEventListener('input', (e) => editCaption('place', e.target.value));
document.getElementById('capTime').addEventListener('input', (e) => editCaption('time', e.target.value));
document.getElementById('capHook').addEventListener('input', (e) => editCaption('hook', e.target.value));
document.getElementById('stars').addEventListener('change', (e) => { state.stars = e.target.value; redraw(); });
document.getElementById('grain').addEventListener('change', (e) => { state.grain = e.target.checked; redraw(); });
document.getElementById('vignette').addEventListener('change', (e) => { state.vignette = e.target.checked; redraw(); });
document.getElementById('ink').addEventListener('input', (e) => { state.ink = Number(e.target.value); redraw(); });
document.getElementById('ink').addEventListener('change', () => pushUndo());
document.getElementById('export').addEventListener('click', () => exportSize(state.size));
document.getElementById('exportAll').addEventListener('click', () => {
  Object.keys(SIZES).forEach((k, i) => setTimeout(() => exportSize(k), i * 400));
  status.textContent = 'Exporting all 4 sizes…';
});
canvas.addEventListener('click', (e) => {
  const r = canvas.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * canvas.width;
  const y = ((e.clientY - r.top) / r.height) * canvas.height;
  const rects = layoutPanels(canvas.width, canvas.height, state.layout);
  const hit = rects.findIndex((rc) => x >= rc.x && x <= rc.x + rc.w && y >= rc.y && y <= rc.y + rc.h);
  if (hit >= 0 && hit < 9) { selectedPanel = hit; syncControls(); redraw(); }
});

// ---- boot ----
const query = new URLSearchParams(location.search);
const shot = query.get('shot');
await document.fonts.ready;
await loadLibrary();
// Default cover: the Sunset Duo preset — 9-panel COLLAGE with the DUO in the
// center panel (largest) + Ink Strong grade + story captions + press quote.
// Two original protagonists, generated with an image model — NOT GTA
// characters. All 9 panels are golden-hour shots (coherence pass); the
// center panel is framed oy +0.28 so both faces stay in the wide-short panel.
applyPreset(state, library, 'sunset-duo');
renderSamples();
renderPresets();
syncControls();
if (shot) {
  await runShot(shot, query, { state, library, applySize, redraw, loadImage });
} else {
  redraw();
}
