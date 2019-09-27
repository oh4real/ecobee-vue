
function getExtensionId() {
    return chrome.runtime.id;
}
function getClientId() {
    return APP_KEYS[getExtensionId()].id;
}
function getClientInterval() {
    return APP_KEYS[getExtensionId()].interval;
}

function getExtensionRedirectUrl() {
    return chrome.identity.getRedirectURL();
}

export {
    getClientId, getExtensionId, getClientInterval, getExtensionRedirectUrl
}