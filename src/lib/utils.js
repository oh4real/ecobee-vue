
function openEcobeeTab() {
    chrome.tabs.query({ url: "https://www.ecobee.com/*" }, function (result) {
        if (result.length === 0) {
            chrome.tabs.create({ url: "https://www.ecobee.com/consumerportal/index.html" });
        } else {
            var tab = result.shift();
            chrome.tabs.update(tab.id, { selected: true });
        }
    });
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

function loadBadge(thermostats) {
    var colorObj = { color: '#000' };
    // always grabs first thermostat, hopefully it's the one the user wants
    var thermostat = thermostats[0];
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

export {
    openEcobeeTab, 
    heatCoolFilter,
    loadBadge
}