var targetTabId = new Set();
function removeURLParameters(url, parameters) {
    let urlparts = url.split('?');
    if (urlparts.length >= 2) {
        let pars = urlparts[1].split(/[&;]/g);

        for (let i = 0; i < pars.length; ++i) {
            for (let parameter of parameters) {
                if (pars[i].startsWith(parameter)) {
                    pars.splice(i, 1);
                    break;
                }
            }
        }
        url = urlparts[0] + '?' + pars.join('&');
    }
    return url;
}

function reloadTab() {
    for (let TabId of targetTabId) {
        chrome.tabs.get(TabId, (tab) => {
            if (tab.active) {
                chrome.tabs.reload(TabId);
                return;
            }
		});
    }
}

function processRequest(details) {
    if (!targetTabId.has(details.tabId)) {
        return;
    } if (details.url.includes('mime=audio')) {
        let parametersToBeRemoved = ['range=', 'rn=', 'rbuf='];
        let audioURL = removeURLParameters(details.url, parametersToBeRemoved);
        chrome.tabs.sendMessage(details.tabId, {url: audioURL});
    }
}

function enableExtension() {
    chrome.browserAction.setIcon({
        path : {
            128 : "img/icon128.png",
            38 : "img/icon38.png"
        }
    });
    chrome.webRequest.onBeforeRequest.addListener(
        processRequest,
        {urls: ["<all_urls>"]},
        ["blocking"]
    );
}

function disableExtension() {
    chrome.browserAction.setIcon({
        path : {
            38 : "img/disabled_icon38.png",
        }
    });
    chrome.webRequest.onBeforeRequest.removeListener(processRequest);
}

function saveSettings(enable) {
    chrome.storage.local.set({'youtube_audio_state': enable});
}

chrome.browserAction.onClicked.addListener(function() {
    chrome.storage.local.get('youtube_audio_state', function(values) {
        let enable = !values.youtube_audio_state;
        saveSettings(enable);
        enable ? enableExtension() : disableExtension(), reloadTab();
    });
});

chrome.storage.local.get('youtube_audio_state', function(values) {
    let enable = values.youtube_audio_state;
    enable ? enableExtension() : disableExtension();
});

chrome.runtime.onMessage.addListener( (message, sender) => {
    if (message == 1) {
        targetTabId.add(sender.tab.id);
    }
});

chrome.tabs.onRemoved.addListener( tabId => targetTabId.delete(tabId) )
