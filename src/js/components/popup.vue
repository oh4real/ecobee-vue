<template>
    <div>
        <ul class="tab-list" >
            <li class="tab-item bold">Your Devices</li>
            <li class="tab-item" v-show="!error && !loaded">Loading...</li>
            <li class="tab-item" v-show="error">There was an error loading. Please try again later.</li>
            <li class="tab-item" v-for="stat in stats" v-bind:key="stat.id">
                {{ stat.name }}: <span class="bold" :class="findClassByStatus(stat)">{{ getTemp(stat) }}</span>
                <button @click="viewDetails(stat)" class="button manage">manage</button>
            </li>
        </ul>
        <button @click="openEcobee()" class="button" v-show="error">Go to Ecobee</button>
    </div>
</template>
<script>
    import Client from '../../lib/client';
    import {heatCoolFilter,openEcobeeTab} from '../../lib/utils';

    export default {
        data() {
            return {
                stats: [],
                error: false
            }
        },
        mounted() {
            Client.getThermostatData()
                .then((thermostats) => {
                    console.log(thermostats);
                    this.stats = thermostats;
                })
                .catch((err) => {
                    this.error = true;
                    console.log('Auth failure', err);
                })
        },
        computed: {
            loaded: function() { 
                return this.stats.length;
            }
        },
        methods: {
            viewDetails(stat) {
                var url = "https://www.ecobee.com/consumerportal/index.html#/devices/thermostats/" + stat.identifier;
                chrome.tabs.create({ url: url })
            },
            openEcobee() {
                openEcobeeTab();
            },
            getTemp(stat) {
                console.log(heatCoolFilter(stat.equipmentStatus))
                return Math.round(stat.runtime.actualTemperature / 10)
            },
            findClassByStatus(stat) {
                var status = heatCoolFilter(stat.equipmentStatus);
                return status.type || 'default';
            }
        }
    }
</script>
<style lang="scss">
    * { box-sizing: border-box; }
    body { min-width: 250px; font-family: sans-serif; padding: 1em; }
    .tab-list {
        list-style: none;
        margin: 0 0 1em 0;
        padding: 0;
    }
    .tab-item {
        padding: .6em;
        border-bottom: 1px dashed #eee;
    }
    button {
        border-radius: 2px;
        background: dodgerblue;
        color: white;
        font-weight: bold;
        text-align: center;
        padding: .6em .8em;
        border: 0;
        box-shadow: 0 1px 2px gray;
        &.manage {
            margin-left: 2em;
            background:rgb(91, 189, 118);
            color: white;
        }
    }
    .cool {
        color: #03f;
    }
    .heat {
        color: #f71;
    }
    .bold {
        font-weight: bold;
    }
</style>