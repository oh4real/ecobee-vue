import axios from 'axios';
import Storage from './storage';
import { getClientInterval } from './config';
import Client from './client';
import {heatCoolFilter, loadBadge} from './utils';

var timerId;

function startRequest() {
    stopRequest();
    // instead of writing badgeTest as ? while processing, i'd like to rotate hte badge icon
    chrome.browserAction.setBadgeText({ text: '?' });
    getStatus();
    timerId = window.setInterval(startRequest, getClientInterval());
}

function stopRequest() {
    window.clearTimeout(timerId);
}

function getStatus() {
    if (Storage.hasStorage()) {
        Client.getThermostatData()
            .then((data) => {
                loadBadge(data);
            })
            .catch(refreshToken);
    } else {
        stopRequest();
        authorizeUser();
    }
}

function refreshToken() {
    if (Storage.hasRefreshToken()) {
        console.log('core.refreshToken()');
        Client.refreshToken()
            .then(() => {
                console.log("refreshToken: post.success()");
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
    Client.authorizeUser(startRequest, stopRequest);
}

export {
    stopRequest,
    startRequest
}
