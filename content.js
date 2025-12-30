// Content script to insert prompts into AI chat interfaces

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'insertPrompt') {
    const success = insertPromptIntoTextarea(request.prompt);
    sendResponse({ success: success });
  }
  return true;
});

function insertPromptIntoTextarea(prompt) {
  // Updated selectors for current AI platforms (as of 2025)
  const selectors = [
    // ChatGPT selectors (multiple versions)
    '#prompt-textarea',
    'textarea[data-id="root"]',
    'textarea[placeholder*="Message"]',
    'textarea[placeholder*="message"]',
    'textarea.m-0',
    
    // Claude selectors
    'div[contenteditable="true"][role="textbox"]',
    'div[contenteditable="true"]',
    
    // Gemini selectors
    'div.ql-editor[contenteditable="true"]',
    'textarea[aria-label*="prompt"]',
    
    // Generic fallbacks
    'textarea',
    'input[type="text"]'
  ];

  let element = null;
  
  // Try each selector
  for (const selector of selectors) {
    element = document.querySelector(selector);
    if (element && isVisible(element)) {
      break;
    }
  }

  if (!element) {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(prompt);
    showNotification('Prompt copied to clipboard! Paste it into the chat.');
    return false;
  }

  // Insert the prompt
  try {
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
      // For textarea/input elements
      element.value = prompt;
      
      // Trigger events to make the platform recognize the change
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
      element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
      
    } else if (element.contentEditable === 'true') {
      // For contenteditable divs (Claude, Gemini)
      element.textContent = prompt;
      
      // Trigger input events
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Set cursor to end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(element);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    // Focus the element
    element.focus();
    
    // Show success notification
    showNotification('✓ Prompt inserted! You can edit it before sending.');
    return true;
    
  } catch (error) {
    console.error('Error inserting prompt:', error);
    navigator.clipboard.writeText(prompt);
    showNotification('Prompt copied to clipboard! Paste it into the chat.');
    return false;
  }
}

function isVisible(element) {
  return element.offsetWidth > 0 && 
         element.offsetHeight > 0 && 
         window.getComputedStyle(element).display !== 'none';
}

function showNotification(message) {
  // Remove any existing notifications
  const existing = document.querySelector('.promptvault-notification');
  if (existing) {
    existing.remove();
  }

  const notification = document.createElement('div');
  notification.className = 'promptvault-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    animation: promptvault-slideIn 0.3s ease-out;
    max-width: 300px;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'promptvault-slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add CSS animations
if (!document.getElementById('promptvault-styles')) {
  const style = document.createElement('style');
  style.id = 'promptvault-styles';
  style.textContent = `
    @keyframes promptvault-slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes promptvault-slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}
