document.addEventListener('DOMContentLoaded', function() {
  const extractMembersBtn = document.getElementById('extractMembers');
  const extractPostsBtn = document.getElementById('extractPosts');
  const downloadCSVBtn = document.getElementById('downloadCSV');
  const statusDiv = document.getElementById('status');
  const loader = document.getElementById('loader');

  function setLoading(isLoading) {
    loader.style.display = isLoading ? 'block' : 'none';
    extractMembersBtn.disabled = isLoading;
    extractPostsBtn.disabled = isLoading;
    downloadCSVBtn.disabled = isLoading;
  }

  extractMembersBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('facebook.com/groups/')) {
        statusDiv.textContent = 'Please navigate to a Facebook group first!';
        return;
      }

      setLoading(true);
      statusDiv.textContent = 'Initializing extraction...';

      // First, inject the content script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      // Then send the message to start scraping
      const response = await chrome.tabs.sendMessage(tab.id, { 
        action: 'startMemberScraping',
        url: tab.url
      });

      if (response && response.success) {
        statusDiv.textContent = `Successfully extracted ${response.data.length} members!`;
      } else {
        statusDiv.textContent = response ? response.error : 'Error during extraction';
      }
    } catch (error) {
      console.error('Extraction error:', error);
      statusDiv.textContent = 'Error: Could not extract members. Make sure you are on the members page.';
    } finally {
      setLoading(false);
    }
  });

  extractPostsBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('facebook.com/groups')) {
      statusDiv.textContent = 'Please navigate to a Facebook group first!';
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractPostsInfo
    });
    
    statusDiv.textContent = 'Extracting posts...';
  });

  downloadCSVBtn.addEventListener('click', () => {
    chrome.storage.local.get(['groupData'], function(result) {
      if (result.groupData) {
        const csv = convertToCSV(result.groupData);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({
          url: url,
          filename: 'facebook_group_data.csv'
        });
      } else {
        statusDiv.textContent = 'No data to download. Extract data first!';
      }
    });
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'progress') {
      statusDiv.textContent = message.message;
    }
  });
});

function convertToCSV(data) {
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return `"${value}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
} 