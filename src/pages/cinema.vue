<template>
  <div>
    <van-nav-bar
      :title="cinema.theater.nm"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
      class="topBar"
    />
    <!-- <div class="cinema-info">
      <div>
        <span class="cinema">{{cinema.theater.nm}}</span>
      </div>
      <div class="addr">{{cinema.theater.addr}}</div>
    </div>
    <div class="movie-info">
      <my-movie-detail :movieObj="cinema.movie"/>
    </div>
    <van-tabs v-model="active" color="#2a67ff">
      <van-tab :title="tab" v-for="tab in dates" :key="tab"> -->
    <div>
      <my-ticket-cell :list="cinema.tickets" @selectTicket="handleTicketSelect"/>
    </div>
      <!-- </van-tab>
    </van-tabs> -->
  </div>
</template>

<script>
import { Notify } from "vant";

import { router } from "../router.js";
import TicketCell from "./components/TicketCell";
import MovieDetail from "./components/MovieDetail";
import movieApi from "../api/movie.js";

export default {
  name: "cinema",
  props: {
    movieId: {
      type: String,
      default: ""
    },
    cinemaId: {
      type: String,
      default: ""
    }
  },
  components: {
    "my-ticket-cell": TicketCell,
    "my-movie-detail": MovieDetail
  },
  data() {
    return {
      active: 0,
      dates: ["明天", "后天"],
      cinema: {
        theater: {},
        movie: {},
        tickets: []
      }
    };
  },
  mounted() {
    this.onLoad();
  },
  methods: {
    onClickLeft() {
      // router.push({ path: `/movie` });
      router.go(-1);
    },

    handleTicketSelect(ticket) {
      router.push({ path: `seatSelect2D`, query: { ticketId: ticket.id.toString() } });
    },

    onLoad() {
      // movieApi
      //   .getMovieCinemaInfo(this.movieId, this.cinemaId, {})
      //   .then(res => {
      //     if (res.status === 200) {
            this.cinema = {
              theater: {nm: '德国 vs 巴西'},
              movie: {},
              tickets: [
                {nm: '房间1', id: 1}
              ]
            };
        //   }
        // })
        // .catch(error => {
        //   Notify({ type: "warning", message: error });
        // });
    }
  }
};
</script>

<style lang="less" scoped>
.cinema-info {
  margin: 10px 15px 0 25px;
  text-align: left;

  .cinema {
    font-size: 17px;
    line-height: 24px;
    font-weight: 700;
    color: #333;
  }
  .addr {
    margin-top: 5px;
    font-size: 13px;
    line-height: 18.5px;
    color: #999;
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
.movie-info {
  margin-top: 10px;
}
</style>
