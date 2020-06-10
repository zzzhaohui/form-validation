import validate from './validate'


//用户名验证
const CHECK_NAME = (rule, value, callback) => {
    const check = validate({ label: "姓名", value, rules: ["notnull", "length"], conditions: [2, 18] })
    if (!check.result) {
        callback(new Error(check.message))
    } else {
        callback()
    }
}

// 验证号码格式
const CHECK_PHONE = (rule, value, callback) => {
    const check = validate({ label: '号码', value, rules: ['phone'] })
    if (!check.result) {
        callback(new Error(check.message))
    } else {
        callback()
    }
}
// 验证号码格式以及不能为空
const CHECK_PHONE_NOTNULL = (rule, value, callback) => {
    const check = validate({ label: '号码', value, rules: ['notnull', 'phone'] })
    if (!check.result) {
        callback(new Error(check.message))
    } else {
        callback()
    }
}
// 检测邮箱格式
const CHECK_EMAIL = (rule, value, callback) => {
    const check = validate({ label: '邮箱', value, rules: ['email'] })
    if (!check.result) {
        callback(new Error(check.message))
    } else {
        callback()
    }
}
// 检测邮箱格式以及不能为空
const CHECK_EMAIL_NOTNULL = (rule, value, callback) => {
    const check = validate({ label: '邮箱', value, rules: ['notnull', 'email'] })
    if (!check.result) {
        callback(new Error(check.message))
    } else {
        callback()
    }
}

// 检测身份证格式
const CHECK_IDCARD = (rule, value, callback) => {
    const check = validate({ label: '身份证', value, rules: ['idCard'] })
    if (!check.result) {
        callback(new Error(check.message))
    } else {
        callback()
    }
}
// 检测邮箱格式以及不能为空
const CHECK_IDCARD_NOTNULL = (rule, value, callback) => {
    const check = validate({ label: '身份证', value, rules: ['notnull', 'idCard'] })
    if (!check.result) {
        callback(new Error(check.message))
    } else {
        callback()
    }
}




const rules = {
    CHECK_NAME,
    CHECK_PHONE,
    CHECK_PHONE_NOTNULL,
    CHECK_EMAIL,
    CHECK_EMAIL_NOTNULL,
    CHECK_IDCARD,
    CHECK_IDCARD_NOTNULL
}


export default rules


