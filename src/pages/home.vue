<template>
  <div class="home">
    <img
      class="user-poster"
      :src="homeBackGround"
    />
    <!-- <van-row class="user-links">
      <van-col span="8">
        <van-icon name="pending-payment" />电影票
      </van-col>
      <van-col span="8">
        <van-icon name="chat-o" />影评
      </van-col>
      <van-col span="8">
        <van-icon name="like-o" />想看
      </van-col>
    </van-row> -->
<!-- 
    <van-cell-group class="user-group">
      <van-cell icon="records" title="全部订单" is-link />
    </van-cell-group>

    <van-cell-group>
      <van-cell icon="points" title="我的积分" is-link />
      <van-cell icon="gold-coin-o" title="我的优惠券" is-link />
      <van-cell icon="service-o" title="我的客服" is-link />
    </van-cell-group> -->
  </div>
</template>

<script>
export default {
  name: "home",
  props: {},
  data() {
    return {
      homeBackGround: require('@/assets/home.png')
    };
  }
};
</script>

<style scoped lang="less">
.home {
  .user {
    &-poster {
      width: 100%;
      height: 53vw;
      display: block;
    }
    &-group {
      margin-bottom: 15px;
    }
    &-links {
      padding: 15px 0;
      font-size: 12px;
      text-align: center;
      background-color: #fff;
      .van-icon {
        display: block;
        font-size: 24px;
      }
    }
  }
}
</style>
