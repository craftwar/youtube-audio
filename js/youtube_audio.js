chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        let url = request.url;
        let videoElement = document.getElementsByTagName('video')[0];
        /*
        let oldUrl;

        if (oldUrl === undefined) {
            oldUrl = videoElement.src;
        }
        if (url == "") {
            videoElement.pause();
            videoElement.src = oldUrl;
            videoElement.currentTime = 0;
            videoElement.play();
        } else 
            */
            if (videoElement.src  != url) {
            videoElement.pause();
            videoElement.src = url;
            videoElement.currentTime = 0;
            videoElement.play();
        }
    }
);
