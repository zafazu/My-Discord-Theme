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
        flex: 1;
        padding: 12px;
        background-color: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--main-color);
        border-radius: 4px;
        color: #FFFFFF;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 13px;
        line-height: 1.5;
        resize: none;
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
    saveBtn.textContent = '💾 Save';
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
    
    buttonsContainer.appendChild(runBtn);
    buttonsContainer.appendChild(saveBtn);
    buttonsContainer.appendChild(clearBtn);
    
    rightPanel.appendChild(nameInput);
    rightPanel.appendChild(editor);
    rightPanel.appendChild(consoleOutput);
    rightPanel.appendChild(buttonsContainer);
    layout.appendChild(rightPanel);
    
    // File system helper functions with improved module loading
    let fs = null;
    let path = null;
    let electron = null;
    
    const getNodeModules = () => {
        try {
            console.log('=== Checking for Node.js modules ===');
            console.log('window.require:', typeof window.require);
            console.log('window.electronRequire:', typeof window.electronRequire);
            console.log('global require:', typeof (typeof require !== 'undefined' ? require : undefined));
            console.log('process:', typeof process);
            
            // Try multiple methods to get require
            let nodeRequire = null;
            
            if (typeof window.require === 'function') {
                console.log('Using window.require');
                nodeRequire = window.require;
            } else if (typeof window.electronRequire === 'function') {
                console.log('Using window.electronRequire');
                nodeRequire = window.electronRequire;
            } else if (typeof require === 'function') {
                console.log('Using global require');
                nodeRequire = require;
            }
            
            if (!nodeRequire) {
                console.error('No require function found');
                return false;
            }
            
            // Try to load modules
            try {
                fs = nodeRequire('fs');
                console.log('✓ fs module loaded');
            } catch (e) {
                console.error('Failed to load fs:', e.message);
                return false;
            }
            
            try {
                path = nodeRequire('path');
                console.log('✓ path module loaded');
            } catch (e) {
                console.error('Failed to load path:', e.message);
                return false;
            }
            
            try {
                electron = nodeRequire('electron');
                console.log('✓ electron module loaded');
            } catch (e) {
                console.warn('electron module not available:', e.message);
                // electron is optional, so don't fail here
            }
            
            console.log('=== Node.js modules loaded successfully ===');
            return true;
        } catch (e) {
            console.error('Error loading Node modules:', e);
            return false;
        }
    };
    
    const getScriptsFolder = () => {
        if (!fs || !path) {
            console.error('fs or path module not available');
            return null;
        }
        
        try {
            // Get LocalAppData path using multiple methods
            let localAppData = null;
            
            if (typeof process !== 'undefined' && process.env) {
                localAppData = process.env.LOCALAPPDATA;
                
                // Fallback 1: try APPDATA and replace Roaming with Local
                if (!localAppData && process.env.APPDATA) {
                    localAppData = process.env.APPDATA.replace('\\Roaming', '\\Local');
                }
                
                // Fallback 2: construct from USERPROFILE
                if (!localAppData && process.env.USERPROFILE) {
                    localAppData = path.join(process.env.USERPROFILE, 'AppData', 'Local');
                }
                
                // Fallback 3: try common path structure
                if (!localAppData && process.env.USERNAME) {
                    localAppData = `C:\\Users\\${process.env.USERNAME}\\AppData\\Local`;
                }
            }
            
            if (!localAppData) {
                console.error('Could not find LocalAppData path');
                if (typeof process !== 'undefined' && process.env) {
                    console.error('Environment variables:', {
                        LOCALAPPDATA: process.env.LOCALAPPDATA,
                        APPDATA: process.env.APPDATA,
                        USERPROFILE: process.env.USERPROFILE,
                        USERNAME: process.env.USERNAME
                    });
                }
                return null;
            }
            
            console.log('Searching in:', localAppData);
            
            // Check if the path exists
            if (!fs.existsSync(localAppData)) {
                console.error('LocalAppData path does not exist:', localAppData);
                return null;
            }
            
            // Find Discord-inject folder with timestamp format (Discord-inject-YYYYMMDD-HHMMSS)
            const dirs = fs.readdirSync(localAppData);
            const discordInjectPattern = /^Discord-inject-\d{8}-\d{6}$/;
            const discordInjectFolders = dirs.filter(d => discordInjectPattern.test(d));
            
            console.log('Found Discord-inject folders:', discordInjectFolders);
            
            if (discordInjectFolders.length === 0) {
                console.error('No Discord-inject folder found with format Discord-inject-YYYYMMDD-HHMMSS');
                return null;
            }
            
            // Use the most recent one (sort by timestamp)
            const discordInject = discordInjectFolders.sort().reverse()[0];
            console.log('Using folder:', discordInject);
            
            const scriptsPath = path.join(localAppData, discordInject, 'Vencord', 'scripts');
            console.log('Full scripts path:', scriptsPath);
            
            // Create folder if it doesn't exist
            if (!fs.existsSync(scriptsPath)) {
                console.log('Creating scripts folder...');
                fs.mkdirSync(scriptsPath, { recursive: true });
            }
            
            return scriptsPath;
        } catch (e) {
            console.error('Error finding scripts folder:', e);
            return null;
        }
    };
    
    const saveScriptToFile = (name, code) => {
        if (!fs || !path) {
            consoleOutput.textContent = '> Error: File system modules not available\n> This feature requires Node.js integration (Electron)\n> Please ensure you\'re running in Discord desktop client';
            return false;
        }
        
        const scriptsFolder = getScriptsFolder();
        
        if (!scriptsFolder) {
            consoleOutput.textContent = '> Error: Could not find Discord-inject folder\n> Path should be: AppData\\Local\\Discord-inject-YYYYMMDD-HHMMSS\\Vencord\\scripts\n> Make sure Vencord is properly installed';
            return false;
        }
        
        try {
            const fileName = name.endsWith('.js') ? name : `${name}.js`;
            const filePath = path.join(scriptsFolder, fileName);
            fs.writeFileSync(filePath, code, 'utf8');
            consoleOutput.textContent = `> Script saved successfully!\n> Location: ${filePath}`;
            return true;
        } catch (e) {
            consoleOutput.textContent = `> Error saving script: ${e.message}`;
            return false;
        }
    };
    
    const loadScriptsFromFolder = () => {
        if (!fs || !path) {
            return [];
        }
        
        const scriptsFolder = getScriptsFolder();
        
        if (!scriptsFolder) {
            return [];
        }
        
        try {
            const files = fs.readdirSync(scriptsFolder);
            return files
                .filter(f => f.endsWith('.js'))
                .map(f => {
                    const filePath = path.join(scriptsFolder, f);
                    const code = fs.readFileSync(filePath, 'utf8');
                    const stats = fs.statSync(filePath);
                    return {
                        name: f.replace('.js', ''),
                        code: code,
                        path: filePath,
                        modified: stats.mtime.getTime()
                    };
                });
        } catch (e) {
            console.error('Error loading scripts:', e);
            return [];
        }
    };
    
    const deleteScriptFile = (name) => {
        if (!fs || !path) {
            consoleOutput.textContent = '> Error: Cannot delete file - file system access not available';
            return false;
        }
        
        const scriptsFolder = getScriptsFolder();
        
        if (!scriptsFolder) {
            consoleOutput.textContent = '> Error: Cannot find scripts folder';
            return false;
        }
        
        try {
            const fileName = name.endsWith('.js') ? name : `${name}.js`;
            const filePath = path.join(scriptsFolder, fileName);
            fs.unlinkSync(filePath);
            consoleOutput.textContent = `> Script deleted: ${name}`;
            return true;
        } catch (e) {
            consoleOutput.textContent = `> Error deleting script: ${e.message}`;
            return false;
        }
    };
    
    const renderScriptsList = () => {
        const scripts = loadScriptsFromFolder();
        scriptsList.innerHTML = '';
        
        if (scripts.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.textContent = fs && path ? 'No saved scripts' : 'File system not available';
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
                consoleOutput.textContent = `> Script loaded: ${script.name}\n> Path: ${script.path}`;
            });
            
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (deleteScriptFile(script.name)) {
                    renderScriptsList();
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
        
        if (saveScriptToFile(name, code)) {
            renderScriptsList();
        }
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
    
    // Try to load Node modules on initialization
    const modulesLoaded = getNodeModules();
    
    if (!modulesLoaded) {
        consoleOutput.textContent = '> Warning: Node.js modules not available\n> File save/load features will not work\n> Please ensure you\'re running in Discord desktop client';
    } else {
        consoleOutput.textContent = '> Scripts tab ready!\n> File system access: OK\n> You can now create and save scripts';
    }
    
    // Initial render
    renderScriptsList();
};

const observer = new MutationObserver(() => {
    createScriptsTab();
});
observer.observe(document.body, { childList: true, subtree: true });

// Initial call
createScriptsTab();
