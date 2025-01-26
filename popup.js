// Check if current page is a Facebook group page
async function checkFacebookGroup() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isFacebookGroup = tab.url.includes('facebook.com/groups/');
  
  const button = document.getElementById('startExtract');
  const status = document.getElementById('status');
  
  if (isFacebookGroup) {
    button.disabled = false;
    status.textContent = 'Ready to extract members';
    status.classList.remove('error');
  } else {
    button.disabled = true;
    status.textContent = 'Please navigate to a Facebook group page';
    status.classList.add('error');
  }
}

// Inject the scraper script
async function injectScript() {
  try {
    // Send message to background script to inject the main script
    await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: "injectScript" },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else if (response && response.success) {
            resolve();
          } else {
            reject(new Error('Script injection failed'));
          }
        }
      );
    });

    // Update popup status
    const status = document.getElementById('status');
    status.textContent = 'Script injected successfully! Check console for details.';
    status.style.color = '#4BB543';

    // Close popup after 2 seconds
    setTimeout(() => {
      window.close();
    }, 2000);

  } catch (error) {
    const status = document.getElementById('status');
    status.textContent = 'Error: ' + error.message;
    status.classList.add('error');
  }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', checkFacebookGroup);

document.getElementById('startExtract').addEventListener('click', async () => {
  const status = document.getElementById('status');
  status.textContent = 'Injecting script...';
  await injectScript();
}); 