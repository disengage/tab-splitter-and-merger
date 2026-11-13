// Shared helpers for the promo canvases (cover_classic.html, cover_landing.html).
//
//   <i class="ic" data-icon="chrome"></i>   -> filled with the inline SVG below
//   <div class="stage">…</div>              -> 1280x800 design, scaled to fit the viewport
(() => {
  const stroke = (inner, width = 2) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  const solid = (inner, box = "0 0 24 24") => `<svg viewBox="${box}">${inner}</svg>`;

  // One third of the Chrome mark; the other two are this shape rotated 120° / 240°.
  const chromeBlade = "M5.54 12.03A22 22 0 0 1 43.6 14H24a10 10 0 0 0-8.66 15z";

  const ICONS = {
    /* ---- app + UI glyphs (stroke, inherit currentColor) ---- */
    grid: stroke(
      '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>' +
        '<rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
      2.2,
    ),
    globe: stroke(
      '<circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4.6" ry="10"/>' +
        '<path d="M2 12h20M12 2v20M3.6 7h16.8M3.6 17h16.8"/>',
      1.5,
    ),
    merge: stroke(
      '<path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.17 2.83L4 22"/><path d="m20 22-5-5"/>',
      2.2,
    ),
    split: stroke('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18"/>'),
    splitAll: stroke('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18M3 12h18"/>'),
    arrowUpRight: stroke('<path d="M6 18 18 6"/><path d="M8 6h10v10"/>', 2.6),
    star: stroke('<path d="m12 3.5 2.6 5.3 5.9.9-4.25 4.1 1 5.8L12 16.9l-5.25 2.7 1-5.8L3.5 9.7l5.9-.9z"/>', 1.8),
    dots: solid(
      '<g fill="currentColor"><circle cx="12" cy="5.5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="18.5" r="1.7"/></g>',
    ),
    back: stroke('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
    forward: stroke('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    reload: stroke('<path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v5h-5"/>'),
    lock: solid(
      '<g fill="currentColor"><rect x="5" y="10.5" width="14" height="10.5" rx="2"/></g>' +
        '<path d="M8.2 10.5V7.8a3.8 3.8 0 0 1 7.6 0v2.7" fill="none" stroke="currentColor" stroke-width="2"/>',
    ),
    close: stroke('<path d="M6 6l12 12M18 6 6 18"/>', 2.4),
    plus: stroke('<path d="M12 5v14M5 12h14"/>', 2.2),
    check: stroke('<path d="m6.5 12.5 3.6 3.6 7.4-8"/>', 2.8),
    person: solid(
      '<g fill="currentColor"><circle cx="12" cy="9" r="4.2"/><path d="M3.5 22a8.5 8.5 0 0 1 17 0z"/></g>',
    ),
    // Arrow pointer; fill / outline colours come from CSS (.cursor).
    cursor: solid('<path d="M4 2v17l4.5-4 3 6.5 2.7-1.2-2.9-6.3h6.2z" stroke-width="1.6" stroke-linejoin="round"/>'),
    // Click "sparks" radiating up and to the right.
    sparks: stroke('<path d="M5 9 3.5 3M11 11l5-6.5M14 16.5l6.5-1.5"/>', 2.4),

    /* ---- site marks (full colour) ---- */
    google: solid(
      '<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>' +
        '<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>' +
        '<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>' +
        '<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>',
      "0 0 48 48",
    ),
    chrome: solid(
      `<path fill="#EA4335" d="${chromeBlade}"/>` +
        `<path fill="#FBBC04" d="${chromeBlade}" transform="rotate(120 24 24)"/>` +
        `<path fill="#34A853" d="${chromeBlade}" transform="rotate(240 24 24)"/>` +
        '<circle cx="24" cy="24" r="10" fill="#fff"/><circle cx="24" cy="24" r="8" fill="#4285F4"/>',
      "0 0 48 48",
    ),
    youtube: solid(
      '<rect x="1" y="4.5" width="22" height="15" rx="4.5" fill="#ff0000"/><path d="M9.8 8.6v6.8l6-3.4z" fill="#fff"/>',
    ),
    facebook: solid(
      '<circle cx="12" cy="12" r="12" fill="#1877f2"/>' +
        '<path fill="#fff" d="M16.67 15.47 17.2 12h-3.33V9.75c0-.95.47-1.87 1.96-1.87h1.51V4.92s-1.37-.23-2.68-.23c-2.74 0-4.54 1.66-4.54 4.67V12H7.08v3.47h3.04v8.38a12.1 12.1 0 0 0 3.75 0v-8.38z"/>',
    ),
    amazon: solid(
      '<text x="12" y="14.6" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-weight="700" font-size="17" fill="#111">a</text>' +
        '<path d="M4 17.2c4.8 3 11 3 15.6.2" fill="none" stroke="#f90" stroke-width="1.8" stroke-linecap="round"/>' +
        '<path d="m17.4 15.6 2.9.9-1.2 2.7" fill="none" stroke="#f90" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    ),
    nblue: solid(
      '<rect width="24" height="24" rx="5" fill="#1f8fe5"/>' +
        '<path d="M6.5 17.5 9 6.5l6 10.5 2.5-10.5" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
    ),
    github: solid(
      '<circle cx="8" cy="8" r="8" fill="#fff"/>' +
        '<path fill="#181717" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>',
      "0 0 16 16",
    ),
    gmail: solid(
      '<path fill="#4285f4" d="M2 8.2V19h4V11.2z"/><path fill="#34a853" d="M22 8.2V19h-4v-7.8z"/>' +
        '<path fill="#ea4335" d="M6 11.2V6.4l6 4.5 6-4.5v4.8l-6 4.5z"/>' +
        '<path fill="#c5221f" d="M2 8.2V7a2 2 0 0 1 3.2-1.6L6 6.4v4.8z"/>' +
        '<path fill="#fbbc04" d="M22 8.2V7a2 2 0 0 0-3.2-1.6l-.8 1v4.8z"/>',
    ),
    notion: solid(
      '<rect x="2.5" y="2.5" width="19" height="19" rx="3.5" fill="#fff" stroke="#111" stroke-width="1.7"/>' +
        '<path d="M8.3 16.8V7.4l7.4 9.4V7.4" fill="none" stroke="#111" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>',
    ),
    twitter: solid(
      '<path fill="#1d9bf0" d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59z"/>',
    ),
  };

  document.querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML = ICONS[el.dataset.icon] || "";
  });

  // Scale the fixed 1280x800 stage to whatever viewport the page is opened / captured in.
  const stage = document.querySelector(".stage");
  if (stage) {
    const fit = () => {
      const scale = Math.min(innerWidth / stage.offsetWidth, innerHeight / stage.offsetHeight);
      stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
    };
    fit();
    addEventListener("resize", fit);
  }
})();
