const NEXUS_URL = "http://localhost:5173";

// Pre-fill from current tab
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  if (tab) {
    document.getElementById("url").value = tab.url || "";
    document.getElementById("title").value = tab.title || "";
  }
});

// Try to get selected text from the page
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (!tabs[0]?.id) return;
  chrome.scripting.executeScript(
    {
      target: { tabId: tabs[0].id },
      func: () => window.getSelection()?.toString() || "",
    },
    (results) => {
      if (results?.[0]?.result) {
        document.getElementById("content").value = results[0].result;
      }
    }
  );
});

// Save button
document.getElementById("save").addEventListener("click", () => {
  const url = document.getElementById("url").value;
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;

  if (!title.trim()) {
    document.getElementById("status").textContent = "Title is required";
    document.getElementById("status").style.color = "#f46c6c";
    return;
  }

  const params = new URLSearchParams({
    capture: "true",
    url,
    title,
    text: content,
  });

  chrome.tabs.create({ url: `${NEXUS_URL}/?${params.toString()}` });
  document.getElementById("status").textContent = "Opening Nexus...";
});
