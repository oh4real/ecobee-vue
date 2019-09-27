import axios from 'axios';

export default {
    getExtensionId: function () {
        return chrome.runtime.id;
    },
    getClientId: function () {
        return APP_KEYS[this.getExtensionId()].id;
    },
    getAuthUrl: function() {
        var u = new URL('/authorize', 'https://api.ecobee.com');
        u.searchParams.set('redirect_uri', chrome.identity.getRedirectURL() + 'provider_ecobee');
        u.searchParams.set('response_type', 'code');
        u.searchParams.set('client_id', getClient().id);
        u.searchParams.set('scope', 'smartRead');
        return decodeURIComponent(u.toString());
    },
    getAccessTokenUrl: function (code) {
        var u = new URL('/token', 'https://api.ecobee.com');
        u.searchParams.set('redirect_uri', chrome.identity.getRedirectURL() + 'provider_ecobee');
        u.searchParams.set('grant_type', 'authorization_code');
        u.searchParams.set('code', code);
        u.searchParams.set('client_id', this.getClientId());
        u.searchParams.set('scope', 'smartRead');
        return decodeURIComponent(u.toString());
    },
    getRefreshTokenUrl: function (refresh_token) {
        var u = new URL('/token', 'https://api.ecobee.com');
        u.searchParams.set('redirect_uri', chrome.identity.getRedirectURL() + 'provider_ecobee');
        u.searchParams.set('grant_type', 'refresh_token');
        u.searchParams.set('refresh_token', refresh_token);
        u.searchParams.set('client_id', this.getClientId());
        return decodeURIComponent(u.toString());
    },
    authorizeUser: function() {
        console.log(this.getAuthUrl());
        chrome.identity.launchWebAuthFlow({
                'url': this.getAuthUrl(),
                'interactive': true
            },
            function (responseUrl) {
                var code = (new URL(responseUrl)).searchParams.get('code');
                if (!!code) {
                    axios.post(this.getAccessTokenUrl(code))
                        .then(function (data) {
                            console.log("authorizeUser: post.success()");
                            localStorage.setItem(this.getExtensionId(), JSON.stringify(data.data));
                        })
                        .catch(function (data) {
                            console.log("authorizeUser: post.fail()", data);
                            throw new Error('Not Authorized');
                        });
                }
            }
        );
    },
    refreshToken: function() {
        var tokenData = JSON.parse(localStorage.getItem(this.getExtensionId()));
        if (tokenData.refresh_token.length) {
            
            // try to get new access token with refresh_token
            axios.post(this.getRefreshTokenUrl(tokenData.refresh_token))
                .then(function (data) {
                    console.log("refreshToken: post.success()");
                    localStorage.setItem(this.getExtensionId(), JSON.stringify(data));
                })
                .catch(function (data) {
                    console.log("refreshToken: post.fail()", data);
                    this.authorizeUser();
                });
        }
    },
    getThermoStats: function () {
        if (localStorage.hasOwnProperty(this.getExtensionId())) {
            var tokenData = JSON.parse(localStorage.getItem(this.getExtensionId()));
            /**
                Content-Type: application/json;charset=UTF-8
                Authorization: Bearer 9BwUG2zsmtjoxW83uUHg10YySwhiEow7
            */
            var headers = {
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': 'Bearer ' + tokenData.access_token
            };
            console.log(headers);
            var u = new URL('/1/thermostat', 'https://api.ecobee.com');
            u.searchParams.set('json', JSON.stringify({
                "selection": {
                    "includeAlerts": "true",
                    "selectionType": "registered",
                    "includeEvents": "false",
                    "includeSettings": "false",
                    "includeRuntime": "true",
                    "includeEquipmentStatus": "true"
                }
            }));
            return axios.get(decodeURIComponent(u.toString()), {
                'headers': headers
            }).then(function (resp) {
                return response.data;
            }, this.refreshToken);
        } else {
            this.authorizeUser();
        }
    }
};




