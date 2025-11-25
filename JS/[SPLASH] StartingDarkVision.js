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
    img.src = 'https://i.imgur.com/3NKYIVO.gif';
    img.width = 200;
    img.height = 200;
    img.className = 'loaded';
    
    video.parentNode.replaceChild(img, video);
  }
}

let animationReplaced = false;
let textUpdated = false;

const observer = new MutationObserver((mutations) => {
  observer.disconnect();
  
  if (!textUpdated) {
    updateStatusText();
    textUpdated = true;
  }
  
  if (!animationReplaced) {
    const video = document.querySelector('.splash-inner video');
    if (video) {
      replaceLoadingAnimation();
      animationReplaced = true;
    }
  }
  
  if (!animationReplaced || !textUpdated) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

setTimeout(() => {
  if (!textUpdated) updateStatusText();
  if (!animationReplaced) replaceLoadingAnimation();
}, 50);

setTimeout(() => {
  if (!textUpdated) updateStatusText();
  if (!animationReplaced) replaceLoadingAnimation();
}, 200);

setTimeout(() => {
  if (!textUpdated) updateStatusText();
  if (!animationReplaced) replaceLoadingAnimation();
}, 500);
