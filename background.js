console.log('Starting background script IdentiSwap!');
chrome.webRequest.onBeforeSendHeaders.addListener(
    function (details) {
        // Detect if IdentiSwap request
        details.requestHeaders = details.requestHeaders.filter(item => item.name.toLowerCase() !== "cookie" && item.name.toLowerCase() !== "x-client-data" && item.name.toLowerCase() !== "referer");

        return {
            requestHeaders: details.requestHeaders
        };
    }, {
        urls: ["https://www.youtube.com/watch?v=*#"]
    }, ['blocking', 'requestHeaders']
);

chrome.webRequest.onHeadersReceived.addListener(
    function (details) {
        details.responseHeaders = details.responseHeaders.filter(item => item.name.toLowerCase() !== "set-cookie");

        return {
            responseHeaders: details.responseHeaders
        };
    }, {
        urls: ["https://www.youtube.com/watch?v=*#"]
    }, ['blocking', 'responseHeaders']
);