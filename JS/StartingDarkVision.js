// const statusSpan = document.querySelector('.splash-status span');
//
// if (statusSpan && statusSpan.textContent.includes('Starting…')) {
//    statusSpan.textContent = 'Starting DarkVision...';
// }






// Simple splash video replacer
(function() {
    'use strict';
    
    function replaceSplash() {
        const splashMount = document.getElementById('splash-mount');
        if (!splashMount) {
            setTimeout(replaceSplash, 100);
            return;
        }
        
        console.log('DarkVision: Replacing splash with video...');
        
        // Make everything invisible
        splashMount.style.background = 'transparent';
        document.querySelectorAll('#splash-mount *').forEach(el => {
            if (el.tagName !== 'VIDEO') {
                el.style.opacity = '0';
                el.style.visibility = 'hidden';
            }
        });
        
        // Remove existing video
        const oldVideo = document.querySelector('#splash-mount video');
        if (oldVideo) oldVideo.remove();
        
        // Create new video
        const video = document.createElement('video');
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.style.cssText = `
            width: 200px;
            height: 200px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;
        `;
        
        const source = document.createElement('source');
        source.src = 'https://cdn.discordapp.com/attachments/1236682831892320317/1439382786556297487/ps1boykisser.mp4?ex=691a512e&is=6918ffae&hm=c7222a33362a61a82c8a008805648cf86e3df68d98753daa087526e1ea7571cb&';
        source.type = 'video/mp4';
        video.appendChild(source);
        
        // Add to splash
        splashMount.appendChild(video);
        
        console.log('DarkVision: Video added successfully');
    }
    
    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', replaceSplash);
    } else {
        replaceSplash();
    }
    
    // Also try after delay
    setTimeout(replaceSplash, 500);
})();
