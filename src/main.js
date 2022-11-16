import Vue from 'vue'
import App from './App.vue'
import { router } from './router';
import Vant from 'vant';
import './assets/stylus/reset.styl'
import 'vant/lib/index.css';
import * as THREE from 'three';
import { post, get, patch, put } from './http'
import 'amfe-flexible'
// import Vconsole from 'vconsole'

// let vConsole = new Vconsole()

Vue.prototype.$post = post
Vue.prototype.$get = get
Vue.prototype.$patch = patch
Vue.prototype.$put = put
Vue.use(THREE);
Vue.use(Vant);
Vue.config.productionTip = false

var VueTouch = require('vue-touch')
Vue.use(VueTouch, { name: 'v-touch' })

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
