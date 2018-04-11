// Load maxResults setting
chrome.storage.local.get(['maxresults'], function(result) {
  // Check if loading successful, else use fallback
  let maxResults = 3;
  if (result.maxresults) {
  	maxResults = parseInt(result.maxresults);
  }

  // Inject maxResults + localisation into main.js
  let newItemsTitle = chrome.i18n.getMessage("newItemsTitle"); // provides localisation
  let actualCode = `let maxResults = ${ maxResults }; let newItemsTitle = "${ newItemsTitle }";`;
  let script = document.createElement('script');
  script.textContent = actualCode;
  (document.head||document.documentElement).appendChild(script);
  script.remove(); // TODO: Is onload required, as below?

  // Inject main.js into YouTube page
  // This is required to interact with YouTube's Polymere and display video suggestions nicely
  script = document.createElement('script');
  script.src = chrome.extension.getURL('main.js');
  (document.head||document.documentElement).appendChild(script);
  script.onload = function() {
      script.parentNode.removeChild(script);
  };
});