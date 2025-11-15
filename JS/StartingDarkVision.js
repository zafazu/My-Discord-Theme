// const statusSpan = document.querySelector('.splash-status span');
//
// if (statusSpan && statusSpan.textContent.includes('Starting…')) {
//    statusSpan.textContent = 'Starting DarkVision...';
// }






(function() {
    'use strict';
    
    function replaceSplashWithVideo() {
        console.log('DarkVision: Replacing splash with video only...');
        
        const splashMount = document.getElementById('splash-mount');
        if (!splashMount) {
            setTimeout(replaceSplashWithVideo, 100);
            return;
        }
        
        splashMount.style.background = 'transparent';
        splashMount.style.backgroundColor = 'transparent';
        
        const splash = document.getElementById('splash');
        if (splash) {
            splash.style.background = 'transparent';
            splash.style.backgroundColor = 'transparent';
        }
        
        const allTextElements = splashMount.querySelectorAll('span, div');
        allTextElements.forEach(el => {
            if (el.classList.contains('splash-inner')) continue;
            el.style.opacity = '0';
            el.style.visibility = 'hidden';
            el.style.display = 'none';
        });
        
        const existingVideo = splashMount.querySelector('video');
        if (existingVideo) {
            existingVideo.remove();
        }
        
        const progress = splashMount.querySelector('.progress, .progress-placeholder');
        if (progress) {
            progress.style.display = 'none';
            progress.remove();
        }
        
        const video = document.createElement('video');
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.style.cssText = `
            width: 200px;
            height: 200px;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;
            border-radius: 20px;
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.7);
        `;
        
        const source = document.createElement('source');
        source.src = 'https://cdn.discordapp.com/attachments/1236682831892320317/1439382786556297487/ps1boykisser.mp4?ex=691a512e&is=6918ffae&hm=c7222a33362a61a82c8a008805648cf86e3df68d98753daa087526e1ea7571cb&';
        source.type = 'video/mp4';
        video.appendChild(source);
        
        video.onerror = function() {
            console.error('DarkVision: Video failed to load, creating fallback...');
            const fallback = document.createElement('div');
            fallback.style.cssText = `
                width: 200px;
                height: 200px;
                background: linear-gradient(45deg, #5865f2, #eb459e);
                border-radius: 20px;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 9999;
                animation: darkvision-spin 2s linear infinite;
            `;
            

            if (!document.querySelector('#darkvision-animation')) {
                const style = document.createElement('style');
                style.id = 'darkvision-animation';
                style.textContent = `
                    @keyframes darkvision-spin {
                        0% { transform: translate(-50%, -50%) rotate(0deg); }
                        100% { transform: translate(-50%, -50%) rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            video.replaceWith(fallback);
        };
        
        video.onloadstart = function() {
            console.log('DarkVision: Video started loading from Discord CDN');
        };
        
        video.onloadeddata = function() {
            console.log('DarkVision: Video loaded successfully from Discord CDN');
        };

        const splashInner = splashMount.querySelector('.splash-inner');
        if (splashInner) {
            splashInner.innerHTML = '';
            splashInner.style.background = 'transparent';
            splashInner.appendChild(video);
            splashInner.style.display = 'flex';
            splashInner.style.justifyContent = 'center';
            splashInner.style.alignItems = 'center';
            splashInner.style.width = '100%';
            splashInner.style.height = '100%';
        } else {
            splashMount.innerHTML = '';
            splashMount.appendChild(video);
            splashMount.style.display = 'flex';
            splashMount.style.justifyContent = 'center';
            splashMount.style.alignItems = 'center';
        }
        
        console.log('DarkVision: Splash replaced with Discord CDN video');
        
        preventSplashHiding();
    }
    
    function preventSplashHiding() {
        const originalSetAttribute = Element.prototype.setAttribute;
        Element.prototype.setAttribute = function(name, value) {
            if (name === 'style' && 
                (this.id === 'splash-mount' || this.id === 'splash' || 
                 this.classList.contains('splash-inner'))) {
                if (value.includes('display: none') || value.includes('visibility: hidden')) {
                    console.log('DarkVision: Prevented hiding splash');
                    return;
                }
            }
            return originalSetAttribute.call(this, name, value);
        };
        
        // Monitor for removal attempts
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.removedNodes.forEach(function(node) {
                        if (node.id === 'splash-mount' || node.id === 'splash') {
                            console.log('DarkVision: Splash was removed, recreating...');
                            setTimeout(recreateVideoOnly, 100);
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    function recreateVideoOnly() {
        const video = document.createElement('video');
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.id = 'darkvision-splash-video';
        video.style.cssText = `
            width: 200px;
            height: 200px;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;
            border-radius: 20px;
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.7);
        `;
        
        const source = document.createElement('source');
        source.src = 'https://cdn.discordapp.com/attachments/1236682831892320317/1439382786556297487/ps1boykisser.mp4?ex=691a512e&is=6918ffae&hm=c7222a33362a61a82c8a008805648cf86e3df68d98753daa087526e1ea7571cb&';
        source.type = 'video/mp4';
        video.appendChild(source);
        
        document.body.appendChild(video);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', replaceSplashWithVideo);
    } else {
        replaceSplashWithVideo();
    }
    
    setTimeout(replaceSplashWithVideo, 500);
})();
