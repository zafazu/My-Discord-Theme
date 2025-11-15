let replacementText = "Starting DarkVision...";

function replaceStartingText(newText = "Starting DarkVision...") {
  replacementText = newText;
  
  if (!document.body) return; // Safety check
  
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const toReplace = [];
  let n;
  while (n = walker.nextNode()) {
    if (n.nodeValue?.includes("Starting...")) toReplace.push(n);
  }
  toReplace.forEach(t => t.nodeValue = t.nodeValue.replace(/Starting\.\.\./g, replacementText));
}

const observer = new MutationObserver(muts => {
  for (const m of muts) {
    for (const node of m.addedNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.nodeValue?.includes("Starting...")) {
          node.nodeValue = node.nodeValue.replace(/Starting\.\.\./g, replacementText);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
        let t;
        while (t = walker.nextNode()) {
          if (t.nodeValue?.includes("Starting...")) {
            t.nodeValue = t.nodeValue.replace(/Starting\.\.\./g, replacementText);
          }
        }
      }
    }
  }
});

replaceStartingText("Starting DarkVision...");
if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
}

setTimeout(() => observer.disconnect(), 10000);