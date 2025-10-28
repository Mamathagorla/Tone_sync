// content.js for ToneSync Extension
// Injected on all web pages as specified in manifest.json

console.log('[ToneSync] Content script loaded');

// Helper function to get selected text from user
function getSelectedText() {
    return window.getSelection().toString();
}

// Listen for messages from popup/background scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_SELECTION') {
        // Popup requests selected text
        const selectedText = getSelectedText();
        sendResponse({text: selectedText});
    }
    if (message.type === 'REWRITE_TEXT') {
        // Attempt to rewrite the selected text using AI (call background for API)
        // Optionally show a spinner or overlay here
        const selectedText = getSelectedText();
        // You can signal to background to process it
        chrome.runtime.sendMessage({
            type: 'REWRITE_REQUEST',
            text: selectedText,
            tone: message.tone,        // e.g., 'professional', 'casual', etc.
            audience: message.audience // e.g., 'general', 'technical', etc.
        }, response => {
            // Optionally replace selection on page or show a tooltip/alert
            if(response && response.rewrittenText) {
                // Attempt replacing text on page
                document.execCommand('insertText', false, response.rewrittenText);
                alert('Text rewritten: ' + response.rewrittenText);
            }
        });
        sendResponse({status: 'Rewrite request sent'});
    }
    return true;
});

// Optionally, listen for user mouseup events to inform popup about new selections
document.addEventListener('mouseup', () => {
    const selectedText = getSelectedText();
    if(selectedText.length > 0) {
        chrome.runtime.sendMessage({
            type: 'TEXT_SELECTED',
            text: selectedText
        });
    }
});

// Option: inject a custom context menu for instant rewrite (requires manifest permissions)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message.type === 'SHOW_CONTEXT_MENU') {
        // Placeholder: context menus managed by background
    }
});

// For advanced features, you may add observers or DOM mutation listeners
// Example: Watch for changes to typing areas or input fields
const observer = new MutationObserver(mutations => {
    // Future: trigger tone detection or suggestions based on new text
});
observer.observe(document.body, { childList: true, subtree: true });

