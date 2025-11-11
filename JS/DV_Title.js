const sel = '.visual-refresh:not(.platform-osx) .leading_c38106';
const timeout = 60_000; 
const intervalTime = 500; 
let elapsed = 0;

const interval = setInterval(() => {
  elapsed += intervalTime;

  const target = document.querySelector(sel); 
  if (!target && elapsed < timeout) return;  

  if (document.querySelector('.injected-js-btn')) {
    if (target) target.style.setProperty('--before-content', '"DarkVisionJS"');
    clearInterval(interval);
  } else if (elapsed >= timeout) {
    if (target) target.style.setProperty('--before-content', '"DarkVision"');
    clearInterval(interval);
  }
}, intervalTime);


