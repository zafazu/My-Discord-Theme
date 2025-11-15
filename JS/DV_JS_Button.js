const createScriptsTab = () => {
    const sidebar = document.querySelector('.side_aa8da2');
    const section = document.querySelector('.contentColumn__23e6b');
    if (!sidebar || !section || document.querySelector('.vc-scripts-tab')) return;
    
    const original = document.querySelector('.vc-themes');
    if (!original) return;
    
    // Create Scripts tab button
    const scriptsTab = original.cloneNode(true);
    scriptsTab.classList.add('vc-scripts-tab');
    scriptsTab.textContent = 'Scripts';
    original.insertAdjacentElement('afterend', scriptsTab);
    
    // Create main container
    const container = document.createElement('div');
    container.className = 'scripts-container';
    container.style.cssText = `
        display: none;
        width: ${section.offsetWidth}px;
        height: ${section.offsetHeight}px;
        box-sizing: border-box;
        background-color: transparent;
        padding: 20px;
        overflow: hidden;
    `;
    section.parentElement.appendChild(container);
    
    // Create layout
    const layout = document.createElement('div');
    layout.style.cssText = `
        display: flex;
        gap: 15px;
        height: 100%;
    `;
    container.appendChild(layout);
    
    // Left side - Saved scripts list
    const leftPanel = document.createElement('div');
    leftPanel.style.cssText = `
        width: 200px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;
    
    const listTitle = document.createElement('div');
    listTitle.textContent = 'Saved Scripts';
    listTitle.style.cssText = `
        font-size: 14px;
        font-weight: 600;
        color: #FFFFFF;
        margin-bottom: 5px;
    `;
    
    const scriptsList = document.createElement('div');
    scriptsList.className = 'scripts-list';
    scriptsList.style.cssText = `
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 5px;
    `;
    
    leftPanel.appendChild(listTitle);
    leftPanel.appendChild(scriptsList);
    layout.appendChild(leftPanel);
    
    // Right side - Editor
    const rightPanel = document.createElement('div');
    rightPanel.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;
    
    // Script name input
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Script name...';
    nameInput.style.cssText = `
        padding: 8px 12px;
        background-color: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--main-color);
        border-radius: 4px;
        color: #FFFFFF;
        font-size: 14px;
        outline: none;
    `;
    
    // Code editor (textarea)
    const editor = document.createElement('textarea');
    editor.placeholder = '// Write your JavaScript code here...\n// Example:\nconsole.log("Hello from custom script!");';
    editor.style.cssText = `
        height: 250px;
        padding: 12px;
        background-color: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--main-color);
        border-radius: 4px;
        color: #FFFFFF;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 13px;
        line-height: 1.5;
        resize: vertical;
        outline: none;
    `;
    
    // Console output
    const consoleOutput = document.createElement('div');
    consoleOutput.style.cssText = `
        height: 100px;
        padding: 10px;
        background-color: rgba(0, 0, 0, 0.3);
        border: 1px solid var(--main-color);
        border-radius: 4px;
        color: #10b981;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 12px;
        overflow-y: auto;
        white-space: pre-wrap;
    `;
    consoleOutput.textContent = '> Console output will appear here...';
    
    // Buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
        display: flex;
        gap: 8px;
    `;
    
    // Run button
    const runBtn = document.createElement('button');
    runBtn.textContent = '▶ Run';
    runBtn.style.cssText = `
        padding: 8px 20px;
        background-color: #10b981;
        color: #FFFFFF;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        transition: background-color 0.2s;
    `;
    runBtn.addEventListener('mouseenter', () => runBtn.style.backgroundColor = '#059669');
    runBtn.addEventListener('mouseleave', () => runBtn.style.backgroundColor = '#10b981');
    
    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.style.cssText = `
        padding: 8px 20px;
        background-color: var(--main-color);
        color: #FFFFFF;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        transition: opacity 0.2s;
    `;
    saveBtn.addEventListener('mouseenter', () => saveBtn.style.opacity = '0.8');
    saveBtn.addEventListener('mouseleave', () => saveBtn.style.opacity = '1');
    
    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.textContent = '🗑 Clear';
    clearBtn.style.cssText = `
        padding: 8px 20px;
        background-color: #ef4444;
        color: #FFFFFF;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        transition: background-color 0.2s;
    `;
    clearBtn.addEventListener('mouseenter', () => clearBtn.style.backgroundColor = '#dc2626');
    clearBtn.addEventListener('mouseleave', () => clearBtn.style.backgroundColor = '#ef4444');
    
    // Export button
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export';
    exportBtn.style.cssText = `
        padding: 8px 20px;
        background-color: #6366f1;
        color: #FFFFFF;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        transition: background-color 0.2s;
    `;
    exportBtn.addEventListener('mouseenter', () => exportBtn.style.backgroundColor = '#4f46e5');
    exportBtn.addEventListener('mouseleave', () => exportBtn.style.backgroundColor = '#6366f1');
    
    buttonsContainer.appendChild(runBtn);
    buttonsContainer.appendChild(saveBtn);
    buttonsContainer.appendChild(exportBtn);
    buttonsContainer.appendChild(clearBtn);
    
    rightPanel.appendChild(nameInput);
    rightPanel.appendChild(editor);
    rightPanel.appendChild(consoleOutput);
    rightPanel.appendChild(buttonsContainer);
    layout.appendChild(rightPanel);
    
    // Storage functions using localStorage
    const STORAGE_KEY = 'vencord_custom_scripts';
    
    const saveScriptToStorage = (name, code) => {
        try {
            const scripts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            scripts[name] = {
                code: code,
                modified: Date.now()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts));
            consoleOutput.textContent = `> Script saved successfully!\n> Storage: Browser localStorage\n> Name: ${name}`;
            return true;
        } catch (e) {
            consoleOutput.textContent = `> Error saving script: ${e.message}`;
            return false;
        }
    };
    
    const loadScriptsFromStorage = () => {
        try {
            const scripts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            return Object.entries(scripts).map(([name, data]) => ({
                name: name,
                code: data.code,
                modified: data.modified
            })).sort((a, b) => b.modified - a.modified);
        } catch (e) {
            console.error('Error loading scripts:', e);
            return [];
        }
    };
    
    const deleteScriptFromStorage = (name) => {
        try {
            const scripts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            delete scripts[name];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts));
            consoleOutput.textContent = `> Script deleted: ${name}`;
            return true;
        } catch (e) {
            consoleOutput.textContent = `> Error deleting script: ${e.message}`;
            return false;
        }
    };
    
    const exportAllScripts = () => {
        try {
            const scripts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            const dataStr = JSON.stringify(scripts, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `vencord-scripts-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            consoleOutput.textContent = '> All scripts exported successfully!\n> Check your downloads folder';
        } catch (e) {
            consoleOutput.textContent = `> Error exporting scripts: ${e.message}`;
        }
    };
    
    const renderScriptsList = () => {
        const scripts = loadScriptsFromStorage();
        scriptsList.innerHTML = '';
        
        if (scripts.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.textContent = 'No saved scripts';
            emptyMsg.style.cssText = `
                color: rgba(255, 255, 255, 0.4);
                font-size: 12px;
                text-align: center;
                padding: 20px 0;
            `;
            scriptsList.appendChild(emptyMsg);
            return;
        }
        
        scripts.forEach((script) => {
            const item = document.createElement('div');
            item.style.cssText = `
                padding: 8px 10px;
                background-color: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: background-color 0.2s;
            `;
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = script.name;
            nameSpan.style.cssText = `
                font-size: 13px;
                color: #FFFFFF;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                flex: 1;
            `;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '×';
            deleteBtn.style.cssText = `
                background: transparent;
                border: none;
                color: #ef4444;
                cursor: pointer;
                font-size: 18px;
                font-weight: 700;
                padding: 0 5px;
            `;
            
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            });
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            });
            
            item.addEventListener('click', () => {
                nameInput.value = script.name;
                editor.value = script.code;
                const date = new Date(script.modified).toLocaleString();
                consoleOutput.textContent = `> Script loaded: ${script.name}\n> Last modified: ${date}`;
            });
            
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Delete script "${script.name}"?`)) {
                    if (deleteScriptFromStorage(script.name)) {
                        renderScriptsList();
                    }
                }
            });
            
            item.appendChild(nameSpan);
            item.appendChild(deleteBtn);
            scriptsList.appendChild(item);
        });
    };
    
    // Button event handlers
    runBtn.addEventListener('click', () => {
        const code = editor.value.trim();
        if (!code) {
            consoleOutput.textContent = '> Error: No code to run';
            return;
        }
        
        const oldLog = console.log;
        const oldError = console.error;
        const logs = [];
        
        console.log = (...args) => {
            logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
            oldLog.apply(console, args);
        };
        
        console.error = (...args) => {
            logs.push('ERROR: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
            oldError.apply(console, args);
        };
        
        try {
            consoleOutput.textContent = '> Running script...\n';
            const result = eval(code);
            if (result !== undefined) {
                logs.push('=> ' + (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)));
            }
            consoleOutput.textContent += logs.join('\n');
            if (logs.length === 0) {
                consoleOutput.textContent += 'Script executed successfully (no output)';
            }
        } catch (err) {
            consoleOutput.textContent += `ERROR: ${err.message}\n${err.stack || ''}`;
        } finally {
            console.log = oldLog;
            console.error = oldError;
        }
    });
    
    saveBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const code = editor.value.trim();
        
        if (!name) {
            consoleOutput.textContent = '> Error: Please enter a script name';
            return;
        }
        if (!code) {
            consoleOutput.textContent = '> Error: Cannot save empty script';
            return;
        }
        
        if (saveScriptToStorage(name, code)) {
            renderScriptsList();
        }
    });
    
    exportBtn.addEventListener('click', () => {
        exportAllScripts();
    });
    
    clearBtn.addEventListener('click', () => {
        editor.value = '';
        nameInput.value = '';
        consoleOutput.textContent = '> Editor cleared';
    });
    
    // Tab switching logic
    const getMajorityTextColor = () => {
        const colors = {};
        sidebar.querySelectorAll('div').forEach(div => {
            if (div === scriptsTab) return;
            const c = window.getComputedStyle(div).color;
            colors[c] = (colors[c] || 0) + 1;
        });
        return Object.entries(colors).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    };
    
    const updateBackgrounds = (active) => {
        const majorityColor = getMajorityTextColor();
        sidebar.querySelectorAll('div').forEach(div => {
            if (div === scriptsTab) return;
            div.style.setProperty('background-color', active ? 'transparent' : '', 'important');
            div.style.color = active ? majorityColor : '';
        });
    };
    
    const updateTabStyle = (active) => {
        if (active) {
            scriptsTab.style.setProperty('background-color', 'var(--main-color)', 'important');
            scriptsTab.style.color = '#E3E3E6';
        } else {
            scriptsTab.style.setProperty('background-color', 'transparent', 'important');
            scriptsTab.style.color = '';
        }
    };
    
    scriptsTab.addEventListener('click', (e) => {
        e.stopPropagation();
        const active = scriptsTab.dataset.active !== 'true';
        scriptsTab.dataset.active = active ? 'true' : 'false';
        
        updateBackgrounds(active);
        updateTabStyle(active);
        
        section.style.display = active ? 'none' : '';
        container.style.display = active ? 'block' : 'none';
        
        if (active) {
            renderScriptsList();
        }
    });
    
    sidebar.addEventListener('click', (e) => {
        if (!scriptsTab.contains(e.target) && !container.contains(e.target)) {
            scriptsTab.dataset.active = 'false';
            updateBackgrounds(false);
            updateTabStyle(false);
            section.style.display = '';
            container.style.display = 'none';
        }
    });
    
    // Initial setup
    consoleOutput.textContent = '> Scripts tab ready!\n> Storage: Browser localStorage\n> Scripts persist across sessions\n> Use Export button to backup your scripts';
    
    // Initial render
    renderScriptsList();
};

const observer = new MutationObserver(() => {
    createScriptsTab();
});
observer.observe(document.body, { childList: true, subtree: true });

// Initial call
createScriptsTab();
