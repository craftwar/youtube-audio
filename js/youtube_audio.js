chrome.runtime.sendMessage('1');
chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        const url = request.url;
        const videoElement = document.getElementsByTagName('video')[0];
        if ( !videoElement.src.includes('mime=audio') && videoElement.src != url) {
            videoElement.src = url;
            videoElement.play();
        }
    }
);
