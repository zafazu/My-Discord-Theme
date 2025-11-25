document.body.style.backgroundColor = '#000000';
const splash = document.getElementById('splash');
if (splash) {
  splash.style.background = '#000000';
}

function updateStatusText() {
  const statusSpan = document.querySelector('.splash-status span');
  if (statusSpan) {
    statusSpan.textContent = 'Starting DarkVision...';
  }
}

function replaceLoadingAnimation() {
  const video = document.querySelector('.splash-inner video');
  if (video) {
    const img = document.createElement('img');
    img.src = 'https://media.tenor.com/retTO7iKjS0AAAAi/tail-post-tail.gif';
    img.width = 200;
    img.height = 200;
    img.className = 'loaded';
    
    video.parentNode.replaceChild(img, video);
  }
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      updateStatusText();
      replaceLoadingAnimation();
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

updateStatusText();
replaceLoadingAnimation();
