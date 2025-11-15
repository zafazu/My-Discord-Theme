const start = performance.now();

const interval = setInterval(() => {
    const el = document.querySelector('.splash-text');
    if (el) {
        el.textContent = 'Starting DarkVision...';
        clearInterval(interval);
    }

    if (performance.now() - start > 5000) {
        clearInterval(interval);
    }
}, 50); 
