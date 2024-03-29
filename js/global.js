'use strict';

const targetTabId = new Set();
var enable;

chrome.storage.local.get('youtube_audio_state', (values) =>{
	enable = values.youtube_audio_state;
	enable ? enableExtension() : disableExtension();
});

chrome.browserAction.onClicked.addListener( ()=> {
	enable = !enable;
	enable ? enableExtension() : (disableExtension(), reloadTab());
	chrome.storage.local.set({'youtube_audio_state': enable});
});

chrome.runtime.onMessage.addListener( (message, sender) => {
	targetTabId.add(sender.tab.id);
});

chrome.tabs.onRemoved.addListener( tabId => targetTabId.delete(tabId) );

function removeURLParameters(url, parametersToBeRemoved) {
	const urlparts = url.split('?');
	if (urlparts.length >= 2) {
		let pars = urlparts[1].split('&');

		// assume each parameter exists once only
		for (const parameter of parametersToBeRemoved) {
			for (var i = pars.length - 1; ~i; --i) {
				if (pars[i].startsWith(parameter)) {
					pars.splice(i, 1);
					break;
				}
			}
		}
		url = `${urlparts[0]}?${pars.join('&')}`;
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

// can't cancel video or video without audio-only stream will not play
function processRequest(details) {
	// console.log("originUrl = " + details.originUrl + "\n")
	// console.log("documentUrl = " + details.documentUrl + "\n")
	// console.log("url = " + details.url + "\n")
	if (!targetTabId.has(details.tabId) || details.originUrl == "https://www.youtube.com/") {
		return;
	} 
//	console.log("details.url= " + details.url);
//	console.log("details.type= " + details.type);
	if (details.url.includes('mime=audio') && !details.url.includes('live=1')) {
		// reverse parameter order (same as url parameter traversal order)
		const parametersToBeRemoved = ['ump', 'rbuf=', 'rn=', 'range='];
		const audioURL = removeURLParameters(details.url, parametersToBeRemoved);
		chrome.tabs.sendMessage(details.tabId, {url: audioURL}, {frameId: details.frameId});
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
		{ urls: ["<all_urls>"],
		  types: ["xmlhttprequest"]
		},
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
