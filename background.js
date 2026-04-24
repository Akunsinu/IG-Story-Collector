/**
 * Background Service Worker
 * - Strips CSP from Instagram responses so the MAIN-world content script
 *   can pull cross-origin media into a canvas without being blocked.
 * - Relays download requests from the bridge to chrome.downloads.
 */

function installRules() {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2],
    addRules: [
      {
        id: 1,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          responseHeaders: [
            { header: 'Content-Security-Policy', operation: 'remove' },
            { header: 'Content-Security-Policy-Report-Only', operation: 'remove' }
          ]
        },
        condition: {
          urlFilter: '*://www.instagram.com/*',
          resourceTypes: ['main_frame', 'sub_frame']
        }
      },
      {
        id: 2,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          responseHeaders: [
            { header: 'Content-Security-Policy', operation: 'remove' }
          ]
        },
        condition: {
          urlFilter: '*://*.cdninstagram.com/*',
          resourceTypes: ['xmlhttprequest', 'media', 'image']
        }
      }
    ]
  }).then(function() {
    console.log('[Story POC] CSP rules installed');
  }).catch(function(err) {
    console.error('[Story POC] Failed to install CSP rules:', err);
  });
}

chrome.runtime.onInstalled.addListener(installRules);
chrome.runtime.onStartup.addListener(installRules);

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action !== 'download') return;

  chrome.downloads.download({
    url: message.url,
    filename: message.filename,
    saveAs: false
  }, function(downloadId) {
    var err = chrome.runtime.lastError;
    sendResponse({ success: !err && downloadId != null, downloadId: downloadId });
  });
  return true;
});

console.log('[Story POC] Background worker ready');
