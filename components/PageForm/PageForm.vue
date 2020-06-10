<template>
  <view>
    <view class="form">
      <view
        class="form-item"
        :class="'form-item--'+labelPosition(item.position)"
        v-for="(item, index) in getConfigList() "
        :key="index"
        :prop="item.value"
      >
        <!-- label -->
        <view
          class="form-item-label showAsteriskRect"
          :class="{isRequired: item.required}"
        >{{ item.label }}</view>

        <!-- content -->
        <view class="form-item-content">
          <!-- solt -->
          <template v-if="item.type === 'slot'">
            <slot :name="'form-' + item.value" />
          </template>

          <input
            v-if="item.type === 'input' || item.type === 'password'"
            class="form-input"
            placeholder-class="form-input-placeholder"
            v-model="formData[item.value]"
            :placeholder="getPlaceholder(item)"
            :disabled="item.disabled"
          />

          <textarea
            class="form-input textarea"
            v-if="item.type === 'textarea'"
            v-model="formData[item.value]"
            placeholder-class="form-input-placeholder"
            :placeholder="getPlaceholder(item)"
            :disabled="item.disabled"
          />

          <radio-group
            v-if="item.type === 'radio'"
            class="radio"
            @change="sexChange($event, item.value)"
          >
            <label
              class="radio-box"
              v-for="(citem, cindex) in listTypeInfo[item.list]"
              :key="cindex"
            >
              <view>
                <radio :value="citem.value" :checked="citem.value === formData[item.value]" />
              </view>
              <view class>{{citem.key}}</view>
            </label>
          </radio-group>
        </view>
      </view>
    </view>
  </view>
</template>


<script>
import AsyncValidator from "async-validator";

const showToast = message => {
  uni.showToast({
    title: message,
    icon: "none"
  });
};

export default {
  name: "page-form",
  props: {
    //表单数据
    formData: {
      type: Object
    },

    //相关字段
    fieldList: {
      type: Array
    },

    //验证规则
    rules: {
      type: Object
    },

    //相关列表
    listTypeInfo: {
      type: Object
    },

  },
  data() {
    return {
      /**
       * @desc 是否显示错误信息，如果为false则由用户通过回调函数中的error信息自定义错误信息
       */
      options: { showMessage: true }
    };
  },
  watch: {},
  computed: {},
  mounted() {},
  methods: {
    getConfigList() {
      return this.fieldList.filter(
        item =>
          !item.hasOwnProperty("show") ||
          (item.hasOwnProperty("show") && item.show)
      );
    },

    getPlaceholder(row) {
      let placeholder;
      if (row.type === "input") {
        placeholder = "请输入" + row.label;
      } else if (row.type === "textarea") {
        placeholder = "请输入" + row.label + "（限60字）";
      } else if (
        row.type === "select" ||
        row.type === "time" ||
        row.type === "date"
      ) {
        placeholder = "请选择" + row.label;
      } else {
        placeholder = row.label;
      }
      return placeholder;
    },

    labelPosition(position) {
      if (position) {
        return position;
      } else {
        return "left";
      }
    },

    sexChange(event, key) {
      var formData = this.formData;
      formData[key] = event.detail.value;
    },

    /**
     * @desc 对整个表单进行校验的方法
     */
    validate(callback) {
      var model = this.formData;
      var rules = this.rules;
      var options = this.options;

      // 如果需要验证的fields为空，调用验证时立刻返回callback
      if ((!rules || rules.length === 0) && callback) {
        callback(true, null);
        return true;
      }
      let errors = [];
      const props = Object.keys(rules);
      for (let i in props) {
        const prop = props[i];
        const value = this.getValueByProp(model, prop);
        this.validateItem(rules, prop, value, err => {
          if (err && err.length > 0) {
            errors = errors.concat(err);
          }
        });
      }
      if (errors.length > 0) {
        if (options.showMessage) {
          showToast(errors[0].message);
        }
        callback(false, errors);
      } else {
        callback(true, null);
      }
    },

    /**
     * @desc 对部分表单字段进行校验的方法
     */
    validateField(props, callback) {
      var model = this.formData;
      var rules = this.rules;
      var options = this.options;

      props = [].concat(props);
      if (props.length === 0) {
        return;
      }
      let errors = [];
      for (let i in props) {
        const prop = props[i];
        const value = this.getValueByProp(model, prop);
        this.validateItem(rules, prop, value, err => {
          if (err && err.length > 0) {
            errors = errors.concat(err);
          }
        });
      }
      if (errors.length > 0) {
        if (options.showMessage) {
          showToast(errors[0].message);
        }
        callback(false, errors);
      } else {
        callback(true, null);
      }
    },

    validateItem(rules, prop, value, callback) {
      if (!rules || JSON.stringify(rules) === "{}") {
        if (callback instanceof Function) {
          callback();
        }
        return true;
      }
      const propRules = [].concat(rules[prop] || []);
      propRules.forEach(rule => {
        if (rule.pattern) {
          rule.pattern = new RegExp(rule.pattern);
        }
      });
      const descriptor = {
        [prop]: propRules
      };
      const validator = new AsyncValidator(descriptor);
      const model = {
        [prop]: value
      };
      validator.validate(
        model,
        {
          firstFields: true
        },
        errors => {
          callback(errors);
        }
      );
    },

    getValueByProp: (obj, prop) => {
      let tempObj = obj;
      prop = prop.replace(/\[(\w+)\]/g, ".$1").replace(/^\./, "");
      let keyArr = prop.split(".");
      let i = 0;
      for (let len = keyArr.length; i < len - 1; ++i) {
        if (!tempObj) break;
        let key = keyArr[i];
        if (key in tempObj) {
          tempObj = tempObj[key];
        } else {
          break;
        }
      }
      return tempObj
        ? typeof tempObj[keyArr[i]] === "string"
          ? tempObj[keyArr[i]].trim()
          : tempObj[keyArr[i]]
        : null;
    },

    /**
     * @desc 对整个表单进行重置
     */
    resetFields() {
      var fromData = this.formData;
      for (let key in fromData) {
        fromData[key] = "";
      }
    }
  }
};
</script>


<style lang="scss" scoped>
.form {
  font-size: 28rpx;
  &-item {
    color: #666;
    border-bottom: 1rpx solid #eee;

    &--left {
      display: flex;
      justify-content: space-between;
    }
    &--top {
    }

    &-label {
      padding-right: 20rpx;
      font-size: 28rpx;
      color: #666;
      line-height: 40rpx;
      padding: 25rpx 0;
      display: inline-block;
      &.showAsteriskRect::before {
        content: "";
        color: #f56c6c;
        width: 16rpx;
        display: inline-block;
      }

      &.isRequired::before {
        content: "*";
      }
    }
    &-content {
      flex: 1;
      min-height: 90rpx;
      display: flex;
      align-items: center;
      overflow: hidden;
      justify-content: flex-end;
      .form-input {
        font-size: 28rpx;
        color: #333;
        text-align: right;
        width: 100%;
        box-sizing: border-box;
        height: 60rpx;
        &.textarea {
          height: 240rpx;
          padding: 24rpx 0;
          text-align: left;
        }
      }

      .form-input-placeholder {
        font-size: 28rpx;
        color: #999;
      }
      .radio {
        display: flex;
        .radio-box {
          display: flex;
          justify-content: flex-end;
        }
      }
    }
  }
}
</style>