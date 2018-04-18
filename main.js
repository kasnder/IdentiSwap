console.log('Booting IdentiSwap..');
console.log('maxResults: ' + maxResults); // maxResults setting, injected from loader.js
console.log('newItemsTitle: ' + newItemsTitle); // newItemsTitle localisation, injected from loader.js

// Setup DOM elements
let items = undefined;
let newItems = undefined;
let newItemsHeader = '<div id="upnext" class="ytd-compact-autoplay-renderer" style="padding-bottom: 12px;">' + newItemsTitle + '</div>';

// Add loaded, unbiased video suggestions to DOM
function addItems(results) {
  // Add container for unbiased video suggestions
  if (!newItems) {
    items.insertAdjacentHTML('beforebegin', '<div id="newItems"></div>');
    newItems = document.getElementById('newItems');
  }
  newItems.innerHTML = newItemsHeader; // show title for container

  // Use Polymer library of YouTube to add all suggestions to page
  for (i = 0; i < results.length && i < maxResults; i++) {
      let entry = results[i];
      var videoElement, videoData; // Polymer library of YouTube will load videoData into videoElement

      // Fill video element and data, TODO: Check for additional video types
      if (entry.compactAutoplayRenderer) {
        entry = entry.compactAutoplayRenderer.contents[0];
      }
      if (entry.compactRadioRenderer) {
        videoData = entry.compactRadioRenderer;
        videoElement = document.createElement('ytd-compact-radio-renderer');
      }
      if (entry.compactVideoRenderer) {
        videoData = entry.compactVideoRenderer;
        videoElement = document.createElement('ytd-compact-video-renderer');
      }

      // Finally, add new video element
      if (videoElement) {        
        videoElement.data = videoData;
        videoElement.className = "style-scope ytd-watch-next-secondary-results-renderer";
        newItems.appendChild(videoElement);
      }
  }
}

// Hide header for unbiased results
function resetItems() {
  if (newItems) {
    newItems.innerHTML = "";
  }  
}

// Load unbiased video suggestions
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