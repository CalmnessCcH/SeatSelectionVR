<template>
  <ul>
    <li
      v-for="cinema in list"
      :key="cinema.id"
      @click="handleCinemaClick(cinema)"
      class="movie-item"
    >
      <div class="movie-info">
        <h3 class="title">
          {{ cinema.nm }}
          <!-- <span class="price">
            {{cinema.sellPrice}}
            <span style="font-size: 10px">元起</span>
          </span> -->
        </h3>
        <!-- <div class="info van-ellipsis">
          <span class="cast-item">{{ cinema.addr }}</span>
        </div> -->
        <!-- <div class="rate" v-if="cinema.tag.hallType.length !== 0">
          <span class="text" v-for="tag in cinema.tag.hallType" :key="tag">
            <van-tag color="#1989fa">{{ tag }}</van-tag>
          </span>
        </div> -->
        <!-- <van-divider/> -->
      </div>
      <!-- <div class="has-watched">{{cinema.distance}}</div> -->
    </li>
  </ul>
</template>

<script>
export default {
  name: "CinmaCell",
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
    handleCinemaClick(cinema) {
      this.$emit("selectCinema", cinema);
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
      .text {
        font-size: 10px;
        margin-right: 3px;
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
    font-size: 14px;
  }
  .price {
    color: #a42c2c;
  }
}
</style>
