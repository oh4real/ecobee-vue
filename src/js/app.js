import Vue from 'vue';
import Popup from './components/popup.vue'

new Vue({
    el: '#ecobee-vue',
    components: {
        Popup
    },
    render(h) {
        return h('popup');
    }
});