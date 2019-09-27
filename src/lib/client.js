import {getClientId} from './config';
import Storage from './storage';
import axios from 'axios';

export default {
    getAuthUrl: function() {
        var u = new URL('/authorize', 'https://api.ecobee.com');
        u.searchParams.set('redirect_uri', chrome.identity.getRedirectURL() + 'provider_ecobee');
        u.searchParams.set('response_type', 'code');
        u.searchParams.set('client_id', getClientId());
        u.searchParams.set('scope', 'smartRead');
        return decodeURIComponent(u.toString());
    },
    getAccessTokenUrl: function(code) {
        var u = new URL('/token', 'https://api.ecobee.com');
        u.searchParams.set('redirect_uri', chrome.identity.getRedirectURL() + 'provider_ecobee');
        u.searchParams.set('grant_type', 'authorization_code');
        u.searchParams.set('code', code);
        u.searchParams.set('client_id', getClientId());
        u.searchParams.set('scope', 'smartRead');
        return decodeURIComponent(u.toString());
    },
    getRefreshTokenUrl: function (rToken) {
        var u = new URL('/token', 'https://api.ecobee.com');
        u.searchParams.set('grant_type', 'refresh_token');
        u.searchParams.set('client_id', getClientId());
        u.searchParams.set('refresh_token', rToken);
        return u.toString();
    },
    getThermostatsUrl: function() {
        var u = new URL('/1/thermostat', 'https://api.ecobee.com');
        u.searchParams.set('json', JSON.stringify({ "selection": { "includeAlerts": "true", "selectionType": "registered", "includeEvents": "false", "includeSettings": "false", "includeRuntime": "true", "includeEquipmentStatus": "true" } }))
        return decodeURIComponent(u.toString());
    },
    authorizeUser: function(successCallback, failureCallback) {
        chrome.identity.launchWebAuthFlow(
            { 'url': this.getAuthUrl(), 'interactive': true },
            function (responseUrl) {
                var code = (new URL(responseUrl)).searchParams.get('code');
                if (!!code) {
                    axios.post(this.getAccessTokenUrl(code))
                        .then(function (data) {
                            console.log("authorizeUser: post.success()");
                            Storage.store(data.data);
                            // localStorage.setItem(getExtensionId(), JSON.stringify(data.data));
                            successCallback();
                        })
                        .catch(function (data) {
                            console.log("authorizeUser: post.fail()", data);
                            failureCallback();
                        });
                }
            }.bind(this)
        );
    },
    refreshToken: function() {
        // try to get new access token with refresh_token
        return axios.post(this.getRefreshTokenUrl(Storage.getRefreshToken()))
            .then(function (data) {
                Storage.store(data.data);
                return data;
            });
    },
    getThermostatData: function() {
        var headers = {};
        if (Storage.hasStorage()) {
            /**
                Content-Type: application/json;charset=UTF-8
                Authorization: Bearer 9BwUG2zsmtjoxW83uUHg10YySwhiEow7
            */
            headers = { 'Content-Type': 'application/json;charset=UTF-8', 'Authorization': 'Bearer ' + Storage.getAccessToken() };
        }
        return axios.get(this.getThermostatsUrl(), { 'headers': headers })
            .then((resp) => {
                return resp.data.thermostatList;
            });
    }
}