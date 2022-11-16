<template>
  <ul>
    <li
      v-for="ticket in list"
      :key="ticket.id"
      @click="handleTicketClick(ticket)"
      class="movie-item"
    >
      <div class="movie-info">
        <van-row>
          {{ ticket.nm }}
          <!-- <van-col span="14">
            <div class="info">
              <van-row class="start-time-info">{{ticket.start_time}}</van-row>
              <van-row class="end-time-info">{{ticket.end_time}} 散场</van-row>
            </div>
            <div class="info">
              <van-row class="type">{{ticket.type}}</van-row>
              <van-row class="position">{{ticket.position}}</van-row>
            </div>
          </van-col>
          <van-col span="4" class="price">￥{{ ticket.price }}</van-col>
          <van-col span="6">
            <van-button type="info" size="mini">购票</van-button>
          </van-col> -->
        </van-row>
        <van-divider/>
      </div>
    </li>
  </ul>
</template>

<script>
export default {
  name: "TicketCell",
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
    handleTicketClick(ticket) {
      this.$emit("selectTicket", ticket);
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

  .movie-info {
    flex: 1;
    width: 0;
    margin-left: 10px;
    text-align: left;

    .info {
      float: left;
      margin-right: 25px;
    }

    .start-time-info {
      font-size: 20px;
      color: #333;
      line-height: 1;
      white-space: nowrap;
    }

    .end-time-info {
      margin-top: 10px;
      color: #999;
      font-size: 11px;
      line-height: 1;
      white-space: nowrap;
    }
    .type {
      margin-top: 2px;
      line-height: 18px;
      font-size: 13px;
      color: #333;
      white-space: normal;
    }
    .position {
      margin-top: 7px;
      font-size: 11px;
      color: #999;
      white-space: normal;
    }
    .price {
      line-height: 1;
      color: #f03d37;
      margin-top: 10px;
      font-size: 20px;
    }
  }
}
</style>
