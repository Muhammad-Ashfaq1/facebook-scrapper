// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkFacebookGroup") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const url = tabs[0].url;
      const isFacebookGroup = url.includes('facebook.com/groups/');
      sendResponse({isFacebookGroup});
    });
    return true;
  }
  
  if (request.action === "injectScript") {
    chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
      const tab = tabs[0];
      
      // First inject the script tag
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const script = document.createElement('script');
          script.src = chrome.runtime.getURL('main.min.js');
          (document.head || document.documentElement).appendChild(script);
          
          console.clear();
          console.log('%c Facebook Group Members Extractor ', 'background: #1877f2; color: white; font-size: 16px; font-weight: bold; padding: 4px;');
          console.log('Script injected successfully!');
          console.log('Start scrolling the members list to extract data...');
        }
      });

      sendResponse({success: true});
    });
    return true;
  }
}); 