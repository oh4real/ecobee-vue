// var axios = require('axios');
import axios from 'axios';

var timerId;

function getExtensionId() {
    return chrome.runtime.id;
}
function getClient() {
    console.log(APP_KEYS, getExtensionId());
    return APP_KEYS[getExtensionId()];
}
function getAuthUrl() {
    var u = new URL('/authorize', 'https://api.ecobee.com');
    u.searchParams.set('redirect_uri', chrome.identity.getRedirectURL() + 'provider_ecobee');
    u.searchParams.set('response_type', 'code');
    u.searchParams.set('client_id', getClient().id);
    u.searchParams.set('scope', 'smartRead');
    return decodeURIComponent(u.toString());
}

function getInitialTokenUrl(code) {
    var u = new URL('/token', 'https://api.ecobee.com');
    u.searchParams.set('redirect_uri', chrome.identity.getRedirectURL() + 'provider_ecobee');
    u.searchParams.set('grant_type', 'authorization_code');
    u.searchParams.set('code', code);
    u.searchParams.set('client_id', getClient().id);
    u.searchParams.set('scope', 'smartRead');
    return decodeURIComponent(u.toString());
}

function startRequest() {
    stopRequest();
    // instead of writing badgeTest as ? while processing, i'd like to rotate hte badge icon
    chrome.browserAction.setBadgeText({ text: '?' });
    getStatus();
    timerId = window.setInterval(startRequest, getClient().interval);
}

function stopRequest() {
    window.clearTimeout(timerId);
}

function getStatus(callback) {
    console.log('this is here');
    var callback = callback != undefined ? callback : loadBadge;
    if (localStorage.hasOwnProperty(getExtensionId())) {
        var tokenData = JSON.parse(localStorage.getItem(getExtensionId()));
		/**
			Content-Type: application/json;charset=UTF-8
			Authorization: Bearer 9BwUG2zsmtjoxW83uUHg10YySwhiEow7
        */
        /**
         * https: //api.ecobee.com/1/thermostatSummary?json={"selection":{"includeAlerts":"true","selectionType":"registered","selectionMatch":"","includeEvents":"true","includeSettings":"true","includeRuntime":"true"}}
         */
        var headers = { 'Content-Type': 'application/json;charset=UTF-8', 'Authorization': 'Bearer ' + tokenData.access_token };
        console.log(headers);
        var u = new URL('/1/thermostat', 'https://api.ecobee.com');
        u.searchParams.set('json', JSON.stringify({ "selection": { "includeAlerts": "true", "selectionType": "registered", "includeEvents": "false", "includeSettings": "false", "includeRuntime": "true", "includeEquipmentStatus": "true" } }))
        axios.get(decodeURIComponent(u.toString()), { 'headers': headers }).then(callback, refreshToken);
    } else {
        stopRequest();
        authorizeUser();
    }
}

function loadBadge(resp) {
    var data = resp.data;
    console.log("ecobee data", data);
    var colorObj = { color: '#000' };
    // always grabs first thermostat, hopefully it's the one the user wants
    var thermostat = data.thermostatList[0];
    var status = heatCoolFilter(thermostat.equipmentStatus);
    switch (status.type) {
        case 'cool':
            colorObj.color = '#03f';
            break;
        case 'heat':
            colorObj.color = '#f71';
            break;
    }
    chrome.browserAction.setBadgeBackgroundColor(colorObj);
    chrome.browserAction.setBadgeText({ text: (Math.round(thermostat.runtime.actualTemperature / 10) + "") });
    chrome.browserAction.setTitle({ 'title': 'Ecobee (v' + chrome.app.getDetails().version + ')\n' + new Date().toTimeString() });
}

function refreshToken() {
    var tokenData = JSON.parse(localStorage.getItem(getExtensionId()));
    if (tokenData.refresh_token.length) {
        // try to get new access token with refresh_token
        axios.post('https://api.ecobee.com/token?grant_type=refresh_token&client_id=' + getClient().id + '&refresh_token=' + tokenData.refresh_token)
            .then(function (data) {
                console.log("refreshToken: post.success()");
                localStorage.setItem(getExtensionId(), JSON.stringify(data));
                getStatus();
            })
            .catch(function (data) {
                console.log("refreshToken: post.fail()", data);
                stopRequest();
                authorizeUser();
            });
    } else {
        // trigger get PIN and start that whole thing
        stopRequest();
        authorizeUser();
    }
}

function authorizeUser() {
    console.log(getAuthUrl());
    chrome.identity.launchWebAuthFlow(
        { 'url': getAuthUrl(), 'interactive': true },
        function (responseUrl) {
            var code = (new URL(responseUrl)).searchParams.get('code');
            if (!!code) {
                axios.post(getInitialTokenUrl(code))
                    .then(function (data) {
                        console.log("authorizeUser: post.success()");
                        localStorage.setItem(getExtensionId(), JSON.stringify(data.data));
                        startRequest();
                    })
                    .catch(function (data) {
                        console.log("authorizeUser: post.fail()", data);
                        stopRequest();
                    });
            }
        }
    );
}

function heatCoolFilter(propertyString) {
    var insertObj = { type: '' },
        running = propertyString.split(','),
        heating = ["heatPump", "heatPump2", "heatPump3", "auxHeat1", "auxHeat2", "auxHeat3"],
        cooling = ["compCool1", "compCool2"],
        arrayContains = function (needle, haystack) {
            var found = false;
            needle.forEach(function (element) {
                if (haystack.indexOf(element) > -1) {
                    found = true;
                }
            });
            return found;
        };
    return arrayContains(running, heating) && (insertObj.type = "heat"),
        arrayContains(running, cooling) && (insertObj.type = "cool"),
        insertObj;
}

export {
    stopRequest,
    startRequest
}
