/**
 * Bridge script - runs in ISOLATED world
 * Relays download requests from the MAIN-world content script to the service worker.
 */

window.addEventListener('message', function(event) {
  if (event.source !== window) return;
  if (!event.data || event.data.type !== 'STORY_POC_DOWNLOAD') return;

  var filename = event.data.filename;

  chrome.runtime.sendMessage({
    action: 'download',
    url: event.data.url,
    filename: filename
  }, function(response) {
    window.postMessage({
      type: 'STORY_POC_DOWNLOAD_RESPONSE',
      success: !!(response && response.success),
      filename: filename
    }, '*');
  });
});

console.log('[Story POC Bridge] Ready');
