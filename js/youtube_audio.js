'use strict';

chrome.runtime.sendMessage('1');
chrome.runtime.onMessage.addListener(
	(request, sender, sendResponse) => {
		const url = request.url;
		const videoElement = document.getElementsByTagName('video')[0];
		if (videoElement.src != url) {
			let currentTime = videoElement.currentTime;
			videoElement.src = url;
			videoElement.currentTime = currentTime;
			// if (!videoElement.paused)
			videoElement.play();
		}
	}
);
