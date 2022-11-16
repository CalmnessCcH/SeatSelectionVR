<template>
  <div class="selected">
    <div class="text">已选座位:</div>
    <div class="scroll" ref="scroll">
      <ul class="scroll-ul" ref="scrollUl">
        <li
          class="scroll-item"
          v-for="item in selectedSeat"
          :key="'select'+item.id"
          @click="cancelSelect(item)"
        >{{item.row}}排{{item.col}}座 {{hallInfo.price}}元</li>
        
      </ul>
    </div>
  </div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》';
import Bscroll from "better-scroll";
export default {
  // import引入的组件需要注入到对象中才能使用
  components: {},
  props: {
    propSelectedSeat: Array,
    propHallInfo: Object
  },
  data() {
    // 这里存放数据
    return {
      selectedSeat: this.propSelectedSeat,
      hallInfo: this.propHallInfo
    };
  },
  // 监听属性 类似于data概念
  computed: {},
  // 监控data中的数据变化
  watch: {
    propSelectedSeat: function(value) {
      let width = this.propSelectedSeat.length * 2.4 + 1.2;
      this.$refs.scrollUl.style.width = width + "rem";
      this.$nextTick(() => {
        if (!this.scroll) {
          this.scroll = new Bscroll(this.$refs.scroll, {
            scrollX: true,
            // 忽略竖直方向的滚动
            scrollY: false,
            eventPassthrough: "vertical"
          });
        } else {
          this.scroll.refresh();
        }
      });
    },
    propHallInfo:  function(value) {
      this.hallInfo = value;
    }
  },
  // 方法集合
  methods: {
    cancelSelect: function(item) {
      this.$emit("cancelSelect", item.orgIndex);
    }
  },
  // 生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  beforeCreate() {}, // 生命周期 - 创建之前
  beforeMount() {}, // 生命周期 - 挂载之前
  beforeUpdate() {}, // 生命周期 - 更新之前
  updated() {}, // 生命周期 - 更新之后
  beforeDestroy() {}, // 生命周期 - 销毁之前
  destroyed() {}, // 生命周期 - 销毁完成
  activated() {} // 如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang='stylus' rel='stylesheet/stylus' scoped='scoped'>
// @import url(); 引入公共css类
.selected {
  position: fixed;
  z-index: 10;
  bottom: 50px;
  background: #ffffff;
  width: 100%;
  padding: 0.266667rem 0 0.266667rem 0.266667rem;
  height: 1.333333rem;
  overflow: hidden;

  .text {
    width: 100%;
    height: 0.346667rem;
    line-height: 0.346667rem;
    font-size: 0.373333rem;
    font-weight: 400;
  }

  .scroll {
    position: absolute;
    height: 1.866667rem;
    width: 100%;
    top: 0;
    left: 0;
    z-index: 11;

    .scroll-ul {
      width: 100%;
      display: flex;
      margin-top: 0.8rem;

      .scroll-item {
        flex: none;
        margin-left: 0.266667rem;
        height: 0.866667rem;
        line-height: 0.866667rem;
        text-align: center;
        font-size: 0.306667rem;
        width: 2.133333rem;
        color: #888888;
        border: 0.026667rem solid #888;
        border-radius: 0.133333rem;
      }
    }
  }
}
</style>
