// Background service worker for Nexus Chrome Extension
const NEXUS_URL = "http://localhost:5173";

// Context menu: "Save to Nexus"
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-nexus",
    title: "Save to Nexus",
    contexts: ["page", "selection", "link", "image"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "save-to-nexus") return;

  const params = new URLSearchParams({
    capture: "true",
    url: info.linkUrl || info.pageUrl || tab?.url || "",
    title: tab?.title || "",
    text: info.selectionText || "",
  });

  chrome.tabs.create({
    url: `${NEXUS_URL}/?${params.toString()}`,
  });
});
