import {getExtensionId} from './config';

export default {
    hasStorage: function() {
        return localStorage.hasOwnProperty(getExtensionId());
    },
    hasRefreshToken: function() {
        return this.hasStorage() && this.retrieve().refresh_token.length;
    },
    getAccessToken: function() {
        return this.hasStorage() ? this.retrieve().access_token : null;
    },
    getRefreshToken: function () {
        if (this.hasRefreshToken()) {
            return this.retrieve().refresh_token;
        }

        throw new Error('No token data or no refresh token');
    },
    retrieve: function() {
        var data = [];
        if (this.hasStorage()) {
            data = JSON.parse(localStorage.getItem(getExtensionId()));
        }
        return data;
    },
    store: function(data) {
        localStorage.setItem(getExtensionId(), JSON.stringify(data));
    }
}









