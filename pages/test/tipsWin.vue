<!-- 弹框 -->
<template>
  <div :visible="visible" ref="tipsBox" @update:visible="updateDialog" class="tipsBox">
    <div ref="showPopover" class="tipsClass animated">
      <div>{{tipsContent}}</div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    visible: Boolean,
    tipsContent: String
  },
  methods: {
    get() {
      if (this.visible) {
        this.$refs.tipsBox.children[0].className = "tipsClass";
        this.updateDialog(false);
      } else {
        this.$refs.tipsBox.children[0].className = "tipsClass animated";
      }
    },
    updateDialog(val) {
      this.$emit("update:visible", val);
    }
  },
  mounted() {
    this.timer = setInterval(this.get, 1000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
    
  }
};
</script>
<style>
.tipsClass {
  top: 60%;
  left: 50%;
  height: 30px;
  line-height: 30px;
  position: absolute;
  padding: 0 15px;
  background: black;
  font-size: 12px;
  margin: 0px auto;
  text-align: center;
  color: white;
  opacity: 1;
  transform: translate(-50%, -50%);
  border-radius: 3px;
}
.animated {
  opacity: 0;
  padding: 0;
  filter: Alpha(opacity=0);
  transition: all 2s;
}
</style>
