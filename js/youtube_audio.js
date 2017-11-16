chrome.runtime.sendMessage('1');
var youtubeOldUrl;
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        let url = request.url;
        let videoElement = document.getElementsByTagName('video')[0];
/*
        if (youtubeOldUrl === undefined) {
            youtubeOldUrl = videoElement.src;
        }
        if (url == "") {
            videoElement.src = youtubeOldUrl;
            videoElement.load();
            videoElement.play();
        } else
*/
            if (videoElement.src  != url) {
            videoElement.src = url;
            videoElement.load();
            videoElement.play();
        }
    }
);
