(function () {
    "use strict";

    var removeAllCookies = function (origin) {
        return new Promise((resolve, reject) => {
        
            if (!chrome.cookies) {
                chrome.cookies = chrome.experimental.cookies;
            }

            var checkUrl = function (url, origin) {
                if (!origin) return true
                return url.contains(origin)
            };

            var removeCookie = function (cookie) {
                var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;
                chrome.cookies.remove({"url": url, "name": cookie.name});
            };

            let deleted=0;
            let count=0;
            chrome.cookies.getAllCookieStores(function (cookieStores) {
            
                chrome.cookies.getAll({}, function (all_cookies) {
                    count = all_cookies.length;
                    console.log(`${count} cookies`)
                    
                    for (var i = 0; i < count; i++) {
                        let cookie = all_cookies[i]
                        var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;
                        if (checkUrl(url, origin)){
                            removeCookie(cookie);
                            ++deleted;
                        }
                    }
                    resolve(`${deleted} deleted / ${count} cookies`)
                });
            });
        })
    };
    
    chrome.action.onClicked.addListener(tab => { 
        chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
            let url = tabs[0].url;
            removeAllCookies(url).then(r => {
                console.log(r)
            })
        });
     });

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request === "CLEAR_COOKIES_EXTENSION_API") {
            removeAllCookies(sender.origin).then(r => {
                sendResponse(r)
            })
        }
    });

})();

/* 
 to clear cookies using only those exposed to javascript run:

 window.postMessage({ type: "CLEAR_COOKIES_DOCUMENT" }, "*");

 to clear cookies using those exposed to extension api:

 window.postMessage({ type: "CLEAR_COOKIES_EXTENSION_API" }, "*");

 to receive a notification of when the cookies have been cleared add an event listener as follows:

 window.addEventListener("message", function (event) {
     if (event.data.type && (event.data.type === "COOKIES_CLEARED_VIA_EXTENSION_API")) {
         // do something
     }
 });
 */
