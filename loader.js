// Inject main.js into YouTube page
const s = document.createElement('script');
s.src = chrome.runtime.getURL('main.js');
s.onload = () => s.remove();
(document.head || document.documentElement).append(s);