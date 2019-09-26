<template>
    <div>
        <ul class="tab-list" >
            <li class="tab-item" v-for="tab in tabs" v-bind:key="tab.id">{{ tab.title }} <span @click="openTab(tab)">focus</span></li>
        </ul>
        <button @click="getTabs()" class="button">Get tabs!</button>
    </div>
</template>
<script>
    import { startRequest } from '../../lib/core'
    
    export default {
        data() {
            return {
                tabs: []
            }
        },
        methods: {
            openTab: function(tab) {
                chrome.tabs.update(tab.id, {selected:true});
            },
            async getTabs() {
                try {
                    chrome.tabs.query({ currentWindow: true }, function(fetchedTabs) {
                        // Clear current tabs
                        this.tabs = [];
                        // Push new tabs
                        fetchedTabs.forEach(tab => {
                            console.log(tab);
                            this.tabs.push(tab);
                        })
                    }.bind(this));
                } catch (e) { console.log(e); }
            }
        }
    }
</script>
<style lang="scss">
    * { box-sizing: border-box; }
    body { min-width: 300px; font-family: sans-serif; padding: 1em; }
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
    }
</style>