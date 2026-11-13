chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "tab-splitter-parent",
    title: "Tab Mover",
    contexts: ["all"],
  });

  chrome.contextMenus.create({
    id: "split-current-window",
    parentId: "tab-splitter-parent",
    title: "Move this domain's tabs to a new window (Current Window)",
    contexts: ["all"],
  });
  chrome.contextMenus.create({
    id: "split-all-windows",
    parentId: "tab-splitter-parent",
    title: "Move this domain's tabs to a new window (All Windows)",
    contexts: ["all"],
  });
  chrome.contextMenus.create({
    id: "merge-all-windows",
    parentId: "tab-splitter-parent",
    title: "Merge all windows to current",
    contexts: ["all"],
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "merge") {
    mergeWindows(request.windowId, request.sourceWindowIds).then(() =>
      sendResponse({ status: "done" }),
    );
    return true;
  }
  if (request.action === "moveTab") {
    moveTabToWindow(request.tabId, request.targetWindowId).then(() =>
      sendResponse({ status: "done" }),
    );
    return true;
  }
  if (request.action === "splitCurrent") {
    splitTabsByDomain(request.windowId, request.url, "current").then(() =>
      sendResponse({ status: "done" }),
    );
    return true;
  }
  if (request.action === "splitAll") {
    splitTabsByDomain(null, request.url, "all").then(() =>
      sendResponse({ status: "done" }),
    );
    return true;
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "split-current-window") {
    splitTabsByDomain(tab.windowId, tab.url, "current");
  } else if (info.menuItemId === "split-all-windows") {
    splitTabsByDomain(null, tab.url, "all");
  } else if (info.menuItemId === "merge-all-windows") {
    mergeAllWindows(tab.windowId);
  }
});

async function splitTabsByDomain(windowId, currentUrl, scope) {
  if (!currentUrl || !currentUrl.startsWith('http')) return;
  
  try {
    const domain = new URL(currentUrl).hostname;
    let tabsToMove = [];

    if (scope === "current") {
      const windowExists = await chrome.windows.get(windowId).catch(() => null);
      if (!windowExists) return;

      const tabs = await chrome.tabs.query({ windowId: windowId });
      tabsToMove = tabs.filter(
        (t) => t.url && t.url.startsWith('http') && new URL(t.url).hostname === domain,
      );
    } else {
      const tabs = await chrome.tabs.query({});
      tabsToMove = tabs.filter(
        (t) => t.url && t.url.startsWith('http') && new URL(t.url).hostname === domain,
      );
    }

    if (tabsToMove.length > 1) {
      const lastFocused = tabsToMove.reduce((latest, tab) => {
        const tabTime = tab.lastAccessed || 0;
        const latestTime = latest.lastAccessed || 0;
        if (tabTime > latestTime) return tab;
        if (tabTime === latestTime && tab.active && !latest.active) return tab;
        return latest;
      });
      const tabIds = tabsToMove.map((t) => t.id);
      const firstTab = tabIds.shift();

      const newWindow = await chrome.windows.create({
        tabId: firstTab,
        focused: true,
      });

      if (newWindow && tabIds.length > 0) {
        await chrome.tabs.move(tabIds, { windowId: newWindow.id, index: -1 });
      }

      if (newWindow && lastFocused.id !== firstTab) {
        await chrome.tabs.update(lastFocused.id, { active: true });
        await chrome.windows.update(newWindow.id, { focused: true });
      }
    }
  } catch (e) {
    console.error("Error splitting tabs:", e);
  }
}

async function mergeAllWindows(targetWindowId) {
  return mergeWindows(targetWindowId);
}

async function mergeWindows(targetWindowId, sourceWindowIds) {
  try {
    const targetWin = await chrome.windows.get(targetWindowId).catch(() => null);
    if (!targetWin) return;

    let sourceIds = sourceWindowIds;
    if (!sourceIds) {
      const windows = await chrome.windows.getAll();
      sourceIds = windows.map((win) => win.id);
    }

    for (const sourceId of sourceIds) {
      if (sourceId === targetWindowId) continue;

      const tabs = await chrome.tabs.query({ windowId: sourceId });
      const tabIds = tabs.map((t) => t.id);
      if (tabIds.length === 0) continue;

      const stillExists = await chrome.windows.get(targetWindowId).catch(() => null);
      if (!stillExists) return;

      await chrome.tabs.move(tabIds, { windowId: targetWindowId, index: -1 });
    }
  } catch (e) {
    console.error("Error merging windows:", e);
  }
}

async function moveTabToWindow(tabId, targetWindowId) {
  try {
    const [tab, targetWin] = await Promise.all([
      chrome.tabs.get(tabId).catch(() => null),
      chrome.windows.get(targetWindowId).catch(() => null),
    ]);
    if (!tab || !targetWin || tab.windowId === targetWindowId) return;
    if (Boolean(tab.incognito) !== Boolean(targetWin.incognito)) return;

    await chrome.tabs.move(tabId, {
      windowId: targetWindowId,
      index: tab.pinned ? 0 : -1,
    });
    await chrome.tabs.update(tabId, { active: true });
    await chrome.windows.update(targetWindowId, { focused: true });
  } catch (e) {
    console.error("Error moving tab:", e);
  }
}
