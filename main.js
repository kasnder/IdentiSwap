console.log('Booting IdentiSwap..');
console.log('maxResults: ' + maxResults); // Output maxResults, injected from loaded.js
console.log('newItemsTitle: ' + newItemsTitle); // Output newItemsTitle, injected from loaded.js

// Setup references to DOM
let items = undefined;
let newItems = undefined;

// Add unpersonalised video suggestions to DOM
let newItemsHeader = '<div id="upnext" class="ytd-compact-autoplay-renderer" style="padding-bottom: 12px;">' + newItemsTitle + '</div>';
function addItems(results) {
  // Create box for unpersonalised video suggestions, above usual video suggestions
  // We add this box in this function, to separate the parsing logic from the loading logic of video suggestions
  if (!newItems) { // assert: items !== undefined
    items.insertAdjacentHTML('beforebegin', '<div id="newItems"></div>'); // may fail if #items does not exist yet
    newItems = document.getElementById('newItems');
  }

  // Add header for unpersonalised suggestions
  newItems.innerHTML = newItemsHeader;

  // Add amended suggestions to DOM
  for (i = 0; i < results.length && i < maxResults; i++) {
      var newVideo, params;
      let entry = results[i];

      // Parse video type and create new video element
      // TODO: Check for additional video types
      if (entry.compactAutoplayRenderer) {
        entry = entry.compactAutoplayRenderer.contents[0];
      }
      if (entry.compactRadioRenderer) {
        params = entry.compactRadioRenderer;
        newVideo = document.createElement('ytd-compact-radio-renderer');
      }
      if (entry.compactVideoRenderer) {
        params = entry.compactVideoRenderer;
        newVideo = document.createElement('ytd-compact-video-renderer');
      }

      // Add new video element
      if (newVideo) {        
        newVideo.data = params;
        newVideo.className = "style-scope ytd-watch-next-secondary-results-renderer";
        newItems.appendChild(newVideo);
      }
  }
}

// Hide header for unpersonalised results
// TODO: Use display CSS property..
function resetItems() {
  if (newItems) {
    newItems.innerHTML = "";
  }  
}

// Load unpersonalised video suggestions
function loadSuggestions(vid) {
  // Create unique URL that may be intercepted by background.js to remove cookies
  let url = new URL("https://www.youtube.com/watch");
  url.searchParams.append('v', vid);

  // Fetch video results without cookies
  let xhr = new XMLHttpRequest();
  xhr.onload = function() {
    console.log("Success!");
    let pattern = /window\[\"ytInitialData\"\] = (.+);\n/;
    let raw     = pattern.exec(this.responseText)[1]; // RegEx + Remove header/trailer to yield pure JSON
    let data    = JSON.parse(raw);
    let results = data.contents.twoColumnWatchNextResults.secondaryResults.secondaryResults.results;
    
    addItems(results);
  }
  xhr.onerror = function() {
      console.log("Loading failed!");
  }
  xhr.timeout = 10000;
  xhr.open("GET", url.href + '#');
  xhr.send();
}

let curUrl = ''; // Keep track of current URL to detect video changes
function monitorNavigated() {
  if (curUrl != window.location.href) {
    resetItems();
    let params = (new URL(location)).searchParams;
    let vid = params.get('v');
    if (!items) {
      items = document.querySelector("ytd-watch #related #items");
    }

    // Wait for video suggestions to load..    
    if (vid && !items) { // Ensure that there have already been video suggestions loaded
      console.log('Waiting for video suggestions to load until action');
      return;
    }

    console.log('Loaded new page '+ curUrl);
    curUrl = window.location.href; // Update only if suggestions fully or not on video page

    // Check if on video page
    if (!vid) {
      console.log('NOT on video page');
      return;
    }
    console.log('vid: ' + vid);

    loadSuggestions(vid);
  }
}

if (maxResults <= 0) {
	console.log("maxResults set to <= 0. Disabled extension for now.");
} else {
	// Check for changes every now and then
	// TODO: Listen for events instead
	let t = setInterval(monitorNavigated, 1000);
}