// Background service worker for the extension

chrome.runtime.onInstalled.addListener(() => {
    console.log('PromptVault extension installed');

    // Create context menu
    chrome.contextMenus.create({
        id: 'insertPrompt',
        title: 'Insert AI Prompt',
        contexts: ['editable']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'insertPrompt') {
        // Open popup to select prompt
        chrome.action.openPopup();
    }
});
