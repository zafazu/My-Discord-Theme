encryption: (function() {
    'use strict';

    // ===== CONFIGURATION =====
    let encryptionKey = 42; 
    const TOKEN_MARKER = '$$';
    const USE_DELIMITERS = false; 

    // ===== UTILITY FUNCTIONS =====

    function stringToBytes(str) {
        return new TextEncoder().encode(str);
    }

    // Convert byte array to string
    function bytesToString(bytes) {
        try {
            return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        } catch (e) {
            return null; 
        }
    }

    // Base64 encoding 
    function base64Encode(bytes) {
        let binary = '';
        bytes.forEach(b => binary += String.fromCharCode(b));
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }

    // Base64 decoding 
    function base64Decode(str) {
        try {
            str = str.replace(/-/g, '+').replace(/_/g, '/');
            while (str.length % 4) str += '=';
            
            const binary = atob(str);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            return bytes;
        } catch (e) {
            return null;
        }
    }

    // Encrypt plaintext
    function encrypt(plaintext, key) {
        const bytes = stringToBytes(plaintext);
        const encrypted = new Uint8Array(bytes.length);
        
        for (let i = 0; i < bytes.length; i++) {
            encrypted[i] = (bytes[i] + key) % 256;
        }
        
        return base64Encode(encrypted);
    }

    // Decrypt payload
    function decrypt(payload, key) {
        const encryptedBytes = base64Decode(payload);
        if (!encryptedBytes) return null;
        
        const decrypted = new Uint8Array(encryptedBytes.length);
        for (let i = 0; i < encryptedBytes.length; i++) {
            decrypted[i] = (encryptedBytes[i] - key + 256) % 256;
        }
        
        return bytesToString(decrypted);
    }

    // ===== MESSAGE DETECTION & DECRYPTION =====

    function detectAndDecrypt(text) {
        if (!text || !text.includes(TOKEN_MARKER)) return text;

        const regex = USE_DELIMITERS 
            ? /\$\$\[(.+?)\]/g 
            : /\$\$([^\s]+)/g;

        return text.replace(regex, (match, payload) => {
            const decrypted = decrypt(payload, encryptionKey);
            if (decrypted !== null) {
                return `${decrypted}`;
            } else {
                return `${match}[⚠️ decryption failed]`;
            }
        });
    }

    function buildEncryptedMessage(plaintext) {
        const encrypted = encrypt(plaintext, encryptionKey);
        const formatted = USE_DELIMITERS 
            ? `${TOKEN_MARKER}[${encrypted}]` 
            : `${TOKEN_MARKER}${encrypted}`;
        return formatted;
    }

    // ===== DOM MONITORING =====

    const processedMessages = new WeakSet();

    function processMessageElement(element) {
        if (processedMessages.has(element)) return;
        processedMessages.add(element);

        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    return node.textContent.includes(TOKEN_MARKER) 
                        ? NodeFilter.FILTER_ACCEPT 
                        : NodeFilter.FILTER_SKIP;
                }
            }
        );

        const nodesToProcess = [];
        let node;
        while (node = walker.nextNode()) {
            nodesToProcess.push(node);
        }

        nodesToProcess.forEach(textNode => {
            const original = textNode.textContent;
            const decrypted = detectAndDecrypt(original);
            
            if (decrypted !== original) {
                textNode.textContent = decrypted;
            }
        });
    }

    function scanMessages() {
        const messageSelectors = [
            '[class*="messageContent"]',
            '[class*="message-"]',
            '[data-list-item-id*="chat-messages"]'
        ];

        messageSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(processMessageElement);
        });
    }

    setTimeout(scanMessages, 1000);

    // Monitor 
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // Element node
                    processMessageElement(node);
                    node.querySelectorAll('[class*="messageContent"]').forEach(processMessageElement);
                }
            });
        });
    });

    // Start 
    setTimeout(() => {
        const chatContainer = document.querySelector('[class*="chat-"]') || document.body;
        observer.observe(chatContainer, {
            childList: true,
            subtree: true
        });
    }, 1000);

    // ===== F2 KEY BINDING =====

    function findComposeBox() {
        const selectors = [
            '[class*="textArea"]',
            '[data-slate-editor="true"]',
            '[role="textbox"][contenteditable="true"]'
        ];

        for (const selector of selectors) {
            const box = document.querySelector(selector);
            if (box && box.closest('[class*="channelTextArea"]')) {
                return box;
            }
        }
        return null;
    }

    function getComposeText(composeBox) {
        return composeBox.textContent || composeBox.innerText || '';
    }

    // ===== Success UI =====
    (function initSuccessUI() {
        const containerId = 'dv-error-container';
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            Object.assign(container.style, {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                display: 'flex',
                flexDirection: 'column-reverse',
                alignItems: 'flex-end',
                gap: '8px',
                zIndex: 2147483648
            });
            document.body.appendChild(container);
        }

        window.showSuccess = function(msg, durationSeconds = 3) {
            const frame = document.createElement('div');
            Object.assign(frame.style, {
                width: '320px',
                padding: '12px',
                background: '#1e1e1e',
                color: '#fff',
                border: '1px solid #43b581',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                fontSize: '14px',
                lineHeight: '1.4',
                position: 'relative',
                overflow: 'hidden'
            });

            const msgSpan = document.createElement('span');
            msgSpan.textContent = msg;
            msgSpan.style.marginBottom = '8px';

            const closeBtn = document.createElement('button');
            closeBtn.textContent = '✕';
            Object.assign(closeBtn.style, {
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'transparent',
                border: 'none',
                color: '#43b581',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '16px'
            });
            closeBtn.onclick = () => frame.remove();

            const timerBar = document.createElement('div');
            Object.assign(timerBar.style, {
                height: '4px',
                background: '#43b581',
                width: '100%',
                transition: 'width 0.1s linear'
            });

            frame.append(msgSpan, closeBtn, timerBar);
            container.appendChild(frame);

            let duration = Math.max(1, durationSeconds);
            let elapsed = 0;
            const tick = 100;
            const interval = setInterval(() => {
                elapsed += tick / 1000;
                const widthPercent = Math.max(0, 100 - (elapsed / duration) * 100);
                timerBar.style.width = widthPercent + '%';
                if (elapsed >= duration) {
                    clearInterval(interval);
                    frame.remove();
                }
            }, tick);
        };
    })();

    document.addEventListener('keydown', async (e) => {
        if (e.key === 'F2') {
            e.preventDefault();
            
            const composeBox = findComposeBox();
            if (!composeBox) {
                console.log('[Encryption] Compose box not found');
                return;
            }

            const currentText = getComposeText(composeBox);
            
            if (!currentText.trim()) {
                console.log('[Encryption] No text to encrypt');
                return;
            }

            const encryptedMessage = buildEncryptedMessage(currentText);

            try {
                await navigator.clipboard.writeText(encryptedMessage);
                
                const originalBg = composeBox.style.backgroundColor;
                composeBox.style.backgroundColor = '#43b58144';
                
                setTimeout(() => {
                    composeBox.style.backgroundColor = originalBg;
                }, 300);
                
                if (typeof window.showSuccess === 'function') {
                    window.showSuccess('Encryption copied. Press Ctrl+V to paste.', 3);
                } else {
                    const notification = document.createElement('div');
                    notification.textContent = 'Encryption copied. Press Ctrl+V to paste.';
                    notification.style.cssText = `
                        position: fixed;
                        bottom: 80px;
                        right: 20px;
                        background: #43b581;
                        color: white;
                        padding: 12px 20px;
                        border-radius: 4px;
                        z-index: 10001;
                        font-family: Whitney, sans-serif;
                        font-size: 14px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                    `;
                    document.body.appendChild(notification);
                    setTimeout(() => notification.remove(), 3000);
                }
                
            } catch (err) {
                console.error('[Encryption] Failed to copy to clipboard:', err);
                alert('Failed to copy encrypted message. Check console.');
            }
        }
    });

    // ===== SETTINGS UI =====

    function createSettingsPanel() {
        const panel = document.createElement('div');
        panel.id = 'encryption-settings';
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2f3136;
            border: 2px solid #202225;
            border-radius: 8px;
            padding: 15px;
            z-index: 10000;
            color: #dcddde;
            font-family: Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
            display: none;
        `;

        panel.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: #fff;">Encryption</h3>
            <p style="margin-top: 10px; font-size: 12px; color: #b9bbbe;">
                Press F2 to encrypt → copies to clipboard<br>
                Then Ctrl+V to paste and send<br>
                Press Ctrl+Shift+E to toggle settings
            </p>
        `;

        document.body.appendChild(panel);

        document.getElementById('save-key')?.addEventListener('click', () => {
            const newKey = parseInt(document.getElementById('key-input')?.value);
            const newToken = document.getElementById('token-input')?.value.trim();
            
            if (!Number.isNaN(newKey) && newKey >= 0 && newKey <= 255) {
                encryptionKey = newKey;
                localStorage.setItem('discord-encryption-key', newKey);
            }
            
            if (newToken) {
                try { window.userToken = newToken; } catch (e) {}
                localStorage.setItem('discord-encryption-user-token', newToken);
            }
            
            alert(`Settings saved!\nKey: ${newKey}\nToken: ${newToken ? '***' + newToken.slice(-4) : 'Not set'}`);
        });

        document.getElementById('close-settings')?.addEventListener('click', () => {
            panel.style.display = 'none';
        });

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'E') {
                e.preventDefault();
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            }
        });
    }

  
    const savedKey = localStorage.getItem('discord-encryption-key');
    if (savedKey !== null) {
        encryptionKey = parseInt(savedKey);
    }


    setTimeout(createSettingsPanel, 2000);

})();
