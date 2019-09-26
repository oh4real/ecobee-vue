
import { stopRequest, startRequest } from './lib/core';


chrome.browserAction.onClicked.addListener(function () {
    stopRequest();
    startRequest();
    chrome.tabs.query({ url: "https://www.ecobee.com/*" }, function (result) {
        if (result.length === 0) {
            chrome.tabs.create({ url: "https://www.ecobee.com/consumerportal/index.html" });
        } else {
            var tab = result.shift();
            chrome.tabs.update(tab.id, { selected: true });
        }
    });
});

startRequest();