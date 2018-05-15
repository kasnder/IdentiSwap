function saveOptions(e) {
    e.preventDefault();
    chrome.storage.local.set({
        maxresults: document.querySelector("#maxresults").value
    });
}

function restoreOptions() {
    chrome.storage.local.get(["maxresults"], function (result) {
        document.querySelector("#maxresults").value = result.maxresults || "5";
    });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);