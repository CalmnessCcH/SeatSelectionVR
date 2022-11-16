<template>
  <div class="main">
    <van-tabbar v-model="active" v-show="!fullscreen && isShow">
      <!-- <van-tabbar-item name="movies" icon="video-o">电影</van-tabbar-item>
      <van-tabbar-item name="cinemas" icon="send-gift-o">影院</van-tabbar-item> -->
      <van-tabbar-item name="movies" icon="fire-o">赛事</van-tabbar-item>
      <van-tabbar-item name="home" icon="home-o">我的</van-tabbar-item>
    </van-tabbar>
    <router-view/>
  </div>
</template>

<script>
import { router } from "../router";
// import {store} from './store'

export default {
  props: {},
  data() {
    return {
      active: "movies",
      fullscreen: false,
      isShow: true
    };
  },
  watch: {
    active(newPath, oldPath) {
      this.selectedPage(newPath);
    }
  },
  methods: {
    selectedPage(active) {
      router.push({ path: active });
    }
  },
  mounted() {
    this.active = router.currentRoute.name;
  }
};
</script>

<style lang="less" scoped>
.main {
  height: 100%;
}
</style>
