export default (fieldList) => {
    const obj = {}
    // 循环字段列表
    for (const item of fieldList) {
      const type = item.type === 'select' ? '选择' : '输入'

      if (item.required) {
        if (item.validator) { 
          obj[item.value] = {
            required: item.required,
            validator: item.validator,
          }
        } else {
          obj[item.value] = {
            required: item.required,
            message: '请' + type + item.label,
          }
        }
      } else if (item.validator) { 
        obj[item.value] = {
          validator: item.validator,
        }
      }
    }
    return obj
  }
  