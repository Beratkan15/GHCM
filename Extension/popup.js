// GHCM Extension Popup Script

document.addEventListener('DOMContentLoaded', async () => {
    const statusElement = document.getElementById('status');
    const statusText = document.getElementById('status-text');
    
    try {
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab.url && tab.url.includes('github.com')) {
            // Check if it's a repository page
            const url = new URL(tab.url);
            const pathParts = url.pathname.split('/').filter(part => part);
            
            if (pathParts.length >= 2 && !pathParts.includes('orgs') && !pathParts.includes('settings')) {
                statusElement.className = 'status active';
                statusText.textContent = `✅ Active on ${pathParts[0]}/${pathParts[1]}`;
            } else {
                statusElement.className = 'status inactive';
                statusText.textContent = '⚠️ Navigate to a GitHub repository';
            }
        } else {
            statusElement.className = 'status inactive';
            statusText.textContent = '❌ Not on GitHub.com';
        }
    } catch (error) {
        statusElement.className = 'status inactive';
        statusText.textContent = '❌ Unable to check page';
        console.error('Error checking tab:', error);
    }
    
    // Add click handlers for links
    document.querySelectorAll('.link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: link.href });
        });
    });
});
