<template>
  <div class="info">
    <van-nav-bar title="支付成功" left-text="返回" left-arrow @click-left="onClickLeft" class="topBar"/>
    <div class="img-info">
      <van-image width="5rem" height="9rem" :src="finish"/>
    </div>
    <div class="desc-info">
      <span>订单支付成功</span>
    </div>
    <div class="button-info">
      <van-button type="info" @click="onClickLeft">返回首页</van-button>
    </div>
  </div>
</template>

<script>
import { router } from "../router.js";
export default {
  name: "finish",
  data() {
    return {
      finish: require("@/assets/finish.png")
    };
  },
  methods: {
    onClickLeft() {
      router.push({ path: `/m/movies` });
    }
  }
};
</script>

<style lang="less" scoped>
.info {
  background-color: rgba(219, 214, 214, 0.5);
  height: 100%;
  width: 100%;

  .img-info {
    margin-top: 3em;
  }

  .desc-info {
    margin-top: 30px;
    font-size: 16px;
  }

  .van-tabbar-item--active {
    font-size: 16px;
  }
}
.topBar {
  background: #2a67ff;

  .van-nav-bar__title {
    color: white;
  }

  .van-nav-bar__text {
    color: white;
  }

  .van-icon {
    color: white;
  }
}
.button-info {
  margin-top: 20px
}
</style>