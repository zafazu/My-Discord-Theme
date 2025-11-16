function hideSplash() {
  const splash = document.getElementById('splash');
  if (splash) {
    splash.style.display = 'none';
    splash.style.visibility = 'hidden';
    splash.style.opacity = '0';
    return true;
  }
  return false;
}

hideSplash();

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length) {
      if (hideSplash()) {
      }
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

const intervalCheck = setInterval(() => {
  hideSplash();
}, 100);

setTimeout(() => {
  clearInterval(intervalCheck);
}, 10000);

const videoContainer = document.createElement('div');
videoContainer.id = 'video-container';
videoContainer.style.position = 'absolute';
videoContainer.style.top = '0';
videoContainer.style.left = '0';
videoContainer.style.width = '100%';
videoContainer.style.height = '100%';
videoContainer.style.display = 'flex';
videoContainer.style.justifyContent = 'center';
videoContainer.style.alignItems = 'center';
videoContainer.style.background = '#000';
videoContainer.style.zIndex = '9999';

const video = document.createElement('video');
video.id = 'custom-video';
video.autoplay = true;
video.loop = true;
video.muted = true; 
video.style.width = '600px'; 
video.style.height = '300px'; 
video.style.objectFit = 'cover';

let videoPath;

if (typeof process !== 'undefined' && process.env && process.env.USERPROFILE) {
  const fs = require('fs');
  const path = require('path');
  
  const userProfile = process.env.USERPROFILE;
  
  const documentFolders = ['Documents', 'Dokumente', 'Documentos', 'Documenti'];
  const videoFile = path.join('DarkVision', 'DarkVision_JS', 'content', 'splash_videos', 'PlayStation.mp4');
  
  let foundPath = null;
  
  for (const docFolder of documentFolders) {
    const oneDrivePath = path.join(userProfile, 'OneDrive', docFolder, videoFile);
    if (fs.existsSync(oneDrivePath)) {
      foundPath = oneDrivePath;
      break;
    }
  }
  
  if (!foundPath) {
    for (const docFolder of documentFolders) {
      const localPath = path.join(userProfile, docFolder, videoFile);
      if (fs.existsSync(localPath)) {
        foundPath = localPath;
        break;
      }
    }
  }
  
  if (foundPath) {
    videoPath = `file:///${foundPath}`.replace(/\\/g, '/');
  } else {
    // Fallback to relative path
    videoPath = './PlayStation.mp4';
  }
} else {
  videoPath = './PlayStation.mp4';
}

video.src = videoPath;

videoContainer.appendChild(video);

document.body.appendChild(videoContainer);

document.body.style.width = '100vw';
document.body.style.height = '100vh';
document.body.style.overflow = 'hidden';