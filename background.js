chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "tab-splitter-parent",
    title: "Tab Splitter",
    contexts: ["all"],
  });

  chrome.contextMenus.create({
    id: "split-current-window",
    parentId: "tab-splitter-parent",
    title: "Split tabs by domain (Current Window)",
    contexts: ["all"],
  });
  chrome.contextMenus.create({
    id: "split-all-windows",
    parentId: "tab-splitter-parent",
    title: "Split tabs by domain (All Windows)",
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
    mergeAllWindows(request.windowId).then(() =>
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
      const tabIds = tabsToMove.map((t) => t.id);
      const firstTab = tabIds.shift();
      
      const newWindow = await chrome.windows.create({ tabId: firstTab });
      
      if (newWindow && tabIds.length > 0) {
        await chrome.tabs.move(tabIds, { windowId: newWindow.id, index: -1 });
      }
    }
  } catch (e) {
    console.error("Error splitting tabs:", e);
  }
}

async function mergeAllWindows(targetWindowId) {
  try {
    const targetWin = await chrome.windows.get(targetWindowId).catch(() => null);
    if (!targetWin) return;

    const windows = await chrome.windows.getAll();
    for (const win of windows) {
      if (win.id !== targetWindowId) {
        const tabs = await chrome.tabs.query({ windowId: win.id });
        const tabIds = tabs.map((t) => t.id);
        
        if (tabIds.length > 0) {
          const stillExists = await chrome.windows.get(targetWindowId).catch(() => null);
          if (stillExists) {
            await chrome.tabs.move(tabIds, { windowId: targetWindowId, index: -1 });
          }
        }
      }
    }
  } catch (e) {
    console.error("Error merging windows:", e);
  }
}