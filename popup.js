async function renderWindows() {
  const windowList = document.getElementById("window-list");
  windowList.innerHTML = "";

  const windows = await chrome.windows.getAll({ populate: true });

  windows.forEach((win, index) => {
    const item = document.createElement("button");
    item.className = "window-item";
    item.style.width = "100%";
    item.style.textAlign = "left";
    item.style.cursor = "pointer";

    item.dataset.windowId = win.id;

    const activeTab = win.tabs.find((t) => t.active) || win.tabs[0];
    const faviconUrl = activeTab ? activeTab.favIconUrl : "icons/icon16.png";

    const img = document.createElement("img");
    img.src = faviconUrl;
    img.className = "favicon";
    img.onerror = () => {
      img.src = "icons/icon16.png";
    };

    const details = document.createElement("div");
    details.className = "details";
    details.innerHTML = `<strong>Window ${index + 1}</strong> - ${win.tabs.length} tabs`;

    item.appendChild(img);
    item.appendChild(details);

    item.addEventListener("click", async () => {
      await chrome.windows.update(parseInt(item.dataset.windowId), {
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
    if (tab) {
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
  if (tab) {
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

renderWindows();
