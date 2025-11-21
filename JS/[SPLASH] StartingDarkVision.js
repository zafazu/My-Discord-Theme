function updateStatusText() {
  const statusSpan = document.querySelector('.splash-status span');
  if (statusSpan && statusSpan.textContent.includes('Starting…')) {
    statusSpan.textContent = 'Starting DarkVision...';
  }
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      updateStatusText();
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

updateStatusText();


