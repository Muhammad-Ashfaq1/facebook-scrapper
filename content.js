// Function to inject script into the page context
function injectScript(code) {
    const script = document.createElement('script');
    script.textContent = code;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "injectMainScript") {
        injectScript(request.code);
        console.log('%c Script injected successfully! ', 'background: #4BB543; color: white; font-size: 14px; font-weight: bold; padding: 4px;');
        console.log('Start scrolling the members list to extract data...');
        sendResponse({success: true});
    }
}); 