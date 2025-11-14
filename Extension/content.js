// GHCM Extension - GitHub Clone Manager
// Converts HTTPS clone URLs to GHCM commands

(function() {
    'use strict';
    
    // Wait for page to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGHCM);
    } else {
        initGHCM();
    }
    
    function initGHCM() {
        console.log('GHCM Extension: Initializing...');
        
        // Check if we're on a repository page
        if (!isRepositoryPage()) {
            console.log('GHCM Extension: Not on repository page');
            return;
        }
        
        console.log('GHCM Extension: On repository page, modifying clone section...');
        
        // Find and modify clone section
        modifyCloneSection();
        
        // Watch for dynamic changes
        observeChanges();
    }
    
    function isRepositoryPage() {
        // Check if URL matches repository pattern
        const pathParts = window.location.pathname.split('/').filter(part => part);
        return pathParts.length >= 2 && !pathParts.includes('orgs') && !pathParts.includes('settings');
    }
    
    function getRepositoryInfo() {
        const pathParts = window.location.pathname.split('/').filter(part => part);
        if (pathParts.length >= 2) {
            return {
                owner: pathParts[0],
                repo: pathParts[1]
            };
        }
        return null;
    }
    
    function modifyCloneSection() {
        // Wait for clone section to load
        const checkForCloneSection = () => {
            console.log('GHCM Extension: Checking for clone section...');
            
            // Find HTTPS input field with multiple selectors
            const httpsInput = document.querySelector('input[value*="https://github.com"]') ||
                             document.querySelector('input[readonly][value*=".git"]') ||
                             document.querySelector('#clone-url');
            
            console.log('GHCM Extension: Found input:', httpsInput);
            
            if (httpsInput && httpsInput.value.includes('github.com')) {
                console.log('GHCM Extension: Adding GHCM option...');
                addGHCMOption(httpsInput);
                return true;
            }
            return false;
        };
        
        // Try immediately
        if (!checkForCloneSection()) {
            // Try again after a delay
            setTimeout(() => {
                if (!checkForCloneSection()) {
                    // Set up observer for dynamic content
                    const observer = new MutationObserver((mutations) => {
                        mutations.forEach((mutation) => {
                            mutation.addedNodes.forEach((node) => {
                                if (node.nodeType === 1) {
                                    const httpsInput = node.querySelector?.('input[value*="https://github.com"]') ||
                                                     node.querySelector?.('input[readonly][value*=".git"]');
                                    if (httpsInput && httpsInput.value.includes('github.com')) {
                                        addGHCMOption(httpsInput);
                                    }
                                }
                            });
                        });
                    });
                    
                    observer.observe(document.body, { childList: true, subtree: true });
                }
            }, 1000);
        }
    }
    
    function addGHCMOption(httpsInput) {
        // Check if GHCM option already exists
        if (document.querySelector('.ghcm-button')) {
            return;
        }
        
        const repoInfo = getRepositoryInfo();
        if (!repoInfo) return;
        
        const ghcmCommand = `ghcm ${repoInfo.owner}/${repoInfo.repo}`;
        
        // Find the tab container
        let tabContainer = httpsInput.closest('div');
        while (tabContainer && !tabContainer.querySelector('[role="tablist"]')) {
            tabContainer = tabContainer.parentElement;
            if (!tabContainer || tabContainer === document.body) break;
        }
        
        if (!tabContainer) return;
        
        const tabList = tabContainer.querySelector('[role="tablist"]');
        if (!tabList) return;
        
        // Create GHCM button in the empty space
        const ghcmButton = createGHCMButton(ghcmCommand);
        
        // Find the empty space after GitHub CLI tab
        const cliTab = Array.from(tabList.querySelectorAll('[role="tab"]')).find(tab => 
            tab.textContent.includes('GitHub CLI') || tab.textContent.includes('CLI')
        );
        
        if (cliTab) {
            // Insert after CLI tab
            cliTab.parentNode.insertBefore(ghcmButton, cliTab.nextSibling);
        } else {
            // Append to tab list
            tabList.appendChild(ghcmButton);
        }
    }
    
    function createStandaloneGHCMSection(httpsInput, ghcmCommand) {
        // Create a standalone GHCM section next to the input
        const ghcmSection = document.createElement('div');
        ghcmSection.className = 'ghcm-standalone-section';
        ghcmSection.style.cssText = `
            margin-top: 12px;
            padding: 12px;
            border: 1px solid var(--color-border-default);
            border-radius: 6px;
            background-color: var(--color-canvas-subtle);
        `;
        
        ghcmSection.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 16px;">⚡</span>
                <strong>GHCM Command</strong>
            </div>
            <div style="display: flex; gap: 8px;">
                <input type="text" value="${ghcmCommand}" readonly style="
                    flex: 1;
                    padding: 6px 8px;
                    border: 1px solid var(--color-border-default);
                    border-radius: 4px;
                    background: var(--color-canvas-default);
                    font-family: monospace;
                    font-size: 14px;
                " />
                <button class="ghcm-copy-standalone" style="
                    padding: 6px 12px;
                    border: 1px solid var(--color-border-default);
                    border-radius: 4px;
                    background: var(--color-btn-bg);
                    cursor: pointer;
                ">Copy</button>
            </div>
        `;
        
        // Insert after the input's parent container
        const insertTarget = httpsInput.closest('div[class*="input"]') || httpsInput.parentElement;
        insertTarget.parentNode.insertBefore(ghcmSection, insertTarget.nextSibling);
        
        // Add copy functionality
        const copyBtn = ghcmSection.querySelector('.ghcm-copy-standalone');
        const input = ghcmSection.querySelector('input');
        
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(ghcmCommand);
                copyBtn.textContent = 'Copied!';
                copyBtn.style.color = 'var(--color-success-fg)';
                
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                    copyBtn.style.color = '';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
        
        input.addEventListener('click', () => {
            input.select();
        });
    }
    
    function createGHCMButton(ghcmCommand) {
        const button = document.createElement('button');
        button.className = 'ghcm-button';
        button.innerHTML = `
            <span class="ghcm-icon">⚡</span>
            <span>GHCM</span>
        `;
        
        button.style.cssText = `
            background: linear-gradient(135deg, #4a90e2, #357abd);
            border: none;
            padding: 6px 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: white;
            border-radius: 6px;
            transition: all 0.2s;
            font-weight: 500;
            position: relative;
            margin-left: 8px;
            box-shadow: 0 2px 4px rgba(74, 144, 226, 0.2);
        `;
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'ghcm-tooltip';
        tooltip.textContent = 'Click to copy GHCM command';
        tooltip.style.cssText = `
            position: absolute;
            top: -35px;
            left: 50%;
            transform: translateX(-50%);
            background: #24292f;
            color: white;
            padding: 6px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s;
            z-index: 1000;
        `;
        
        // Add arrow to tooltip
        const arrow = document.createElement('div');
        arrow.style.cssText = `
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 5px solid #24292f;
        `;
        tooltip.appendChild(arrow);
        button.appendChild(tooltip);
        
        // Hover effects
        button.addEventListener('mouseenter', () => {
            button.style.background = 'linear-gradient(135deg, #357abd, #2968a3)';
            button.style.transform = 'translateY(-1px)';
            button.style.boxShadow = '0 4px 8px rgba(74, 144, 226, 0.3)';
            tooltip.style.opacity = '1';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.background = 'linear-gradient(135deg, #4a90e2, #357abd)';
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 2px 4px rgba(74, 144, 226, 0.2)';
            tooltip.style.opacity = '0';
        });
        
        // Click handler - copy command
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            try {
                await navigator.clipboard.writeText(ghcmCommand);
                
                // Success feedback
                const originalText = button.innerHTML;
                button.innerHTML = `
                    <span>✓</span>
                    <span>Copied!</span>
                `;
                button.style.background = 'linear-gradient(135deg, #28a745, #1e7e34)';
                tooltip.textContent = 'Copied to clipboard!';
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.background = 'linear-gradient(135deg, #4a90e2, #357abd)';
                    tooltip.textContent = 'Click to copy GHCM command';
                }, 2000);
                
            } catch (err) {
                console.error('Failed to copy GHCM command:', err);
                
                // Error feedback
                button.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
                tooltip.textContent = 'Copy failed';
                
                setTimeout(() => {
                    button.style.background = 'linear-gradient(135deg, #4a90e2, #357abd)';
                    tooltip.textContent = 'Click to copy GHCM command';
                }, 2000);
            }
        });
        
        return button;
    }
    
    function createGHCMTab() {
        const tab = document.createElement('button');
        tab.className = 'ghcm-tab';
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', 'false');
        tab.innerHTML = `
            <span class="ghcm-icon">⚡</span>
            <span>GHCM</span>
        `;
        tab.style.cssText = `
            background: none;
            border: none;
            padding: 8px 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            color: var(--color-fg-muted);
            border-radius: 6px;
            transition: all 0.2s;
        `;
        
        // Hover effect
        tab.addEventListener('mouseenter', () => {
            tab.style.backgroundColor = 'var(--color-neutral-muted)';
            tab.style.color = 'var(--color-fg-default)';
        });
        
        tab.addEventListener('mouseleave', () => {
            if (!tab.classList.contains('active')) {
                tab.style.backgroundColor = 'transparent';
                tab.style.color = 'var(--color-fg-muted)';
            }
        });
        
        return tab;
    }
    
    function createGHCMPanel(command) {
        const panel = document.createElement('div');
        panel.className = 'ghcm-panel';
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-hidden', 'true');
        panel.style.display = 'none';
        
        panel.innerHTML = `
            <div class="ghcm-content">
                <div class="ghcm-header">
                    <span class="ghcm-logo">⚡ GHCM</span>
                    <span class="ghcm-subtitle">GitHub Clone Manager</span>
                </div>
                <div class="ghcm-input-group">
                    <input type="text" value="${command}" readonly class="ghcm-input" />
                    <button class="ghcm-copy-btn" data-command="${command}">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path>
                            <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 16h-7.5A1.75 1.75 0 015 14.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path>
                        </svg>
                    </button>
                </div>
                <div class="ghcm-info">
                    <p>Use this command in your terminal to clone with GHCM:</p>
                    <ul>
                        <li>✨ Beautiful progress indicators</li>
                        <li>🌍 Multi-language support</li>
                        <li>⚡ Faster than traditional git clone</li>
                    </ul>
                </div>
            </div>
        `;
        
        // Add copy functionality
        const copyBtn = panel.querySelector('.ghcm-copy-btn');
        const input = panel.querySelector('.ghcm-input');
        
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(command);
                
                // Visual feedback
                copyBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path>
                    </svg>
                `;
                copyBtn.style.color = 'var(--color-success-fg)';
                
                setTimeout(() => {
                    copyBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path>
                            <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 16h-7.5A1.75 1.75 0 015 14.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path>
                        </svg>
                    `;
                    copyBtn.style.color = '';
                }, 2000);
                
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
        
        // Click to select all
        input.addEventListener('click', () => {
            input.select();
        });
        
        return panel;
    }
    
    function observeChanges() {
        // Watch for navigation changes (GitHub uses PJAX)
        let currentUrl = window.location.href;
        
        const observer = new MutationObserver(() => {
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                setTimeout(initGHCM, 500);
            }
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
})();
