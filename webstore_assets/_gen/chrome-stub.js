// Fake `chrome.*` API so the real popup.html + popup.js render with sample data.
// Query params:
//   ?data=cws|todo   which sample window set to show (default: cws)
(() => {
  const params = new URLSearchParams(location.search);
  const svg = (inner) =>
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${inner}</svg>`,
    );

  const FAVICONS = {
    cws: svg(
      '<defs><clipPath id="c"><rect x="2" y="3" width="20" height="18" rx="4"/></clipPath></defs>' +
        '<g clip-path="url(#c)">' +
        '<rect x="2" y="3" width="20" height="18" fill="#e8eaed"/>' +
        '<rect x="2" y="3" width="5" height="6" fill="#ea4335"/>' +
        '<rect x="7" y="3" width="5" height="6" fill="#fbbc04"/>' +
        '<rect x="12" y="3" width="5" height="6" fill="#34a853"/>' +
        '<rect x="17" y="3" width="5" height="6" fill="#4285f4"/>' +
        "</g>" +
        '<circle cx="12" cy="13.5" r="5" fill="#fff"/>' +
        '<circle cx="12" cy="13.5" r="3.2" fill="#4285f4"/>',
    ),
    youtube: svg(
      '<rect x="1" y="4.5" width="22" height="15" rx="4.5" fill="#ff0000"/>' +
        '<path d="M9.8 8.6v6.8l6-3.4z" fill="#fff"/>',
    ),
    facebook: svg(
      '<circle cx="12" cy="12" r="12" fill="#1877f2"/>' +
        '<path fill="#fff" d="M16.67 15.47 17.2 12h-3.33V9.75c0-.95.47-1.87 1.96-1.87h1.51V4.92s-1.37-.23-2.68-.23c-2.74 0-4.54 1.66-4.54 4.67V12H7.08v3.47h3.04v8.38a12.1 12.1 0 0 0 3.75 0v-8.38z"/>',
    ),
    todo: svg(
      '<path d="M12 1.8 20.8 6.9v10.2L12 22.2 3.2 17.1V6.9z" fill="#6d5ce8"/>' +
        '<path d="m8 12.2 2.8 2.8L16.2 9" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>',
    ),
  };

  const pages = (origin, count) =>
    Array.from({ length: count }, (_, i) => `${origin}/page-${i + 1}`);

  function buildWindow(id, active, otherUrls) {
    const tabs = [{ ...active, id: id * 100, windowId: id, active: true }];
    otherUrls.forEach((url, i) => {
      tabs.push({ id: id * 100 + i + 1, windowId: id, active: false, url, title: url });
    });
    return { id, incognito: false, focused: id === 1, tabs };
  }

  const youtube = (domainOrigin) =>
    buildWindow(
      2,
      { title: "(320) YouTube", url: "https://www.youtube.com/", favIconUrl: FAVICONS.youtube },
      pages(domainOrigin, 2),
    );
  const facebook = () =>
    buildWindow(
      3,
      { title: "Facebook", url: "https://www.facebook.com/", favIconUrl: FAVICONS.facebook },
      [],
    );

  // Each set: 14 tabs in the current window (5 on the active domain),
  // 3 tabs in window 2 (2 on the active domain), 1 tab in window 3.
  const DATASETS = {
    cws: () => {
      const origin = "https://chromewebstore.google.com";
      return [
        buildWindow(
          1,
          {
            title: "Tab Split & Merger - Chrome Web Store",
            url: `${origin}/detail/tab-mover-merger`,
            favIconUrl: FAVICONS.cws,
          },
          [...pages(origin, 4), ...pages("https://other.example", 9)],
        ),
        youtube(origin),
        facebook(),
      ];
    },
    todo: () => {
      const origin = "https://todo.example.com";
      return [
        buildWindow(
          1,
          {
            title: "TodoFlow – Productivity Dashboard",
            url: `${origin}/`,
            favIconUrl: FAVICONS.todo,
          },
          [...pages(origin, 4), ...pages("https://other.example", 9)],
        ),
        youtube(origin),
        facebook(),
      ];
    },
  };

  const windows = (DATASETS[params.get("data")] || DATASETS.cws)();
  const allTabs = windows.flatMap((w) => w.tabs);

  window.chrome = {
    tabs: {
      query: async (q = {}) =>
        q.active && q.currentWindow ? [windows[0].tabs[0]] : allTabs,
    },
    windows: {
      getAll: async () => windows,
      getCurrent: async () => windows[0],
      update: async () => {},
    },
    runtime: {
      sendMessage: () => {},
    },
  };

  // Mark the document ready once popup.js has rendered and images are decoded,
  // so capture scripts and parent frames know when to measure / screenshot.
  const timer = setInterval(async () => {
    const rows = document.querySelectorAll("#window-list .window-item");
    const counted = document.getElementById("count-all")?.textContent !== "–";
    if (rows.length !== windows.length || !counted) return;
    clearInterval(timer);
    await Promise.all(
      [...document.images].map((img) => img.decode().catch(() => {})),
    );
    await document.fonts.ready;
    document.documentElement.dataset.ready = "true";
  }, 20);
})();
