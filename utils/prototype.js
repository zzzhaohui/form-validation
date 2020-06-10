
import initRules from './initRules' // 初始化验证规则
import rules from './rules' // 公共验证方法
import validate from './validate' // 公共验证方法
import IosSelect from './iosSelect' // 公共验证方法

export default {
    install(Vue, options) {
        Vue.prototype.$initRules = initRules
        Vue.prototype.$validate = validate
        Vue.prototype.$rules = rules
        Vue.prototype.$IosSelect = IosSelect
    }
}