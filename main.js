// Setup DOM elements
let items = undefined;
let newItems = undefined;
let newItemsHeader =
    '<div id="upnext" class="ytd-compact-autoplay-renderer" style="padding-bottom: 12px;">' +
    newItemsTitle +
    '</div>';
let newItemsFooter =
    '<div id="upnext" class="ytd-compact-autoplay-renderer" style="padding-bottom: 12px;">' +
    oldItemsTitle +
    '</div>';

// Add loaded, unbiased video suggestions to DOM
function addItems(html) {
    // Parse JSON of video suggestions data in response
    let pattern = /var ytInitialData = ({.*?});\n?/;
    let raw = pattern.exec(html)[1];
    let data = JSON.parse(raw);
    let results = data.contents.twoColumnWatchNextResults.secondaryResults.secondaryResults.results;

    // Add container for unbiased video suggestions
    if (!newItems) {
        items.insertAdjacentHTML('beforebegin', '<div id="newItems"></div>');
        newItems = document.getElementById('newItems');
    }
    newItems.innerHTML = newItemsHeader; // show title for container

    // Use Polymer library of YouTube to add all suggestions to page
    for (i = 0; i < results.length && i < maxResults; i++) {
        let entry = results[i];
        let videoElement, videoData; // Polymer library of YouTube will load videoData into videoElement

        // Fill video element and data
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

    newItems.insertAdjacentHTML('beforeend', newItemsFooter);
}

let vid = null; // keep track of current video ID
function monitorNavigated() {
    // Hide unbiased results
    if (newItems)
        newItems.innerHTML = "";

    // Check if on new video page
    newVid = (new URL(location)).searchParams.get('v');
    if (!newVid || vid === newVid) return;

    // Find biased results
    if (!items)
        items = document.querySelector("#related #items");

    // Assure, we have video suggestions
    if (newVid && !items) return;

    // Hooray, ready to load video suggestions
    vid = newVid;

    // Prepare video url
    let url = new URL("https://www.youtube.com/watch");
    url.searchParams.append('v', vid);

    // Make requests, omitting cookies
    fetch(url.href, {credentials: 'omit', cache: 'no-store'})
        .then(response => response.text())
        .then(addItems)
        .catch(console.log);
}

if (maxResults <= 0) {
    console.log('maxResults set to <= 0. Disabling IdentiSwap for now..');
} else {
    document.addEventListener('yt-page-data-updated', monitorNavigated);
    monitorNavigated(); // in case, this extension is loaded after first event
}
