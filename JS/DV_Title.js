const sel = '.visual-refresh:not(.platform-osx) .leading_c38106';
const timeout = 60_000; // 1 Minute
const intervalTime = 500; // alle 0,5 Sekunden prüfen
let elapsed = 0;

const interval = setInterval(() => {
  elapsed += intervalTime;

  const target = document.querySelector(sel); // neu abfragen
  if (!target && elapsed < timeout) return;   // noch nicht da, weiter prüfen

  if (document.querySelector('.injected-js-btn')) {
    if (target) target.style.setProperty('--before-content', '"DarkVisionJS"');
    clearInterval(interval);
  } else if (elapsed >= timeout) {
    if (target) target.style.setProperty('--before-content', '"DarkVision"');
    clearInterval(interval);
  }
}, intervalTime);

