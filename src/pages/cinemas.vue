<template>
  <div>
    <van-nav-bar title="影院" class="topBar"/>
    <van-list
      v-model="cinemaLoading"
      :finished="cinemaFinished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <my-cinema-cell :list="cinemaList"/>
    </van-list>
  </div>
</template>

<script>
import CinemaCell from "./components/CinemaCell";
import movieApi from "../api/movie";
import { Notify } from "vant";

export default {
  name: "cinemas",
  data() {
    return {
      cinemaList: [],
      cinemaLoading: false,
      cinemaFinished: false
    };
  },
  components: {
    "my-cinema-cell": CinemaCell
  },
  methods: {
    onLoad() {
      setTimeout(() => {
        this.cinemaLoading = true;
        movieApi
          .getCinemas({})
          .then(res => {
            if (res.status === 200) {
              this.count = res.result.count;
              this.cinemaList = res.result;
              // 加载状态结束
              this.cinemaLoading = false;
              this.cinemaFinished = true;
            }
          })
          .catch(error => {
            Notify({ type: "warning", message: error });
          });
      }, 500);
    }
  }
};
</script>

<style lang="less" scoped>
.cinemaslist {
  margin-top: 5px;
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
</style>