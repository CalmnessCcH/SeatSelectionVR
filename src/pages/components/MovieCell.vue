<template>
  <ul>
    <li v-for="movie in list" :key="movie.id" @click="handleMovieClick(movie)" class="movie-item">
      <!-- <img class="img" :src="movie.img" height="120" width="80" /> -->
      <div class="movie-info">
        <h3 class="title">{{ movie.nm }}</h3>
        <!-- <div class="rate">
          评分:
          <span class="text">
            <van-tag color="#1989fa">{{ movie.sc|formatTag }}</van-tag>
          </span>
        </div>
        <div class="info van-ellipsis">
          主演:
          <span class="cast-item">{{ movie.star }}</span>
        </div>
        <div class="info van-ellipsis">
          <span class="cast-item">{{ movie.showInfo }}</span>
        </div>
        <van-divider /> -->
      </div>
      <!-- <div class="has-watched">
        <van-button type="info" size="mini" v-if="movie.globalReleased">购票</van-button>
        <van-button type="danger" size="mini" v-if="!movie.globalReleased">预售</van-button>
      </div> -->
    </li>
  </ul>
</template>

<script>
export default {
  name: "MovieCell",
  props: {
    list: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {};
  },
  methods: {
    handleMovieClick(movie) {
      this.$emit("selectMovie", movie);
    }
  },
  filters: {
    formatTag(score) {
      if (score === 0) return "暂无评分";
      else return score;
    }
  }
};
</script>

<style lang="less" scoped>
.movie-item {
  display: flex;
  margin-bottom: 10px;
  margin-top: 15px;
  padding: 0 10px;

  .img {
    flex: 0 0 80px;
  }

  .movie-info {
    flex: 1;
    width: 0;
    margin-left: 10px;

    .title {
      font-size: 16px;
      color: #333;
      margin: 10px 0;
      text-align: left;
    }

    .rate {
      display: flex;
      margin-bottom: 10px;
      font-size: 14px;
      .text {
        margin-left: 8px;
      }
    }

    .info {
      margin-bottom: 5px;
      font-size: 13px;
      text-align: left;
      .cast-item {
        margin-right: 4px;
      }
    }
  }
  .has-watched {
    display: flex;
    align-items: center;
  }
}
</style>