chrome.runtime.sendMessage('1');
chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        let url = request.url;
        let videoElement = document.getElementsByTagName('video')[0];
            if (videoElement.src  != url) {
            videoElement.src = url;
            videoElement.load();
            videoElement.play();
        }
    }
);
