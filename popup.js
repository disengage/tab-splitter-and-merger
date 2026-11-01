function getHostname(url) {
  if (!url || !url.startsWith("http")) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function setSplitCount(buttonId, countId, count) {
  document.getElementById(countId).textContent = `${count} tab${count === 1 ? "" : "s"}`;
  document.getElementById(buttonId).disabled = count < 2;
}

async function renderSummary() {
  const [[activeTab], allTabs, windows] = await Promise.all([
    chrome.tabs.query({ active: true, currentWindow: true }),
    chrome.tabs.query({}),
    chrome.windows.getAll(),
  ]);

  const domainEl = document.getElementById("current-domain");
  const faviconEl = document.getElementById("current-favicon");
  const domain = getHostname(activeTab?.url);

  if (activeTab?.favIconUrl) {
    faviconEl.src = activeTab.favIconUrl;
    faviconEl.onerror = () => {
      faviconEl.src = "icons/icon16.png";
    };
  }

  if (!domain) {
    domainEl.textContent = "Not a website";
    document.getElementById("domain-hint").textContent =
      "Open a website tab to move its tabs";
    setSplitCount("btn-split-current", "count-current", 0);
    setSplitCount("btn-split-all", "count-all", 0);
  } else {
    domainEl.textContent = domain;
    const matching = allTabs.filter((t) => getHostname(t.url) === domain);
    const inCurrent = matching.filter((t) => t.windowId === activeTab.windowId);
    setSplitCount("btn-split-current", "count-current", inCurrent.length);
    setSplitCount("btn-split-all", "count-all", matching.length);
  }

  const otherTabs = allTabs.filter((t) => t.windowId !== activeTab?.windowId).length;
  document.getElementById("btn-merge").disabled = windows.length < 2;
  document.getElementById("merge-hint").textContent =
    windows.length < 2
      ? "Only one window open"
      : `Move ${otherTabs} tab${otherTabs === 1 ? "" : "s"} from ${windows.length - 1} other window${windows.length === 2 ? "" : "s"} here`;
}

async function renderWindows() {
  const windowList = document.getElementById("window-list");
  windowList.innerHTML = "";

  const [windows, currentWindow] = await Promise.all([
    chrome.windows.getAll({ populate: true }),
    chrome.windows.getCurrent(),
  ]);

  document.getElementById("window-count").textContent =
    `${windows.length} window${windows.length === 1 ? "" : "s"}`;

  if (!windows.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No windows found";
    windowList.appendChild(empty);
    return;
  }

  windows.forEach((win, index) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "window-item";
    if (win.id === currentWindow.id) {
      item.classList.add("is-current");
    }

    item.dataset.windowId = win.id;

    const activeTab = win.tabs.find((t) => t.active) || win.tabs[0];
    const faviconUrl = activeTab ? activeTab.favIconUrl : "icons/icon16.png";
    const tabTitle = activeTab?.title || "Untitled tab";

    const img = document.createElement("img");
    img.src = faviconUrl || "icons/icon16.png";
    img.className = "favicon";
    img.alt = "";
    img.onerror = () => {
      img.src = "icons/icon16.png";
    };

    const details = document.createElement("div");
    details.className = "details";

    const strong = document.createElement("strong");
    strong.textContent =
      win.id === currentWindow.id
        ? `Window ${index + 1} (current)`
        : `Window ${index + 1}`;

    const meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = tabTitle;

    details.appendChild(strong);
    details.appendChild(meta);

    const badge = document.createElement("span");
    badge.className = "tab-badge";
    badge.textContent = `${win.tabs.length} tab${win.tabs.length === 1 ? "" : "s"}`;

    item.appendChild(img);
    item.appendChild(details);
    item.appendChild(badge);

    item.addEventListener("click", async () => {
      await chrome.windows.update(parseInt(item.dataset.windowId, 10), {
        focused: true,
      });
    });

    windowList.appendChild(item);
  });
}

document.getElementById("btn-merge").addEventListener("click", async () => {
  const currentWindow = await chrome.windows.getCurrent();
  chrome.runtime.sendMessage(
    { action: "merge", windowId: currentWindow.id },
    () => {
      renderWindows();
      window.close();
    },
  );
});

document
  .getElementById("btn-split-current")
  .addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab && tab.url) {
      chrome.runtime.sendMessage(
        {
          action: "splitCurrent",
          url: tab.url,
          windowId: tab.windowId,
        },
        () => {
          renderWindows();
          window.close();
        },
      );
    }
  });

document.getElementById("btn-split-all").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url) {
    chrome.runtime.sendMessage(
      {
        action: "splitAll",
        url: tab.url,
        windowId: tab.windowId,
      },
      () => {
        renderWindows();
        window.close();
      },
    );
  }
});

renderSummary();
renderWindows();
