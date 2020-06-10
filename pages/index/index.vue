<template>
  <view>
    <page-form ref="form" :form-data="formInfo.data" :field-list="formInfo.fieldList" :rules="formInfo.rules"
      :list-type-info="listTypeInfo">
      <template v-slot:form-idCard>
        <input type="text" class="form-input" v-model="formInfo.data.idCard" placeholder="请输入卡号"
          placeholder-class="form-input-placeholder" />
      </template>
      <template v-slot:form-citys>
        <input class="form-input" v-model="formInfo.data.citys" placeholder="请选择城市"
          placeholder-class="form-input-placeholder" @click="selecePicker" disabled />
      </template>
      <template v-slot:form-imgList>
        <upload-image ref="upload" :img-list.sync="formInfo.data.imgList" accept="jpg/png/jpeg" :auto-upload="false"
          :limit="3" :file-size="500" :on-success="onSuccess" :on-error="onErr"></upload-image>
      </template>
    </page-form>

    <button @click="upload" class="evan-form-show__button">保存</button>
    <button @click="save" class="evan-form-show__button">保存</button>
    <button @click="reset" class="evan-form-show__button">重置</button>
    <button @click="validatePhone" class="evan-form-show__button">只验证电话</button>
  </view>
</template>


<script>
  import PageForm from "./../../components/PageForm/PageForm";
  import UploadImage from "./../../components/UploadImage/UploadImage";
  import {
    iosProvinces,
    iosCitys,
    iosCountys
  } from "./areaData_v2";

  export default {
    name: "index1",
    components: {
      PageForm,
      UploadImage
    },
    data() {
      return {
        //相关列表
        listTypeInfo: {
          sexList: [{
              key: "男",
              value: "man"
            },
            {
              key: "女",
              value: "woman"
            }
          ]
        },

        /**
         * @desc 表格相关
         * @param {Object} data 表单数据
         * @param {Array} fieldList 相关列表
         * @param {Object} rules 验证规则
         */
        formInfo: {
          data: {
            username: "",
            sex: "",
            age: "",
            phone: "",
            email: "",
            idCard: "",
            citys: "",
            imgList: [
              // {name: "", url: ""}
            ]
          },
          fieldList: [{
              label: "姓名",
              value: "username",
              type: "input"
            },
            {
              label: "性别",
              value: "sex",
              type: "radio",
              list: "sexList",
              required: true
            },
            {
              label: "年龄",
              value: "age",
              type: "input",
              required: true
            },
            {
              label: "电话",
              value: "phone",
              type: "input",
              validator: this.$rules.CHECK_PHONE_NOTNULL,
              required: true
            },
            {
              label: "备注",
              value: "remarks",
              type: "textarea",
              position: "top", //label 位置
              required: true
            },
            {
              label: "插槽",
              value: "idCard",
              type: "slot",
              required: true
            },
            {
              label: "城市",
              value: "citys",
              type: "slot",
              required: true
            },
            {
              label: "图片",
              value: "imgList",
              type: "slot",
              position: "top", //label 位置
              required: true
            }
          ],
          rules: {}
        },

        options: {
          container: "container", //容器class  可选项
          title: "地址选择", //显示标题，可选项
          itemHeight: 35, //每一项的高度，可选项
          itemShowCount: 3, //组件展示的项数，可选项，可选3,5,7,9，不过不是3,5,7,9则展示7项
          relation: [1, 1], //是否关联上一列，可选项
          sureText: "保存", //设置确定按钮文字，可选项
          closeText: "取消", //设置取消按钮文字，可选项
          headerHeight: 44, //组件标题栏高度，可选项
          cssUnit: "px", // 元素css尺寸单位，可选项，可选px或者rem
          addClassName: "", //组件额外类名，用于自定义样式，可选项
          oneLevelId: 110000, //第一列 默认值
          twoLevelId: 110100, //第二列 默认值
          threeLevelId: 110101, //第三列 默认值
          fourLevelId: 110101, //第四列 默认值
          fiveLevelId: 110101, //第五列 默认值
          sixLevelId: 110101, //第六列 默认值
          showLoading: false, //实例展示时，在数据加载之前下拉菜单是否显示加载中的效果，建议ajax获取数据时设置为true
          showAnimate: false, //是否显示入场动画和退场动画，如需自定义动画效果，请覆写.fadeInUp .layer和.fadeOutDown .layer的css3动画。PS:动画时间为0.5秒。
          callback(data) {}, //选择完毕后的回调函数，必选项
          fallback(close) {}, //选择取消后的回调函数，可选项
          maskCallback(data) {} //点击背景层关闭组件时触发的方法，可选项
        }
      };
    },

    created() {
      this.initRules();
      this.test();
    },

    methods: {
      test() {

        const items = new Set([1, 2, 3, 4, 5, 5, 5, 5]);
        var newSet = [...new Set("ababbc")].join("");
        items.add(10);

        
      },


      initRules() {
        const formInfo = this.formInfo;
        formInfo.rules = this.$initRules(formInfo.fieldList);
      },

      upload() {
        this.$refs.upload.upload();
      },

      save() {
        this.$refs.form.validate(res => {
          if (res) {
            console.log(this.formInfo.data);
            uni.showToast({
              title: "验证通过"
            });
          }
        });
      },

      validatePhone() {
        this.$refs.form.validateField("phone", res => {
          if (res) {
            uni.showToast({
              title: "验证通过"
            });
          }
        });
      },

      /**
       * @desc picke
       */
      selecePicker() {
        var formInfoData = this.formInfo.data;
        var data = [iosProvinces, iosCitys, iosCountys]
        this.$IosSelect(3, [iosProvinces, iosCitys, iosCountys], {
          title: "地址选择", //标题
          itemHeight: 35, //每一个元素的高度
          relation: [1, 1], //是否关联上一列
          sureText: "保存",
          oneLevelId: 110000, //第一列 默认值
          twoLevelId: 110100, //第二列 默认值
          threeLevelId: 110101, //第三列 默认值
          callback: function (selectDataObj) {
            formInfoData.citys =
              `${selectDataObj.selectOneObj.value},${selectDataObj.selectTwoObj.value},${selectDataObj.selectThreeObj.value}`;
          }
        });
      },

      /**
       * @desc img上传
       */
      onSuccess(res) {},
      onErr(err) {},

      /**
       * @desc 重置表单
       */
      reset() {
        this.$refs.form.resetFields();
        this.$refs.upload.resetFields();
      }
    }
  };
</script>


<style lang="scss">
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
    color: #000;
  }
</style>