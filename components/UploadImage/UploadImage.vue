<template>
  <view class="zh-image">
    <view class="zh-image-list" v-for="(item, index) in imgUrlList" :key="index">
      <img class="list-img" :src="item.url" :alt="item.name" />
      <view class="list-del" @tap="deleteFile(index)">x</view>
    </view>
    <view class="zh-image-list zh-img-list-add" v-if="limit>imgUrlList.length">
      <input type="file" class="upload" accept=".jpg, .png" ref="upload" name="上传" @change="chooseFile" />
      <view class="list-add">+</view>
    </view>
  </view>
</template>

<script>
const toast = msg => {
  uni.showToast({
    title: msg,
    icon: "none"
  });
};

const showLoading = msg => {
  uni.showLoading({
    title: msg
  });
};

const hideLoading = msg => {
  uni.hideLoading();
};

export default {
  props: {
    //img列表  [{name: "", url: ""}]
    imgList: {
      type: Array,
      default() {
        return {};
      }
    },

    //上传图片到服务器时，HTTP 请求 Header
    header: {
      type: Object,
      default() {
        return {};
      }
    },

    // 上传文件的服务器 url
    uploadFileUrl: {
      type: Function,
      default(){
        return{}
      }
    },

    //是否更新
    canUploadFile: {
      type: Boolean,
      default: true
    },

    //上传img的格式
    accept: {
      type: String,
      default: "gif/jpeg/png/jpg"
    },

    //是否在选取文件后立即进行上传
    autoUpload: {
      type: Boolean,
      default: true
    },

    //最大允许上传个数
    limit: {
      type: Number,
      default: 9
    },

    //限制文件大小  默认为500k
    fileSize: {
      type: Number,
      default: 500
    }
  },

  data() {
    return {
      imgUrlList: [],
      fileList: []
    };
  },
  mounted() {
    this.initInputImg();
  },
  methods: {
    initInputImg() {
      this.imgUrlList = this.imgList;
      this.fileList = [];

      var upload = this.$refs.upload.$el;
      upload.firstChild.children[1].type = "file";
      upload.firstChild.children[1].className = "file";
    },

    //选择img
    chooseFile(e) {
      var fileList = this.fileList;
      var limit = this.limit;

      const file = document.querySelector(".file").files;
      const imgMasSize = this.fileSize * 1024;
      // console.log(file)

      if (file.length > 0) {
        if (this.accept.split("/").indexOf(file[0].type.split("/")[1]) < 0) {
          // 自定义报错方式
          toast(`文件类型仅支持 ${this.accept}！`);
          return;
        }

        if (file[0].size > imgMasSize) {
          toast(`文件大小不能超过${this.fileSize}k！`);
          return;
        }

        fileList.push(file[0]);

        var fileName = file[0].name; //获取当前文件的文件名
        var fileUrl = this.createObjectURL(file[0]); //获取当前文件对象的URL

        this.imgUrlList.push({ name: fileName, url: fileUrl });
        this.$emit("update:imgList", this.imgUrlList); //类似双向数据绑定

        if (this.autoUpload) {
          this.upload();
        }
      }
    },

    upload() {
      var formData = new FormData();
      formData.append("files", this.fileList);

      uploadFileUrl(formData)
        .then(res => {
          this.$emit("on-Success", res);
        })
        .catch(err => {
          this.$emit("on-Error", err);
        });
    },

    //删除
    deleteFile(index) {
      uni.showModal({
        title: "提示",
        content: "确定要删除此项吗？",
        success: res => {
          if (res.confirm) {
            this.imgUrlList.splice(index, 1);
            this.fileList.splice(index, 1);
            this.$forceUpdate(); //强制更新
            this.$emit("update:imgList", this.imgUrlList); //类似双向数据绑定
          }
        }
      });
    },

    //重置img
    resetFields() {
      this.fileList = [];
      this.imgUrlList = [];
      this.$emit("update:imgList", this.imgUrlList); //类似双向数据绑定
    },

    //获取文件url
    createObjectURL(blob) {
      if (window.URL) {
        return window.URL.createObjectURL(blob);
      } else if (window.webkitURL) {
        return window.webkitURL.createObjectURL(blob);
      } else {
        return null;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.zh-image {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
}
.zh-image-list {
  width: 180rpx;
  height: 180rpx;
  border: 1px solid #ccc;
  margin: 10rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  .list-img {
    width: 100%;
    height: 100%;
    display: block;
  }
  .list-del {
    position: absolute;
    width: 35rpx;
    height: 35rpx;
    background: #f56c6c;
    color: #fff;
    top: 0;
    text-align: center;
    right: 0;
    line-height: 28rpx;
    font-size: 30rpx;
    z-index: 100;
  }
  .upload {
    width: 180rpx;
    height: 180rpx;
    opacity: 0;
    z-index: 2;
  }
  .list-add {
    width: 40rpx;
    text-align: center;
    line-height: 40rpx;
    position: absolute;
    left: 70rpx;
    top: 70rpx;
    z-index: 1;
  }
}
</style>
