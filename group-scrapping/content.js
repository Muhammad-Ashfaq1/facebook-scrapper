let isScrapingActive = false;
let members = [];

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startMemberScraping') {
        console.log('Received scraping request');
        startMemberScraping(message.url).then(result => {
            console.log('Scraping result:', result);
            sendResponse(result);
        }).catch(error => {
            console.error('Scraping error:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true; // Keep the message channel open for async response
    } else if (message.action === 'extractPosts') {
        const data = extractPostsInfo();
        sendResponse({ success: true, data });
    }
});

async function startMemberScraping(url) {
    if (isScrapingActive) {
        throw new Error('Scraping already in progress');
    }

    // Check if we're on a members page
    const isMembersPage = url.includes('/members') || 
                         document.querySelector('div[role="main"]') !== null;

    if (!isMembersPage) {
        // If not on members page, try to find and click the members tab
        const membersLink = Array.from(document.querySelectorAll('a'))
            .find(a => a.textContent.includes('Members'));
        
        if (membersLink) {
            membersLink.click();
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for navigation
        } else {
            throw new Error('Please navigate to the members page');
        }
    }

    isScrapingActive = true;
    members = [];

    try {
        await scrapeMembers();
        chrome.storage.local.set({ groupData: members });
        return { success: true, data: members };
    } catch (error) {
        console.error('Scraping error:', error);
        throw error;
    } finally {
        isScrapingActive = false;
    }
}

async function scrapeMembers() {
    let lastHeight = 0;
    const maxScrolls = 30; // Increased for more members
    let scrollCount = 0;

    while (scrollCount < maxScrolls) {
        // Updated selectors for PIAIC group structure
        const memberElements = document.querySelectorAll(
            'div[role="main"] div.x1y1aw1k div.x1qjc9v5:not([data-processed="true"])'
        );

        for (const element of memberElements) {
            try {
                element.setAttribute('data-processed', 'true');

                // Extract member information with more specific selectors
                const nameLink = element.querySelector('span.x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.xudqn12.x676frb.x1lkfr7t.x1lbecb7.x1s688f.xzsf02u');
                if (!nameLink) continue;

                const name = nameLink.textContent.trim();
                const profileLink = element.querySelector('a[role="link"]');
                const profileUrl = profileLink ? profileLink.href : '';

                // Get additional information (like join date, badges, etc)
                const infoSpans = element.querySelectorAll('span.x193iq5w');
                const additionalInfo = Array.from(infoSpans)
                    .map(span => span.textContent.trim())
                    .filter(text => text && text !== name)
                    .join(' | ');

                // Get profile image with updated selector
                const img = element.querySelector('img.x1rg5ohu.x1n2onr6');
                const profileImage = img ? img.src : null;

                // Add member if not already in list
                if (!members.some(m => m.profileUrl === profileUrl)) {
                    members.push({
                        name,
                        profileUrl,
                        additionalInfo: additionalInfo || 'N/A',
                        profileImage,
                        extractedAt: new Date().toISOString(),
                        groupName: 'PIAIC', // Added group name
                        memberCount: document.querySelector('span.x193iq5w.xeuugli')?.textContent || 'N/A'
                    });
                }
            } catch (error) {
                console.error('Error processing member:', error);
            }
        }

        // Scroll with smoother behavior
        window.scrollBy(0, 500);
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Check if we've reached the bottom
        if (document.body.scrollHeight === lastHeight) {
            // Try one more time with alternative selectors
            const alternativeElements = document.querySelectorAll(
                'div[role="main"] div.x78zum5:not([data-processed="true"])'
            );
            if (alternativeElements.length === 0) {
                break;
            }
        }

        lastHeight = document.body.scrollHeight;
        scrollCount++;

        // Update progress in popup
        chrome.runtime.sendMessage({
            action: 'progress',
            message: `Extracted ${members.length} members... (Scroll ${scrollCount}/${maxScrolls})`
        });
    }

    return members;
}

function downloadCSV() {
    if (members.length === 0) {
        chrome.runtime.sendMessage({ 
            action: 'error', 
            message: 'No members were found to export' 
        });
        return;
    }

    const csvContent = [
        ['Name', 'Profile URL', 'Additional Info', 'Profile Image URL'],
        ...members.map(member => [
            member.name,
            member.profileUrl,
            member.additionalInfo,
            member.profileImage
        ])
    ].map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');

    // Send the CSV content to background script for download
    chrome.runtime.sendMessage({ 
        action: 'download', 
        data: csvContent,
        filename: `facebook_members_${new Date().toISOString().split('T')[0]}.csv`
    });

    chrome.runtime.sendMessage({ 
        action: 'complete', 
        message: `Successfully scraped ${members.length} members!` 
    });
}

function extractPostsInfo() {
    const posts = [];
    const postElements = document.querySelectorAll('[data-ad-preview="message"]');
    
    postElements.forEach(element => {
        const authorElement = element.closest('div[role="article"]').querySelector('h2 a');
        const contentElement = element.querySelector('div[data-ad-comet-preview="message"]');
        
        if (authorElement && contentElement) {
            posts.push({
                author: authorElement.textContent,
                content: contentElement.textContent,
                timestamp: new Date().toISOString()
            });
        }
    });

    chrome.storage.local.set({ groupData: posts });
    return posts;
} 