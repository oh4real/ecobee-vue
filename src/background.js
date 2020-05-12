
import { stopRequest, startRequest } from './lib/core';


chrome.browserAction.onClicked.addListener(function () {
    stopRequest();
    startRequest();
});

startRequest();