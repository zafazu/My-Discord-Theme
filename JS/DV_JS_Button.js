const createNewButton = () => {
    const sidebar = document.querySelector('.side_aa8da2');
    const section = document.querySelector('.contentColumn__23e6b');
    if (!sidebar || !section || document.querySelector('.vc-themes-cloned')) return;

    const original = document.querySelector('.vc-themes');
    if (!original) return;

    const clone = original.cloneNode(true);
    clone.classList.add('vc-themes-cloned');
    clone.textContent = 'JavaScript';
    original.insertAdjacentElement('afterend', clone);

    // Input 
    const input = document.createElement('input');
    input.type = 'text';
    input.style.width = section.offsetWidth + 'px';
    input.style.height = section.offsetHeight * 0.8 + 'px'; 
    input.style.boxSizing = 'border-box';
    input.style.display = 'none';
    input.style.backgroundColor = 'transparent';
    input.style.border = '2px solid var(--main-color)';
    input.style.color = '#FFFFFF';
    input.style.fontSize = '1.2em';
    input.style.textAlign = 'left';
    input.style.paddingTop = '0';
    input.style.paddingLeft = '5px';
    input.style.lineHeight = 'normal';
    input.style.verticalAlign = 'top';
    section.parentElement.appendChild(input);

    // Load Button
    const loadBtn = document.createElement('button');
    loadBtn.textContent = 'Load';
    loadBtn.style.display = 'none';
    loadBtn.style.marginTop = '5px';
    loadBtn.style.padding = '5px 10px';
    loadBtn.style.backgroundColor = 'var(--main-color)';
    loadBtn.style.color = '#FFFFFF';
    loadBtn.style.border = 'none';
    loadBtn.style.cursor = 'pointer';
    section.parentElement.appendChild(loadBtn);

    loadBtn.addEventListener('click', () => {
        try {
            eval(input.value); 
        } catch (e) {
            console.error(e);
        }
    });

    const getMajorityTextColor = () => {
        const colors = {};
        sidebar.querySelectorAll('div').forEach(div => {
            if (div === clone) return;
            const c = window.getComputedStyle(div).color;
            colors[c] = (colors[c] || 0) + 1;
        });
        return Object.entries(colors).sort((a,b)=>b[1]-a[1])[0]?.[0] || '';
    };

    const updateBackgrounds = (active) => {
        const majorityColor = getMajorityTextColor();
        sidebar.querySelectorAll('div').forEach(div => {
            if (div === clone) return;
            div.style.setProperty('background-color', active ? 'transparent' : '', 'important');
            div.style.color = active ? majorityColor : '';
        });
    };

    const updateNewButtonStyle = (active) => {
        if (active) {
            clone.style.setProperty('background-color', 'var(--main-color)', 'important');
            clone.style.color = '#E3E3E6';
        } else {
            clone.style.setProperty('background-color', 'transparent', 'important');
            clone.style.color = '';
        }
    };

    clone.addEventListener('click', (e) => {
        e.stopPropagation();
        const active = clone.dataset.active !== 'true';
        clone.dataset.active = active ? 'true' : 'false';
        updateBackgrounds(active);
        updateNewButtonStyle(active);

        section.style.display = active ? 'none' : '';
        input.style.display = active ? '' : 'none';
        loadBtn.style.display = active ? '' : 'none';
    });

    sidebar.addEventListener('click', (e) => {
        if (!clone.contains(e.target)) {
            clone.dataset.active = 'false';
            updateBackgrounds(false);
            updateNewButtonStyle(false);

            section.style.display = '';
            input.style.display = 'none';
            loadBtn.style.display = 'none';
        }
    });
};



const observer = new MutationObserver(() => {
    createNewButton();
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial
createNewButton();