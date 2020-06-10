import Vue from 'vue'
import App from './App'
import prototype from '@/utils/prototype'  //挂载在原型上的方法

Vue.config.productionTip = false

Vue.use(prototype)
App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
