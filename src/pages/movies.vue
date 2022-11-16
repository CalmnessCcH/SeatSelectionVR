<template>
  <div>
    <van-nav-bar title="世界杯" class="topBar"/>
    <div>
      <van-list
        v-model="movieShowingLoading"
        :finished="movieShowingFinished"
        finished-text="没有更多了"
        @load="onShowingLoad"
      >
        <my-movie-cell :list="movieShowingList" @selectMovie="handleMovieSelect"/>
      </van-list>
    </div>
    <!-- <van-tabs v-model="active" color="#2a67ff">
      <van-tab title="正在热映">
        <div>
          <van-list
            v-model="movieShowingLoading"
            :finished="movieShowingFinished"
            finished-text="没有更多了"
            @load="onShowingLoad"
          >
            <my-movie-cell :list="movieShowingList" @selectMovie="handleMovieSelect"/>
          </van-list>
        </div>
      </van-tab>
      <van-tab title="即将上映">
        <van-list
          v-model="movieWillShowLoading"
          :finished="movieWillShowFinished"
          finished-text="没有更多了"
          @load="onWillShowingLoad"
        >
          <my-movie-cell :list="movieWillShowList" @selectMovie="handleMovieSelect"/>
        </van-list>
      </van-tab>
    </van-tabs> -->
  </div>
</template>

<script>
import MovieCell from "./components/MovieCell";
import { router } from "../router";
import movieApi from "../api/movie";
import { Notify } from "vant";

export default {
  name: "movies",
  props: {},
  data() {
    return {
      active: 0,
      movieShowingList: [],
      movieWillShowList: [],
      movieShowingLoading: false,
      movieWillShowLoading: false,
      movieShowingFinished: false,
      movieWillShowFinished: false,
      count: 0
    };
  },
  components: {
    "my-movie-cell": MovieCell
  },
  methods: {
    onShowingLoad() {
      setTimeout(() => {
        // this.movieShowingLoading = true;
        // movieApi
        //   .getShowingMovies({})
        //   .then(res => {
        //     if (res.status === 200) {
              this.count = 1;
              this.movieShowingList = [{id: 1, cinemaId: 1, nm: '德国 vs 巴西'}];
              this.movieShowingLoading = false;
              // 加载状态结束
              this.movieShowingFinished = true;
          //   }
          // })
          // .catch(error => {
          //   Notify({ type: "warning", message: error });
          // });
      }, 500);
    },
    // onWillShowingLoad() {
    //   setTimeout(() => {
    //     this.movieWillShowLoading = true;
    //     movieApi
    //       .getWillShowMovies({})
    //       .then(res => {
    //         if (res.status === 200) {
    //           this.count = res.result.count;
    //           this.movieWillShowList = res.result;
    //           // 加载状态结束
    //           this.movieWillShowLoading = false;
    //           this.movieWillShowFinished = true;
    //         }
    //       })
    //       .catch(error => {
    //         Notify({ type: "warning", message: error });
    //       });
    //   }, 500);
    // },
    handleMovieSelect(movie) {
      router.push({
        path: `/cinema`,
        query: {
          movieId: movie.id.toString(),
          cinemaId: movie.cinemaId.toString()
        }
      });
      // router.push({ path: `/movie`, query: { id: movie.id.toString() } });
    }
  }
};
</script>

<style lang="less" scoped>
.movie-tabs {
  .list-wrap {
    position: fixed;
    left: 0;
    right: 0;
    overflow-x: hidden;
    overflow-y: auto;
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
</style>