// Neon Coast cover renderer: draws the multi-panel GTA-style cover onto any 2D canvas.
// Pure drawing — the same code renders the live preview, the PNG exports and the ?shot= scenes.
export const LAYOUTS = {
  posterHero: { name: 'Poster Hero', panels: 4 },
  collage9: { name: '9-Panel Collage', panels: 9 },
  grid9: { name: '9-Panel Grid', panels: 9 },
  hero8: { name: 'Hero + 8', panels: 9 },
  hero3: { name: 'Hero + 3', panels: 4 },
  fullbleed: { name: 'Full-Bleed', panels: 1 },
  poster: { name: 'Classic Poster', panels: 4 },
};

export const GRADES = {
  ink: { name: 'Poster Ink', filter: 'saturate(1.7) contrast(1.4) brightness(1.06)', top: 'rgba(255,60,120,0.10)', bottom: 'rgba(150,0,90,0.38)' },
  inkStrong: { name: 'Ink Strong', filter: 'saturate(1.9) contrast(1.6) brightness(1.05)', top: 'rgba(255,46,136,0.16)', bottom: 'rgba(150,0,90,0.46)' },
  sunset: { name: 'Sunset', filter: 'saturate(1.3) contrast(1.08) brightness(1.03)', top: 'rgba(255,140,60,0.10)', bottom: 'rgba(190,30,110,0.42)' },
  neon: { name: 'Neon Vice', filter: 'saturate(1.55) contrast(1.12) hue-rotate(-8deg)', top: 'rgba(0,229,255,0.12)', bottom: 'rgba(255,0,153,0.40)' },
  teal: { name: 'Teal Night', filter: 'saturate(1.15) contrast(1.1) brightness(0.96)', top: 'rgba(0,180,180,0.14)', bottom: 'rgba(4,20,60,0.50)' },
  heat: { name: 'Heat Wave', filter: 'saturate(1.45) contrast(1.1) sepia(0.25)', top: 'rgba(255,90,0,0.16)', bottom: 'rgba(160,0,0,0.45)' },
  gold: { name: 'Gold Hour', filter: 'saturate(1.35) contrast(1.05) sepia(0.35)', top: 'rgba(255,200,80,0.18)', bottom: 'rgba(120,60,0,0.42)' },
  noir: { name: 'Mono Noir', filter: 'grayscale(1) contrast(1.25) brightness(1.05)', top: 'rgba(255,255,255,0.06)', bottom: 'rgba(0,0,0,0.45)' },
};

export const SIZES = {
  square: { name: '1080 × 1080', w: 1080, h: 1080 },
  portrait: { name: '1080 × 1350', w: 1080, h: 1350 },
  wide: { name: '1920 × 1080', w: 1920, h: 1080 },
  story: { name: '1080 × 1920', w: 1080, h: 1920 },
};

/** Layouts whose title is drawn OVER the photo (poster look) instead of in a band below. */
export const OVERLAY_LAYOUTS = new Set(['posterHero', 'poster', 'fullbleed']);

/** Panel rectangles (fractions of w/h) for a layout. */
export function layoutPanels(w, h, layout) {
  const g = Math.max(4, w * 0.006); // gutter
  // collage9's title block is ~34% of the frame (giant gradient title + press
  // quote + bottom furniture row); other band layouts keep the 17% band.
  const band = layout === 'collage9' ? h * 0.34 : OVERLAY_LAYOUTS.has(layout) ? 0 : h * 0.17;
  const bodyH = h - band;
  switch (layout) {
    case 'collage9': {
      // 3x3 collage in the top ~66% of the frame; the CENTER column is wider
      // so the CENTER panel (index 4 — the duo) is the largest panel, the
      // literal structure of the official GTA VI cover. The bottom ~34% is
      // the giant title block (drawn by drawCollageTitle, not a photo panel).
      const innerW = w - g * 4, innerH = bodyH - g * 4;
      const colW = [innerW * 0.30, innerW * 0.40, innerW * 0.30];
      const colX = [g, g + colW[0] + g, g + colW[0] + g + colW[1] + g];
      const ch = innerH / 3, out = [];
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
        out.push({ x: colX[c], y: g + r * (ch + g), w: colW[c], h: ch, rot: 0 });
      return out;
    }
    case 'posterHero': {
      // One dominant hero photo + a strip of 3 distinct photos along the bottom.
      // The title is drawn OVER the hero (see drawOverlayTitle), so the whole
      // frame reads as a poster, not a grid.
      const stripH = h * 0.20, heroH = h - stripH;
      const cw = (w - g * 4) / 3, out = [{ x: 0, y: 0, w, h: heroH, rot: 0 }];
      for (let i = 0; i < 3; i++)
        out.push({ x: g + i * (cw + g), y: heroH + g, w: cw, h: stripH - g * 2, rot: 0 });
      return out;
    }
    case 'grid9': {
      const cw = (w - g * 4) / 3, ch = (bodyH - g * 4) / 3, out = [];
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
        out.push({ x: g + c * (cw + g), y: g + r * (ch + g), w: cw, h: ch, rot: 0 });
      return out;
    }
    case 'hero8': {
      const heroH = bodyH * 0.58, stripH = bodyH - heroH - g * 2;
      const cw = (w - g * 5) / 4, out = [{ x: g, y: g, w: w - g * 2, h: heroH - g, rot: 0 }];
      for (let i = 0; i < 8; i++) {
        const c = i % 4, r = Math.floor(i / 4);
        out.push({ x: g + c * (cw + g), y: heroH + g + r * (stripH / 2 + g / 2), w: cw, h: stripH / 2 - g / 2, rot: 0 });
      }
      return out;
    }
    case 'hero3': {
      const heroW = w * 0.62, sideW = w - heroW - g * 3, sh = (bodyH - g * 4) / 3;
      const out = [{ x: g, y: g, w: heroW - g, h: bodyH - g * 2, rot: 0 }];
      for (let i = 0; i < 3; i++) out.push({ x: heroW + g, y: g + i * (sh + g), w: sideW, h: sh, rot: 0 });
      return out;
    }
    case 'fullbleed':
      return [{ x: 0, y: 0, w, h: bodyH + band, rot: 0 }];
    case 'poster': {
      const heroH = bodyH * 0.55, stripH = bodyH - heroH - g * 3, cw = (w - g * 4) / 3;
      const out = [{ x: g, y: g, w: w - g * 2, h: heroH - g, rot: 0 }];
      for (let i = 0; i < 3; i++) out.push({ x: g + i * (cw + g), y: heroH + g, w: cw, h: stripH, rot: 0 });
      return out;
    }
    default:
      return layoutPanels(w, h, 'grid9');
  }
}

/** Draws one photo into a panel rect, cover-fit with the panel's zoom and offsets. */
export function drawPanelPhoto(ctx, img, rect, panel, grade) {
  if (!img) return;
  const { x, y, w, h, rot } = rect;
  ctx.save();
  if (rot) { ctx.translate(x + w / 2, y + h / 2); ctx.rotate((rot * Math.PI) / 180); ctx.translate(-w / 2, -h / 2); }
  else ctx.translate(x, y);
  if (rot) { // white snapshot border
    ctx.fillStyle = '#fdf8ef';
    ctx.fillRect(-w * 0.02, -h * 0.02, w * 1.04, h * 1.06);
  }
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.clip();
  const zoom = panel?.zoom ?? 1, ox = panel?.ox ?? 0, oy = panel?.oy ?? 0;
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const scale = Math.max(w / iw, h / ih) * zoom;
  const pw = iw * scale, ph = ih * scale;
  ctx.filter = grade?.filter ?? 'none';
  ctx.drawImage(img, (w - pw) / 2 + ox * w, (h - ph) / 2 + oy * h, pw, ph);
  ctx.filter = 'none';
  ctx.restore();
}

/** Halftone dot field used inside the title band. */
function drawHalftone(ctx, x, y, w, h, step) {
  ctx.save();
  for (let yy = y + step / 2; yy < y + h; yy += step) {
    for (let xx = x + step / 2; xx < x + w; xx += step) {
      const t = (yy - y) / h;
      const r = Math.max(0.6, step * 0.16 * (0.4 + t));
      ctx.fillStyle = ((xx / step + yy / step) % 2 === 0) ? 'rgba(255,94,58,0.5)' : 'rgba(0,229,255,0.45)';
      ctx.beginPath();
      ctx.arc(xx, yy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Halftone dot tiles, cached per step so every redraw stays cheap.
const inkTiles = {};
function inkTile(step, r, color) {
  const key = `${step}|${r}|${color}`;
  if (!inkTiles[key]) {
    const t = document.createElement('canvas');
    t.width = t.height = step;
    const c = t.getContext('2d');
    c.fillStyle = color;
    c.beginPath();
    c.arc(step / 2, step / 2, r, 0, Math.PI * 2);
    c.fill();
    inkTiles[key] = t;
  }
  return inkTiles[key];
}

/** Printed-poster halftone: two offset dot fields (dark multiply + magenta
 *  screen) over the whole frame. Strength 0..1 scales the alphas — the
 *  "Poster Ink" slider in the editor. Faces stay readable: the dots are
 *  small and the alphas low, so at 768px the cover reads as printed key art
 *  rather than a filtered photo. `strong` is the heavy printed-poster dose
 *  (bigger dots, higher alphas, magenta cast) — the Ink Strong grade. */
function drawPosterInk(ctx, w, h, strength, strong = false) {
  const step = Math.max(7, Math.round(w * (strong ? 0.009 : 0.007))); // ~9px at 1280w
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = (strong ? 0.34 : 0.22) * strength;
  ctx.fillStyle = ctx.createPattern(inkTile(step, step * (strong ? 0.30 : 0.24), '#1a0026'), 'repeat');
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = (strong ? 0.26 : 0.16) * strength;
  ctx.translate(step / 2, step / 2);
  ctx.fillStyle = ctx.createPattern(inkTile(step, step * (strong ? 0.26 : 0.20), '#ff2e88'), 'repeat');
  ctx.fillRect(-step / 2, -step / 2, w + step, h + step);
  ctx.restore();
  if (strong) {
    // Magenta cast wash: the printed-poster look of the heavy-ink covers.
    ctx.save();
    ctx.globalAlpha = 0.10 * strength;
    ctx.fillStyle = '#ff2e88';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

/** Starburst badge (12-point star, yellow, dark text). `text` is drawn on two lines. */
function drawStarburst(ctx, cx, cy, r, text) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.12);
  ctx.beginPath();
  const spikes = 12;
  for (let i = 0; i < spikes * 2; i++) {
    const rr = i % 2 === 0 ? r : r * 0.76;
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    if (i === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffd166';
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.06);
  ctx.strokeStyle = '#1a0026';
  ctx.stroke();
  ctx.fillStyle = '#1a0026';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const words = String(text || '').split(' ');
  const size = fitFont(ctx, words[0] || '', r * 1.0, r * 0.30, 'sans-serif', 'bold');
  ctx.fillText(words[0] || '', 0, -size * 0.55);
  ctx.fillText(words[1] || '', 0, size * 0.55);
  ctx.restore();
}

function fitFont(ctx, text, maxW, startSize, family, weight = '') {
  let size = startSize;
  ctx.font = `${weight ? `${weight} ` : ''}${size}px ${family}`;
  while (ctx.measureText(text).width > maxW && size > 10) {
    size -= 2;
    ctx.font = `${weight ? `${weight} ` : ''}${size}px ${family}`;
  }
  return size;
}

/** Rounded-rect path (manual — ctx.roundRect is not in every canvas build). */
function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Giant title block for the collage9 layout: deep magenta band across the
 *  bottom ~34% of the frame, huge pink→yellow gradient title with a dark
 *  outline, Pacifico subtitle, press quote + tagline right-aligned, and a
 *  bottom furniture row (COLLECTOR'S EDITION pill, credit line, NC seal,
 *  barcode) — the printed-matter furniture of the top covers. */
export function drawCollageTitle(ctx, w, h, state) {
  const bandH = h * 0.34, y = h - bandH;
  const bg = ctx.createLinearGradient(0, y, 0, h);
  bg.addColorStop(0, '#2a0a3d');
  bg.addColorStop(1, '#6d0f56');
  ctx.fillStyle = bg;
  ctx.fillRect(0, y, w, bandH);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(0, y, w, Math.max(3, h * 0.004));
  const title = (state.title || '').trim().toUpperCase();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  if (title) {
    const size = fitFont(ctx, title, w * 0.60, bandH * 0.50, "Anton, 'Arial Black', sans-serif");
    const ty = y + bandH * 0.34;
    const grad = ctx.createLinearGradient(0, ty - size * 0.5, 0, ty + size * 0.5);
    grad.addColorStop(0, '#ff2e88');
    grad.addColorStop(0.55, '#ff9a3d');
    grad.addColorStop(1, '#ffd166');
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(26,0,38,0.9)';
    ctx.lineWidth = Math.max(2, size * 0.07);
    ctx.strokeText(title, w * 0.03, ty);
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = size * 0.10;
    ctx.fillText(title, w * 0.03, ty);
    ctx.shadowBlur = 0;
  }
  const sub = (state.subtitle || '').trim();
  if (sub) {
    fitFont(ctx, sub, w * 0.55, bandH * 0.15, "Pacifico, cursive");
    ctx.fillStyle = '#ff8fd0';
    ctx.fillText(sub, w * 0.032, y + bandH * 0.70);
  }
  // Press quote, right-aligned above the tagline.
  const quote = (state.quote || '').trim();
  if (quote) {
    fitFont(ctx, quote, w * 0.42, bandH * 0.10, 'sans-serif', 'italic');
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffd9ec';
    ctx.fillText(quote, w * 0.97, y + bandH * 0.12);
  }
  const tag = (state.tagline || '').trim().toUpperCase();
  if (tag) {
    const words = tag.split(' ');
    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(' ');
    const line2 = words.slice(mid).join(' ');
    try { ctx.letterSpacing = `${Math.max(2, w * 0.003)}px`; } catch { /* older canvas: ignore */ }
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    fitFont(ctx, line1.length > line2.length ? line1 : line2, w * 0.32, bandH * 0.17, 'sans-serif', 'bold');
    ctx.fillText(line1, w * 0.97, y + bandH * 0.34);
    if (line2) ctx.fillText(line2, w * 0.97, y + bandH * 0.60);
    try { ctx.letterSpacing = '0px'; } catch { /* ignore */ }
  }
  // Bottom furniture row: COLLECTOR'S EDITION pill (left), credit line
  // (center, volume included), NC seal + barcode (right).
  const fy = y + bandH * 0.90;
  const ribbon = (state.ribbon || '').trim().toUpperCase();
  if (ribbon) {
    ctx.font = `bold ${Math.max(9, bandH * 0.055)}px sans-serif`;
    const rw = ctx.measureText(ribbon).width + Math.max(14, w * 0.016);
    const rh = Math.max(14, bandH * 0.10);
    ctx.fillStyle = 'rgba(255,209,102,0.14)';
    roundRect(ctx, w * 0.03, fy - rh / 2, rw, rh, rh / 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#ffd166';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ribbon, w * 0.03 + rw / 2, fy + 1);
  }
  const creditBits = [state.volume, state.credit].map((s) => (s || '').trim()).filter(Boolean);
  if (creditBits.length) {
    ctx.font = `${Math.max(9, bandH * 0.05)}px sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(creditBits.join(' · '), w * 0.5, fy);
  }
  drawSeal(ctx, w * 0.868, fy, Math.max(11, bandH * 0.085));
  drawBarcode(ctx, w * 0.888, y + bandH * 0.80, w * 0.082, bandH * 0.13);
  ctx.font = `${Math.max(7, bandH * 0.032)}px sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('8 901234 567890', w * 0.97, y + bandH * 0.965);
}

/** Per-panel story caption chip: place + time on line 1, story hook on
 *  line 2, bottom-left of the panel. Skipped on panels too small to read. */
function drawPanelCaption(ctx, rect, cap) {
  const { x, y, w, h } = rect;
  if (w < 140 || h < 70) return;
  const pad = Math.max(4, w * 0.012);
  const fs1 = Math.max(10, Math.min(15, w * 0.036));
  const fs2 = Math.max(9, Math.min(13, w * 0.030));
  const line1 = `${(cap.place || '').toUpperCase()} — ${cap.time || ''}`.trim();
  const line2 = (cap.hook || '').toUpperCase();
  ctx.font = `bold ${fs1}px sans-serif`;
  const w1 = ctx.measureText(line1).width;
  ctx.font = `${fs2}px sans-serif`;
  const w2 = line2 ? ctx.measureText(line2).width : 0;
  const cw = Math.min(Math.max(w1, w2) + pad * 2, w - 8);
  const ch = pad * 2 + fs1 + (line2 ? fs2 * 1.25 : 0) + 2;
  const cx = x + Math.max(4, w * 0.02), cy = y + h - ch - Math.max(4, h * 0.04);
  ctx.save();
  ctx.fillStyle = 'rgba(8,0,18,0.72)';
  roundRect(ctx, cx, cy, cw, ch, Math.max(3, pad * 0.6));
  ctx.fill();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffd166';
  ctx.font = `bold ${fs1}px sans-serif`;
  ctx.fillText(line1, cx + pad, cy + pad + fs1 * 0.5);
  if (line2) {
    ctx.fillStyle = '#ffffff';
    ctx.font = `${fs2}px sans-serif`;
    ctx.fillText(line2, cx + pad, cy + pad + fs1 + fs2 * 0.62);
  }
  ctx.restore();
}

/** Deterministic barcode bars (fixed seed — the same barcode every render). */
function drawBarcode(ctx, x, y, w, h) {
  let seed = 1234567;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  ctx.save();
  ctx.fillStyle = '#ffffff';
  let bx = x;
  while (bx < x + w) {
    const bw = 1 + Math.floor(rnd() * 3) * Math.max(1, w * 0.0015);
    const gap = rnd() < 0.5 ? Math.max(1, w * 0.004) : Math.max(2, w * 0.008);
    ctx.fillRect(bx, y, bw, h);
    bx += bw + gap;
  }
  ctx.restore();
}

/** Small gold-ringed "NC" seal mark. */
function drawSeal(ctx, cx, cy, r) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,209,102,0.16)';
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.strokeStyle = '#ffd166';
  ctx.stroke();
  ctx.fillStyle = '#ffd166';
  ctx.font = `bold ${r * 0.9}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('NC', cx, cy + 1);
  ctx.restore();
}

/** The full cover draw. `state` holds layout, grade key, title, subtitle, stars, grain, vignette and panels[]. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const grade = GRADES[state.grade] || GRADES.sunset;
  const rects = layoutPanels(w, h, state.layout);
  ctx.fillStyle = '#160a24';
  ctx.fillRect(0, 0, w, h);
  const n = LAYOUTS[state.layout]?.panels ?? 9;
  for (let i = 0; i < Math.min(n, rects.length); i++) {
    const p = state.panels[i];
    drawPanelPhoto(ctx, p?.img ?? null, rects[i], p, grade);
    if (!p?.img) { // empty panel placeholder
      ctx.fillStyle = '#2c1c40';
      ctx.fillRect(rects[i].x, rects[i].y, rects[i].w, rects[i].h);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = `${Math.max(14, w * 0.02)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`+ PHOTO ${i + 1}`, rects[i].x + rects[i].w / 2, rects[i].y + rects[i].h / 2);
    }
  }
  // Grade wash. For overlay layouts (poster hero / classic poster) the wash
  // covers only the HERO photo: the bottom strip keeps just a faint top tint
  // so every strip photo stays bright and readable at thumbnail size.
  // Other layouts keep the full-height wash.
  const overlayHero = OVERLAY_LAYOUTS.has(state.layout) && state.layout !== 'fullbleed';
  const heroBottomPx = state.layout === 'poster' ? h * 0.55 : h * 0.80;
  const wash = ctx.createLinearGradient(0, 0, 0, overlayHero ? heroBottomPx : h);
  wash.addColorStop(0, grade.top);
  wash.addColorStop(1, grade.bottom);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, overlayHero ? heroBottomPx : h);
  if (overlayHero) {
    ctx.fillStyle = grade.top; // faint tint only over the strip
    ctx.fillRect(0, heroBottomPx, w, h - heroBottomPx);
  }
  if (state.vignette) {
    const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(10,0,20,0.45)');
    ctx.fillStyle = v;
    ctx.save();
    if (overlayHero) { ctx.beginPath(); ctx.rect(0, 0, w, heroBottomPx); ctx.clip(); }
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
  if (state.grain) {
    ctx.save();
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    ctx.restore();
  }
  // Poster Ink: printed-poster halftone over the photos. The title block is
  // drawn after, so it stays clean. Ink Strong is the heavy printed-poster
  // dose (bigger dots, magenta cast).
  if (state.grade === 'ink') drawPosterInk(ctx, w, h, state.ink ?? 0.8, false);
  else if (state.grade === 'inkStrong') drawPosterInk(ctx, w, h, 0.6 + 0.4 * (state.ink ?? 0.8), true);
  // Per-panel story captions: place + time + hook on every panel, toggleable
  // with "Location tags". Overlay layouts skip panel 0 — the hero already
  // carries the poster title there.
  if (state.showCaptions !== false && state.captions) {
    for (let i = 0; i < Math.min(n, rects.length); i++) {
      if (OVERLAY_LAYOUTS.has(state.layout) && i === 0) continue;
      const cap = state.captions[i];
      if (cap) drawPanelCaption(ctx, rects[i], cap);
    }
  }
  if (state.layout === 'collage9') {
    // Starburst badge + WANTED hud pill over the photo grid.
    drawStarburst(ctx, w * 0.065, h * 0.075, Math.max(26, w * 0.045), 'SUMMER 2026');
    const hud = state.hud || 'WANTED ★★★★★';
    ctx.font = `bold ${Math.max(12, h * 0.02)}px sans-serif`;
    const hw = ctx.measureText(hud).width + Math.max(16, w * 0.02);
    const hh = Math.max(20, h * 0.036);
    ctx.fillStyle = 'rgba(8,0,18,0.78)';
    roundRect(ctx, w * 0.97 - hw, h * 0.028, hw, hh, hh / 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = Math.max(1.5, hh * 0.06);
    ctx.stroke();
    ctx.fillStyle = '#ffd166';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(hud, w * 0.97 - hw / 2, h * 0.028 + hh / 2 + 1);
    drawCollageTitle(ctx, w, h, state);
  } else if (OVERLAY_LAYOUTS.has(state.layout)) drawOverlayTitle(ctx, w, h, state);
  else drawTitleBand(ctx, w, h, state);
}

/** Poster title drawn OVER the hero photo: scrim, huge Anton title, Pacifico
 *  subtitle, tagline, heat stars and badge ribbon. This is the default look —
 *  at thumbnail size the cover must read as a movie poster, not a photo grid. */
export function drawOverlayTitle(ctx, w, h, state) {
  // Title sits over the HERO photo, above the bottom strip (posterHero: hero
  // ends at 0.80h; Classic Poster: hero ends at 0.55h). Never over the strip.
  const heroBottom = state.layout === 'poster' ? 0.55 : 0.80;
  // Scrim so white/yellow lettering reads over any photo. It ends right at
  // the hero's bottom edge so it never darkens the strip below.
  const scrim = ctx.createLinearGradient(0, h * (heroBottom - 0.38), 0, h * (heroBottom + 0.01));
  scrim.addColorStop(0, 'rgba(8,0,18,0)');
  scrim.addColorStop(0.55, 'rgba(8,0,18,0.45)');
  scrim.addColorStop(1, 'rgba(8,0,18,0.78)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, h * (heroBottom - 0.38), w, h * 0.39);
  // Heat stars + badge ribbon, top corners (clear of the title).
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.max(14, h * 0.022)}px sans-serif`;
  ctx.fillStyle = '#ffd166';
  ctx.fillText(state.stars || '★★★★★', w * 0.97, h * 0.045);
  ctx.save();
  ctx.translate(w * 0.11, h * 0.05);
  ctx.rotate(-0.05);
  ctx.fillStyle = '#ff5e3a';
  const bw = w * 0.2, bh = Math.max(18, h * 0.028);
  ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
  ctx.fillStyle = '#fff';
  fitFont(ctx, 'LEONIDA • 2026', bw * 0.88, Math.max(10, h * 0.016), 'sans-serif', 'bold');
  ctx.textAlign = 'center';
  ctx.fillText('LEONIDA • 2026', 0, 1);
  ctx.restore();
  // Huge title over the image.
  const title = (state.title || '').trim().toUpperCase();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  if (title) {
    const size = fitFont(ctx, title, w * 0.94, h * 0.115, "Anton, 'Arial Black', sans-serif");
    const grad = ctx.createLinearGradient(0, h * (heroBottom - 0.22), 0, h * (heroBottom - 0.08));
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.55, '#ffd166');
    grad.addColorStop(1, '#ff5e3a');
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = size * 0.14;
    ctx.shadowOffsetY = size * 0.03;
    ctx.fillText(title, w * 0.03, h * (heroBottom - 0.14));
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
  const sub = (state.subtitle || '').trim();
  if (sub) {
    fitFont(ctx, sub, w * 0.6, h * 0.028, "Pacifico, cursive");
    ctx.fillStyle = '#ff8fd0';
    ctx.fillText(sub, w * 0.032, h * (heroBottom - 0.065));
  }
  const tag = (state.tagline || '').trim().toUpperCase();
  if (tag) {
    try { ctx.letterSpacing = `${Math.max(2, w * 0.004)}px`; } catch { /* older canvas: ignore */ }
    fitFont(ctx, tag, w * 0.9, h * 0.02, 'sans-serif', 'bold');
    ctx.fillStyle = '#ffffff';
    ctx.fillText(tag, w * 0.032, h * (heroBottom - 0.01));
    try { ctx.letterSpacing = '0px'; } catch { /* ignore */ }
  }
}

/** Halftone title band with Anton title, Pacifico subtitle, heat stars and badge ribbon. */
export function drawTitleBand(ctx, w, h, state) {
  const bandH = h * 0.17, y = h - bandH;
  const bg = ctx.createLinearGradient(0, y, 0, h);
  bg.addColorStop(0, '#1c0b2e');
  bg.addColorStop(1, '#3d0f4d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, y, w, bandH);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(0, y, w, Math.max(3, h * 0.004));
  drawHalftone(ctx, w * 0.72, y + bandH * 0.12, w * 0.26, bandH * 0.76, Math.max(9, w * 0.012));
  const title = (state.title || '').trim().toUpperCase();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  if (title) {
    const size = fitFont(ctx, title, w * 0.68, bandH * 0.52, "Anton, 'Arial Black', sans-serif");
    const grad = ctx.createLinearGradient(0, y, 0, y + bandH);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.55, '#ffd166');
    grad.addColorStop(1, '#ff5e3a');
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = size * 0.12;
    ctx.fillText(title, w * 0.03, y + bandH * 0.38);
    ctx.shadowBlur = 0;
  }
  const sub = (state.subtitle || '').trim();
  if (sub) {
    fitFont(ctx, sub, w * 0.5, bandH * 0.22, "Pacifico, cursive");
    ctx.fillStyle = '#ff8fd0';
    ctx.fillText(sub, w * 0.032, y + bandH * 0.8);
  }
  // Heat meter + badge ribbon, right side.
  const stars = state.stars || '★★★★★';
  ctx.font = `${Math.max(12, bandH * 0.2)}px sans-serif`;
  ctx.fillStyle = '#ffd166';
  ctx.textAlign = 'right';
  ctx.fillText(stars, w * 0.97, y + bandH * 0.3);
  ctx.save();
  ctx.translate(w * 0.86, y + bandH * 0.72);
  ctx.rotate(-0.06);
  ctx.fillStyle = '#ff5e3a';
  const bw = w * 0.26, bh = bandH * 0.3;
  ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
  ctx.fillStyle = '#fff';
  fitFont(ctx, 'LEONIDA • 2026', bw * 0.88, Math.max(10, bandH * 0.16), 'sans-serif', 'bold');
  ctx.textAlign = 'center';
  ctx.fillText('LEONIDA • 2026', 0, 1);
  ctx.restore();
}
