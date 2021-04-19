import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import VueRouter from 'vue-router';
import { routes } from './routes';  

import axios from 'axios';
//import VueAxios from 'vue-axios';
import VueTheMask from 'vue-the-mask'
import { VueMaskFilter } from 'v-mask'
import { VueMaskDirective } from 'v-mask'

Vue.config.productionTip = false

Vue.use(VueRouter);
//Vue.use(VueAxios, axios);
Vue.use(VueTheMask)

Vue.prototype.$axios = axios; // notice this

Vue.filter('VMask', VueMaskFilter)
Vue.directive('mask', VueMaskDirective)

import VCurrencyField from 'v-currency-field'
import { VTextField } from 'vuetify/lib'  //Globally import VTextField

Vue.component('v-text-field', VTextField)

Vue.use(VCurrencyField, { 
	locale: 'hu-HU',
	decimalLength: 2,
	autoDecimalMode: true,
	min: null,
	max: null,
	defaultValue: 0,
    valueAsInteger: false,
    allowNegative: true
})


const router = new VueRouter({
  routes,
  mode: 'history'
});
 
new Vue({
  vuetify,
  router,
  render: h => h(App),
}).$mount('#app')
