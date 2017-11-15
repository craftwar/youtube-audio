var tabIds = new Map();
function removeURLParameters(url, parameters) {
    let urlparts = url.split('?');
    if (urlparts.length >= 2) {
        let pars = urlparts[1].split(/[&;]/g);

        for (let i = 0; i < pars.length; ++i) {
            parameters.forEach(function(parameter){
                if (pars[i].startsWith(parameter)) {
                    pars.splice(i, 1);
                    return;
                }
            });
        }
        url = urlparts[0] + '?' + pars.join('&');
    }
    return url;
}

function reloadTab() {
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        var pattern = /\.youtube\./;
        var url = tabs[0].url;

        if (pattern.test(url))
            chrome.tabs.reload();
    });
}

function sendMessage(tabId) {
    if (tabIds.has(tabId)) {
        chrome.tabs.sendMessage(tabId, {url: tabIds.get(tabId)});
    }
}

function processRequest(details) {
    if (details.url.indexOf('mime=audio') !== -1) {
        var parametersToBeRemoved = ['range=', 'rn=', 'rbuf='];
        var audioURL = removeURLParameters(details.url, parametersToBeRemoved);
        if (tabIds.get(details.tabId) != audioURL) {
            tabIds.set(details.tabId, audioURL);
            chrome.tabs.sendMessage(details.tabId, {url: audioURL});
        }
    }
}

function enableExtension() {
    chrome.browserAction.setIcon({
        path : {
            128 : "img/icon128.png",
            38 : "img/icon38.png"
        }
    });
    chrome.tabs.onUpdated.addListener(sendMessage);
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
/*    
    tabIds.forEach(function(value, key, map){
        chrome.tabs.sendMessage(key, {url: ""});
    })
*/    
    tabIds.clear();
    chrome.tabs.onUpdated.removeListener(sendMessage);
    chrome.webRequest.onBeforeRequest.removeListener(processRequest);
}

function saveSettings(disabled) {
    chrome.storage.local.set({'youtube_audio_state': disabled});
}

chrome.browserAction.onClicked.addListener(function() {
    chrome.storage.local.get('youtube_audio_state', function(values) {
        var disabled = values.youtube_audio_state;

        if (disabled) {
            enableExtension();
        } else {
            disableExtension();
        }

        disabled = !disabled;
        saveSettings(disabled);
        reloadTab();
    });
});

chrome.storage.local.get('youtube_audio_state', function(values) {
    var disabled = values.youtube_audio_state;
    if (typeof disabled === "undefined") {
        disabled = false;
        saveSettings(disabled);
    }

    if (disabled) {
        disableExtension();
    } else {
        enableExtension();
    }
});
