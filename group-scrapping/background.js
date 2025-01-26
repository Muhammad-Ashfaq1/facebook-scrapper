chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'download') {
        try {
            const blob = new Blob([message.data], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            chrome.downloads.download({
                url: url,
                filename: message.filename || 'facebook_group_data.csv',
                saveAs: true
            });
        } catch (error) {
            console.error('Download error:', error);
            sendResponse({ success: false, error: error.message });
        }
    } else if (message.action === 'complete' || message.action === 'error') {
        // Update the popup with the status if it's open
        chrome.runtime.sendMessage(message);
    }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Facebook Groups Extractor installed');
}); 