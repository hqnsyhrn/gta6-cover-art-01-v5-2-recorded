// One-click poster presets: each is a DIFFERENT poster — its own person-led
// hero photo, its own title and its own tagline (not just a grade swap on the
// same poster). Every preset uses DISTINCT photos; strip photos are bright
// daylight/sunset shots so the strip reads at thumbnail size.
// Captions are ORIGINAL story lines written for this app (place + time +
// hook per panel) — the per-panel story-text layer of the top covers. The
// duo heroes are original fictional characters, NOT GTA characters.
// Shared by main.js (editor) and shots.js (?shot= scenes).
export const PRESETS = {
  'sunset-duo': {
    label: 'Sunset Duo', layout: 'collage9', grade: 'inkStrong',
    title: 'SUNSET DUO', subtitle: 'welcome to Leonida',
    tagline: 'TWO OUTLAWS. ONE SUNSET.',
    // 9-panel collage, row-major; index 4 is the CENTER panel (largest) =
    // the duo. All 9 panels are golden-hour shots — the top row is the
    // re-shot sunset versions of the same scenes (marina woman, art-deco
    // street + orange car, woman + red convertible), so the whole collage
    // shares one sunset light (coherence pass).
    photos: ['marina-sunset', 'street-sunset', 'convertible-sunset', 'man-rooftop', 'duo-convertible', 'woman-car', 'motel-dusk', 'duo-hood', 'hero-woman-heist'],
    // Per-panel framing: the duo photo is 3:2 with the faces in the upper
    // band, and the center panel is wide-short — oy +0.28 keeps both faces
    // in frame instead of cropping them off. Panels 0/2/8 are portrait-ish
    // faces in wide-short panels — a small positive oy shows the top of the
    // hair instead of cropping it at the panel edge.
    tune: [{ zoom: 1, ox: 0, oy: 0.18 }, null, { zoom: 1, ox: 0, oy: 0.15 }, null, { zoom: 1, ox: 0, oy: 0.28 }, null, null, null, { zoom: 1, ox: 0, oy: 0.10 }],
    captions: [
      { place: 'MARINA LIGHT', time: '6:05 PM', hook: 'LAST BOAT OUT' },
      { place: 'PALM ROW', time: '6:28 PM', hook: 'ENGINE RUNNING' },
      { place: 'COAST ROAD', time: '6:51 PM', hook: 'TOP DOWN, NO PLAN' },
      { place: 'ROOFTOP', time: '7:12 PM', hook: 'THE CITY BELOW' },
      { place: 'SUNSET DUO', time: '7:44 PM', hook: 'TWO OUTLAWS. ONE SUNSET.' },
      { place: 'SEASIDE WALK', time: '8:02 PM', hook: 'SALT IN THE AIR' },
      { place: 'MOTEL ROW', time: '8:26 PM', hook: 'VACANCY, ONE ROOM' },
      { place: 'BEACHFRONT', time: '8:47 PM', hook: 'LAUGHING AT NOTHING' },
      { place: 'SKYLINE', time: '9:15 PM', hook: 'LIGHTS COME ON' },
    ],
    quote: '“NEON, SUN AND ONE LAST SCORE” — THE LEONIDA LEDGER',
    credit: 'TWO OUTLAWS · ONE COAST · ALL ORIGINAL ART — NEON COAST PRESS',
    volume: 'VOL. 01',
    ribbon: "COLLECTOR'S EDITION",
    hud: 'WANTED ★★★★★',
  },
  'neon-harbour': {
    label: 'Neon Harbour', layout: 'posterHero', grade: 'neon',
    title: 'NEON HARBOUR', subtitle: 'welcome to Leonida',
    tagline: 'EVERY STREET HAS A STORY.',
    photos: ['hero-woman-neon', 'car-palms', 'beach-tower', 'skyline-dusk'],
    captions: [
      { place: 'NEON MARINA', time: '11:20 PM', hook: 'THE NIGHT SHIFT' },
      { place: 'PALM ROW', time: '6:28 PM', hook: 'ENGINE RUNNING' },
      { place: 'TOWER BEACH', time: '7:05 PM', hook: 'TIDE COMING IN' },
      { place: 'SKYLINE', time: '9:15 PM', hook: 'LIGHTS COME ON' },
    ],
  },
  'sunset-chase': {
    label: 'Sunset Chase', layout: 'posterHero', grade: 'sunset',
    title: 'SUNSET CHASE', subtitle: 'welcome to Leonida',
    tagline: 'EVERY SUNSET HAS A PRICE.',
    photos: ['hero-woman-car', 'beach-tower', 'skyline-dusk', 'man-pier'],
    captions: [
      { place: 'COAST ROAD', time: '6:51 PM', hook: 'TOP DOWN, NO PLAN' },
      { place: 'TOWER BEACH', time: '7:05 PM', hook: 'TIDE COMING IN' },
      { place: 'SKYLINE', time: '9:15 PM', hook: 'LIGHTS COME ON' },
      { place: 'OLD PIER', time: '5:40 AM', hook: 'FIRST CAST' },
    ],
  },
  'gold-hour': {
    label: 'Gold Hour', layout: 'poster', grade: 'gold',
    title: 'GOLD HOUR', subtitle: 'welcome to Leonida',
    tagline: 'ONE CITY. NO WAY OUT.',
    photos: ['hero-woman-heist', 'motel-dusk', 'beach-tower', 'car-palms'],
    captions: [
      { place: 'SKYLINE', time: '9:15 PM', hook: 'LIGHTS COME ON' },
      { place: 'MOTEL ROW', time: '8:26 PM', hook: 'VACANCY, ONE ROOM' },
      { place: 'TOWER BEACH', time: '7:05 PM', hook: 'TIDE COMING IN' },
      { place: 'PALM ROW', time: '6:28 PM', hook: 'ENGINE RUNNING' },
    ],
  },
  'vice-nights': {
    label: 'Vice Nights', layout: 'hero8', grade: 'teal',
    title: 'VICE NIGHTS', subtitle: 'welcome to Leonida',
    tagline: 'THE CITY NEVER SLEEPS.',
    photos: ['man-rooftop', 'hero-woman-neon', 'diner-neon', 'friends-neon', 'skyline-dusk', 'harbour-night', 'beach-tower', 'motel-dusk', 'car-palms'],
    captions: [
      { place: 'ROOFTOP', time: '7:12 PM', hook: 'THE CITY BELOW' },
      { place: 'NEON MARINA', time: '11:20 PM', hook: 'THE NIGHT SHIFT' },
      { place: 'DINER ROW', time: '10:40 PM', hook: 'COFFEE, NO SLEEP' },
      { place: 'NEON ROW', time: '11:02 PM', hook: 'FRIENDS OF THE NIGHT' },
      { place: 'SKYLINE', time: '9:15 PM', hook: 'LIGHTS COME ON' },
      { place: 'HARBOUR', time: '11:45 PM', hook: 'QUIET WATER' },
      { place: 'TOWER BEACH', time: '7:05 PM', hook: 'TIDE COMING IN' },
      { place: 'MOTEL ROW', time: '8:26 PM', hook: 'VACANCY, ONE ROOM' },
      { place: 'PALM ROW', time: '6:28 PM', hook: 'ENGINE RUNNING' },
    ],
  },
};

/** Apply a preset to editor state (layout/grade/lettering + distinct photos
 *  + captions + cover furniture). Fields a preset does not define are left
 *  as-is (e.g. the quote/furniture belong to the cover, not the preset). */
export function applyPreset(state, library, key) {
  const p = PRESETS[key];
  if (!p) return false;
  state.layout = p.layout;
  state.grade = p.grade;
  state.title = p.title;
  state.subtitle = p.subtitle;
  state.tagline = p.tagline;
  if (p.captions) state.captions = p.captions.map((c) => ({ ...c }));
  if (p.quote !== undefined) state.quote = p.quote;
  if (p.credit !== undefined) state.credit = p.credit;
  if (p.volume !== undefined) state.volume = p.volume;
  if (p.ribbon !== undefined) state.ribbon = p.ribbon;
  if (p.hud !== undefined) state.hud = p.hud;
  state.panels.forEach((panel, i) => {
    const id = p.photos[i % p.photos.length];
    panel.photo = id;
    panel.img = library[id] ?? null;
    const t = p.tune?.[i];
    panel.zoom = t?.zoom ?? 1;
    panel.ox = t?.ox ?? 0;
    panel.oy = t?.oy ?? 0;
  });
  return true;
}
