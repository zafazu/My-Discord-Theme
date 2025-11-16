(function() {
    'use strict';
    
    const isDiscordUpdater = 
        document.title === "Discord Updater" &&
        document.getElementById('splash-mount') &&
        document.querySelector('video[src*="connecting.webm"]');
    
    if (isDiscordUpdater) {
        console.log('Skipping video - Discord Updater detected');
        return; 
    }
    
    const video = document.createElement('video');
    
    video.src = 'https://i.imgur.com/CeXOTkU.mp4'; 
    video.autoplay = true;
    video.muted = false; 
    video.playsInline = true; 
    
    video.style.position = 'fixed';
    video.style.top = '0';
    video.style.left = '0';
    video.style.width = '100vw';
    video.style.height = '100vh';
    video.style.objectFit = 'cover';
    video.style.zIndex = '999999';
    
    const originalBodyDisplay = document.body.style.display;
    document.body.style.display = 'none';
    
    document.documentElement.appendChild(video);
    
    video.addEventListener('ended', function() {
        document.body.style.display = originalBodyDisplay;
        document.documentElement.removeChild(video);
    });
    
    video.addEventListener('error', function() {
        console.error('Video failed to load');
        document.body.style.display = originalBodyDisplay;
        document.documentElement.removeChild(video);
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            video.pause();
            document.body.style.display = originalBodyDisplay;
            document.documentElement.removeChild(video);
        }
    });
})();
