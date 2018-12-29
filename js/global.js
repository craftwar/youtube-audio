const targetTabId = new Set();
function removeURLParameters(url, parametersToBeRemoved) {
    const urlparts = url.split('?');
    if (urlparts.length >= 2) {
        let pars = urlparts[1].split(/[&;]/g);

        for (var i = pars.length - 1; ~i; --i) {
            for (const parameter of parametersToBeRemoved) {
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
    for (const TabId of targetTabId) {
        chrome.tabs.get(TabId, (tab) => {
            if (tab.active) {
                chrome.tabs.reload(TabId);
                return;
            }
        });
    }
}

//can't cancel video or some video only(no audio) will not play
function processRequest(details) {
    if (!targetTabId.has(details.tabId)) {
        return;
    } if (details.url.includes('mime=audio')) {
        const parametersToBeRemoved = ['range=', 'rn=', 'rbuf='];
        const audioURL = removeURLParameters(details.url, parametersToBeRemoved);
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

chrome.browserAction.onClicked.addListener( ()=> {
    chrome.storage.local.get('youtube_audio_state', (values) =>{
        const enable = !values.youtube_audio_state;
        saveSettings(enable);
        enable ? enableExtension() : (disableExtension(), reloadTab());
    });
});

chrome.storage.local.get('youtube_audio_state', (values) =>{
    const enable = values.youtube_audio_state;
    enable ? enableExtension() : disableExtension();
});

chrome.runtime.onMessage.addListener( (message, sender) => {
    if (message == "1")
        targetTabId.add(sender.tab.id);
});

chrome.tabs.onRemoved.addListener( tabId => targetTabId.delete(tabId) );
