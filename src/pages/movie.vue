<template>
  <div>
    <van-nav-bar
      :title="movieObj.movie.nm"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
      class="topBar"
    />
    <div class="movie-info">
      <my-movie-detail :movieObj="movieObj.movie"/>
    </div>
    <van-tabs v-model="active" color="#2a67ff">
      <van-tab :title="tab" v-for="tab in dates" :key="tab">
        <div>
          <my-cinema-cell :list="movieObj.theaters" @selectCinema="handleCinemaSelect"/>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import { Notify } from "vant";

import { router } from "../router";
import CinemaCell from "./components/CinemaCell";
import MovieDetail from "./components/MovieDetail";
import movieApi from "../api/movie.js";

export default {
  name: "movie",
  props: {
    id: {
      type: String,
      default: ""
    }
  },
  components: {
    "my-cinema-cell": CinemaCell,
    "my-movie-detail": MovieDetail
  },
  data() {
    return {
      active: 0,
      dates: ["明天", "后天"],
      cinemaLoading: false,
      cinemaFinished: false,
      cinemaList: [],
      movieObj: {
        movie: {},
        theaters: []
      }
    };
  },
  mounted() {
    this.onLoad();
  },
  methods: {
    onClickLeft() {
      router.push({
        path: `/m/movies`
      });
    },

    onLoad() {
      movieApi
        .getMovieInfo(this.id, {})
        .then(res => {
          if (res.status === 200) {
            this.movieObj = res.result;
          }
        })
        .catch(error => {
          Notify({ type: "warning", message: error });
        });
    },

    handleCinemaSelect(cinema) {
      router.push({
        path: `/cinema`,
        query: {
          movieId: this.id,
          cinemaId: cinema.id.toString()
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
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
.movie-info {
  margin-top: 10px;
}
</style>