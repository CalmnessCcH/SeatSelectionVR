<template>
  <div>
    <div class="wapper" v-show="!show3D">
      <!--头部 开始-->
      <van-nav-bar :title="movieName" left-text="返回" left-arrow class="topBar" @click-left="onClickLeft"></van-nav-bar>
      <!--头部 结束-->
      <!--排期详情和座位上方示例图 开始-->
      <van-row justify="center" align="center">
        <van-col class="infoCard" span="8">{{ hallName }}</van-col>
        <van-col class="infoCard" span="8">{{ showDate }}</van-col>
        <van-col class="infoCard" span="8">{{ showTime }}</van-col>
      </van-row>
      <plan-detail>
        <template v-for="seatTypeItem in seatTypeList">
          <div class="seat-detail-item" :key="'seatType' + seatTypeItem.type"
            v-if="seatTypeItem.isShow === '1' && seatTypeItem.position === 'up'">
            <img class="seatTypeClass" :src="seatTypeItem.icon">
            <span class="seatTypeClass">{{ seatTypeItem.name }}</span>
          </div>
        </template>
      </plan-detail>
      <!--排期详情和座位上方示例图 结束-->
      <seat-area :propThumbnailAreaWidth="thumbnailBoxWidth" :propThumbnailAreaHeight="thumbnailBoxHeight"
        :propYMax="yMax" :propSeatScale="seatScale" :propSeatHeight="positionDistin" :propSeatToolArr="seatToolArr"
        :propSeatAreaWidthRem="seatAreaWidthRem" :propSeatAreaHeightRem="seatAreaHeightRem"
        :propSeatBoxHeight="seatBoxHeight" :propMiddleLine="middleLine" :propHorizontalLine="horizontalLine"
        ref="seatArea">
        <!--以下为缩略座位图具名插槽 开始-->
        <template slot="thumbnail-seat-solt">
          <template v-for="seatItem in seatList">
            <div class="thumbnailSeatClass" :key="'thumbnail' + seatItem.id" :style="{
              height: thumbnailHeight + 'rem',
              width: thumbnailWidth + 'rem', background: thumbnailBackgroud(seatItem),
              top: seatItem.gRow * thumbnailPositionDistin + 'rem', left: seatItem.gCol * thumbnailPositionDistin + 'rem'
            }">
            </div>
          </template>
        </template>
        <!--以上为缩略座位图具名插槽 结束-->
        <!--以下为座位图具名插槽 开始-->
        <template slot="seat-area-solt">
          <div class="seatBox" :style="{
            transform: 'scale(' + seatScale + ')', height: seatBoxHeight + 'rem',
            width: seatBoxWidth + 'rem', marginLeft: seatBoxCenterMargin + 'rem'
          }">
            <!--中轴线-->
            <div v-show="seatList.length > 0" class="middle-line"
              :style="{ height: seatBoxHeight + 'rem', left: middleLine + 'rem' }"></div>
            <template v-for="(seatItem, index) in seatList">
              <div class="seatClass" @click.prevent="clickSeat(index)" :key="seatItem.id" :style="{
                height: height + 'rem', width: width + 'rem',
                top: seatItem.gRow * positionDistin + 'rem', left: seatItem.gCol * positionDistin + 'rem'
              }">
                <img class="seatImgClass" :seatId="seatItem.id" :seatIndex="index" :src="seatItem.nowIcon">
              </div>
            </template>
          </div>
        </template>
        <!--以上为座位图具名插槽 结束-->
      </seat-area>
      <!-- 失活的组件将会被缓存！-->
      <keep-alive>
        <component v-show="selectedSeatList.length > 0" v-bind:is="selectedTabComponents" :propSeatList="seatList"
          :propSelectedSeat="selectedSeatList" :propHallInfo="hallInfo" @cancelSelect="processSelected"></component>
      </keep-alive>
      <confirm-lock :propSelectedSeat="selectedSeatList" :propSeatList="seatList" :propHallInfo="hallInfo"
        @lookSeat="lookSeat" @loading="loading"></confirm-lock>

    </div>
    <seat-select3-d v-if="show3D" @exit3d="exit3d" :propSeatList="seatList" :propSelectedSeat="selectedSeatList"
      :propHallInfo="hallInfo" :propAdList="adList"></seat-select3-d>
  </div>
</template>
<script>
import SeatArea from "@/components/SeatArea";
import PlanDetail from "@/components/PlanDetail";
import SelectedTab from "@/components/SelectedTab";
import ConfirmLock from "@/components/ConfirmLock";
import SeatSelect3D from "./seatSelect3D";
import { router } from "../router";
import seatApi from "../api/seat.js";
import { Notify } from "vant";

export default {
  name: "HallSeat",
  props: {
    ticketId: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      seatList: [], // 座位对象list
      seatTypeList: [], // 座位类型list
      hallInfo: {},
      windowWidth: "",
      windowHeight: "",
      clientWidth: "",
      clientHeight: "",
      documentWidth: "",
      documentHeight: "",
      xMax: 0,
      yMax: 0,
      adList: [],
      movieName: "", // 展示用 电影名称 接口获取
      hallName: "", // 展示用 影厅名称 接口获取
      showDate: "", // 展示用 开始日期 接口获取
      showTime: "", // 展示用 开始时间 接口获取
      positionDistin: 0.5, // 每个座位偏移距离
      width: 0.5, // 每个座位的宽
      height: 0.5, // 每个座位的高
      thumbnailWidth: 0.1, // 缩略图每个座位的宽
      thumbnailHeight: 0.1, // 缩略图每个座位的高
      thumbnailPositionDistin: 0.15, // 缩略图每个座位偏移距离
      seatAreaWidthRem: 10, // 座位区域横向rem最大值 用于和 seatAreaHeightRem 共同计算区域缩放比例
      selectedSeatList: [], // 已选择座位
      maxSelect: 4, // 最大选择座位数量 改动可改变最大选择座位数
      load: false, // 加载dom的控制
      show3D: false
    };
  },
  components: {
    SeatArea,
    PlanDetail,
    SelectedTab,
    ConfirmLock,
    SeatSelect3D
  },
  mounted() {
    let self = this;
    self.clientWidth = document.body.clientWidth;
    self.clientHeight = document.body.clientHeight;
    self.documentWidth = document.documentElement.clientWidth;
    self.documentHeight = document.documentElement.clientHeight;
    self.windowWidth = window.innerWidth;
    self.windowHeight = window.innerHeight;
    window.addEventListener('resize', () => {
      self.clientWidth = document.body.clientWidth;
      self.clientHeight = document.body.clientHeight;
      self.documentWidth = document.documentElement.clientWidth;
      self.documentHeight = document.documentElement.clientHeight;
      self.windowWidth = window.innerWidth;
      self.windowHeight = window.innerHeight;
    });
    this.loading(true);
    this.getSeatList();
    this.loading(false);
  },
  // // fixme 这里确认是否还需要
  // beforeRouteLeave (to, from, next) {
  //   if (to.path === '/moviePlan') {
  //     to.meta.keepAlive = true
  //   } else {
  //     to.meta.keepAlive = false
  //   }
  //   next()
  // },
  methods: {
    onClickLeft() {
      // router.push({ path: `/movie` });
      router.go(-1);
    },
    exit3d: function () {
      this.show3DStage(false);
    },
    lookSeat: function () {
      this.show3DStage(true);
      // router.push({
      //   path: "/seatSelect3D",
      //   query: {
      //     movieId: this.movieId,
      //     cinemaId: this.cinemaId,
      //     hallId: this.hallId,
      //     datetime: this.datetime,
      //     index: this.index,
      //     selected: selected
      //   }
      // });
    },
    show3DStage: function (flag) {
      this.show3D = flag;
    },
    // 请求影院列表数据
    getSeatList: function () {
      // mock数据
      // this.$get("/mock/seatLove.json").then(
      // seatApi
      //   .getTicketHallSeats(this.ticketId)
      //   .then(response => {
      //     if (response.status === 200) {
      let response = {
        result: {
          "errorCode": 0,
          "errorMsg": "",
          "name": "房间1",
          "movieName": "德国 vs 巴西",
          "showTime": "2022-11-26 16:50",
          "hallInfo": {
            "seatWidth": 40,
            "seatHeight": 40,
            "seatSpace": 15,
            "screenWidth": 600,
            "screenHeight": 300,
            "col": 8,
            "row": 8,
            "screenSpace": 200,
            "seatStepHeight": 15,
          },
          "ad_template": {
            ads: [{
              ad_name: 'test1',
              ad_url: 'https://www.douyin.com',
              url: 'https://60-221-21-138.bytefcdnrd.com/third/stream-688435761856119467_hd.flv?302_type=cold_aggr&_session_id=2017153953.n.cn-yj2pds.7xtu_2504&abr_pts=-1800&domain=pull-hs-f5.flive.douyincdn.com&manage_ip=&node_id=&pro_type=http2&redirect_from=pod.cn-yj2pds.7xtu.nss&vhost=push-rtmp-hs-f5.douyincdn.com',
              img: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ulkphgeh7nuvspognuhbo/douyin_web/img/images/logo-horizontal-small.svg'
            }]
          },
          "seatList": [
            {
              "id": "16879097",
              "row": "1",
              "col": "1",
              "gRow": 1,
              "gCol": 4,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879101",
              "row": "1",
              "col": "4",
              "gRow": 1,
              "gCol": 8,
              "type": "0-2",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879104",
              "row": "1",
              "col": "7",
              "gRow": 1,
              "gCol": 11,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879099",
              "row": "1",
              "col": "2",
              "gRow": 1,
              "gCol": 6,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879102",
              "row": "1",
              "col": "5",
              "gRow": 1,
              "gCol": 9,
              "type": "0-2",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879105",
              "row": "1",
              "col": "8",
              "gRow": 1,
              "gCol": 12,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879100",
              "row": "1",
              "col": "3",
              "gRow": 1,
              "gCol": 7,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879103",
              "row": "1",
              "col": "6",
              "gRow": 1,
              "gCol": 10,
              "type": "0-2",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879107",
              "row": "1",
              "col": "9",
              "gRow": 1,
              "gCol": 14,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879113",
              "row": "2",
              "col": "1",
              "gRow": 2,
              "gCol": 3,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879117",
              "row": "2",
              "col": "4",
              "gRow": 2,
              "gCol": 7,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879120",
              "row": "2",
              "col": "7",
              "gRow": 2,
              "gCol": 10,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879124",
              "row": "2",
              "col": "10",
              "gRow": 2,
              "gCol": 14,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879114",
              "row": "2",
              "col": "2",
              "gRow": 2,
              "gCol": 4,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879118",
              "row": "2",
              "col": "5",
              "gRow": 2,
              "gCol": 8,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879121",
              "row": "2",
              "col": "8",
              "gRow": 2,
              "gCol": 11,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879125",
              "row": "2",
              "col": "11",
              "gRow": 2,
              "gCol": 15,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879116",
              "row": "2",
              "col": "3",
              "gRow": 2,
              "gCol": 6,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879119",
              "row": "2",
              "col": "6",
              "gRow": 2,
              "gCol": 9,
              "type": "0-3",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879122",
              "row": "2",
              "col": "9",
              "gRow": 2,
              "gCol": 12,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879142",
              "row": "3",
              "col": "13",
              "gRow": 3,
              "gCol": 15,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879129",
              "row": "3",
              "col": "2",
              "gRow": 3,
              "gCol": 2,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879133",
              "row": "3",
              "col": "5",
              "gRow": 3,
              "gCol": 6,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879136",
              "row": "3",
              "col": "8",
              "gRow": 3,
              "gCol": 9,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879139",
              "row": "3",
              "col": "11",
              "gRow": 3,
              "gCol": 12,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879143",
              "row": "3",
              "col": "14",
              "gRow": 3,
              "gCol": 16,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879130",
              "row": "3",
              "col": "3",
              "gRow": 3,
              "gCol": 3,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879134",
              "row": "3",
              "col": "6",
              "gRow": 3,
              "gCol": 7,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879137",
              "row": "3",
              "col": "9",
              "gRow": 3,
              "gCol": 10,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879141",
              "row": "3",
              "col": "12",
              "gRow": 3,
              "gCol": 14,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879144",
              "row": "3",
              "col": "15",
              "gRow": 3,
              "gCol": 17,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879128",
              "row": "3",
              "col": "1",
              "gRow": 3,
              "gCol": 1,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879131",
              "row": "3",
              "col": "4",
              "gRow": 3,
              "gCol": 4,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879135",
              "row": "3",
              "col": "7",
              "gRow": 3,
              "gCol": 8,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879138",
              "row": "3",
              "col": "10",
              "gRow": 3,
              "gCol": 11,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879154",
              "row": "4",
              "col": "9",
              "gRow": 4,
              "gCol": 10,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879145",
              "row": "4",
              "col": "1",
              "gRow": 4,
              "gCol": 1,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879158",
              "row": "4",
              "col": "12",
              "gRow": 4,
              "gCol": 14,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879148",
              "row": "4",
              "col": "4",
              "gRow": 4,
              "gCol": 4,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879161",
              "row": "4",
              "col": "15",
              "gRow": 4,
              "gCol": 17,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879152",
              "row": "4",
              "col": "7",
              "gRow": 4,
              "gCol": 8,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879155",
              "row": "4",
              "col": "10",
              "gRow": 4,
              "gCol": 11,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879146",
              "row": "4",
              "col": "2",
              "gRow": 4,
              "gCol": 2,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879159",
              "row": "4",
              "col": "13",
              "gRow": 4,
              "gCol": 15,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879150",
              "row": "4",
              "col": "5",
              "gRow": 4,
              "gCol": 6,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879153",
              "row": "4",
              "col": "8",
              "gRow": 4,
              "gCol": 9,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879156",
              "row": "4",
              "col": "11",
              "gRow": 4,
              "gCol": 12,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879147",
              "row": "4",
              "col": "3",
              "gRow": 4,
              "gCol": 3,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879160",
              "row": "4",
              "col": "14",
              "gRow": 4,
              "gCol": 16,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879151",
              "row": "4",
              "col": "6",
              "gRow": 4,
              "gCol": 7,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879164",
              "row": "5",
              "col": "3",
              "gRow": 5,
              "gCol": 3,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879168",
              "row": "5",
              "col": "6",
              "gRow": 5,
              "gCol": 7,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879171",
              "row": "5",
              "col": "9",
              "gRow": 5,
              "gCol": 10,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879175",
              "row": "5",
              "col": "12",
              "gRow": 5,
              "gCol": 14,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879178",
              "row": "5",
              "col": "15",
              "gRow": 5,
              "gCol": 17,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879162",
              "row": "5",
              "col": "1",
              "gRow": 5,
              "gCol": 1,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879165",
              "row": "5",
              "col": "4",
              "gRow": 5,
              "gCol": 4,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879169",
              "row": "5",
              "col": "7",
              "gRow": 5,
              "gCol": 8,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879172",
              "row": "5",
              "col": "10",
              "gRow": 5,
              "gCol": 11,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879176",
              "row": "5",
              "col": "13",
              "gRow": 5,
              "gCol": 15,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879163",
              "row": "5",
              "col": "2",
              "gRow": 5,
              "gCol": 2,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879167",
              "row": "5",
              "col": "5",
              "gRow": 5,
              "gCol": 6,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879170",
              "row": "5",
              "col": "8",
              "gRow": 5,
              "gCol": 9,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879173",
              "row": "5",
              "col": "11",
              "gRow": 5,
              "gCol": 12,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879177",
              "row": "5",
              "col": "14",
              "gRow": 5,
              "gCol": 16,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879207",
              "row": "6",
              "col": "11",
              "gRow": 7,
              "gCol": 12,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879211",
              "row": "6",
              "col": "14",
              "gRow": 7,
              "gCol": 16,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879198",
              "row": "6",
              "col": "3",
              "gRow": 7,
              "gCol": 3,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879202",
              "row": "6",
              "col": "6",
              "gRow": 7,
              "gCol": 7,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879205",
              "row": "6",
              "col": "9",
              "gRow": 7,
              "gCol": 10,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879209",
              "row": "6",
              "col": "12",
              "gRow": 7,
              "gCol": 14,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879212",
              "row": "6",
              "col": "15",
              "gRow": 7,
              "gCol": 17,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879196",
              "row": "6",
              "col": "1",
              "gRow": 7,
              "gCol": 1,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879199",
              "row": "6",
              "col": "4",
              "gRow": 7,
              "gCol": 4,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879203",
              "row": "6",
              "col": "7",
              "gRow": 7,
              "gCol": 8,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879206",
              "row": "6",
              "col": "10",
              "gRow": 7,
              "gCol": 11,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879210",
              "row": "6",
              "col": "13",
              "gRow": 7,
              "gCol": 15,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879197",
              "row": "6",
              "col": "2",
              "gRow": 7,
              "gCol": 2,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879201",
              "row": "6",
              "col": "5",
              "gRow": 7,
              "gCol": 6,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879204",
              "row": "6",
              "col": "8",
              "gRow": 7,
              "gCol": 9,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879220",
              "row": "7",
              "col": "7",
              "gRow": 8,
              "gCol": 8,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879223",
              "row": "7",
              "col": "10",
              "gRow": 8,
              "gCol": 11,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879214",
              "row": "7",
              "col": "2",
              "gRow": 8,
              "gCol": 2,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879227",
              "row": "7",
              "col": "13",
              "gRow": 8,
              "gCol": 15,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879218",
              "row": "7",
              "col": "5",
              "gRow": 8,
              "gCol": 6,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879221",
              "row": "7",
              "col": "8",
              "gRow": 8,
              "gCol": 9,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879224",
              "row": "7",
              "col": "11",
              "gRow": 8,
              "gCol": 12,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879215",
              "row": "7",
              "col": "3",
              "gRow": 8,
              "gCol": 3,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879228",
              "row": "7",
              "col": "14",
              "gRow": 8,
              "gCol": 16,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879219",
              "row": "7",
              "col": "6",
              "gRow": 8,
              "gCol": 7,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879222",
              "row": "7",
              "col": "9",
              "gRow": 8,
              "gCol": 10,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879213",
              "row": "7",
              "col": "1",
              "gRow": 8,
              "gCol": 1,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879226",
              "row": "7",
              "col": "12",
              "gRow": 8,
              "gCol": 14,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879216",
              "row": "7",
              "col": "4",
              "gRow": 8,
              "gCol": 4,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879229",
              "row": "7",
              "col": "15",
              "gRow": 8,
              "gCol": 17,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879230",
              "row": "8",
              "col": "1",
              "gRow": 9,
              "gCol": 1,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879233",
              "row": "8",
              "col": "4",
              "gRow": 9,
              "gCol": 4,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879237",
              "row": "8",
              "col": "7",
              "gRow": 9,
              "gCol": 8,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879240",
              "row": "8",
              "col": "10",
              "gRow": 9,
              "gCol": 11,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879244",
              "row": "8",
              "col": "13",
              "gRow": 9,
              "gCol": 15,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879231",
              "row": "8",
              "col": "2",
              "gRow": 9,
              "gCol": 2,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879235",
              "row": "8",
              "col": "5",
              "gRow": 9,
              "gCol": 6,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879238",
              "row": "8",
              "col": "8",
              "gRow": 9,
              "gCol": 9,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879241",
              "row": "8",
              "col": "11",
              "gRow": 9,
              "gCol": 12,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879245",
              "row": "8",
              "col": "14",
              "gRow": 9,
              "gCol": 16,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879232",
              "row": "8",
              "col": "3",
              "gRow": 9,
              "gCol": 3,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879236",
              "row": "8",
              "col": "6",
              "gRow": 9,
              "gCol": 7,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879239",
              "row": "8",
              "col": "9",
              "gRow": 9,
              "gCol": 10,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879243",
              "row": "8",
              "col": "12",
              "gRow": 9,
              "gCol": 14,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879246",
              "row": "8",
              "col": "15",
              "gRow": 9,
              "gCol": 17,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879256",
              "row": "9",
              "col": "9",
              "gRow": 10,
              "gCol": 10,
              "type": "1",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879260",
              "row": "9",
              "col": "12",
              "gRow": 10,
              "gCol": 14,
              "type": "1",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879263",
              "row": "9",
              "col": "15",
              "gRow": 10,
              "gCol": 17,
              "type": "2-3",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879247",
              "row": "9",
              "col": "1",
              "gRow": 10,
              "gCol": 1,
              "type": "1-2",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879250",
              "row": "9",
              "col": "4",
              "gRow": 10,
              "gCol": 4,
              "type": "2",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879254",
              "row": "9",
              "col": "7",
              "gRow": 10,
              "gCol": 8,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879257",
              "row": "9",
              "col": "10",
              "gRow": 10,
              "gCol": 11,
              "type": "2",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879261",
              "row": "9",
              "col": "13",
              "gRow": 10,
              "gCol": 15,
              "type": "2",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879248",
              "row": "9",
              "col": "2",
              "gRow": 10,
              "gCol": 2,
              "type": "2-2",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879252",
              "row": "9",
              "col": "5",
              "gRow": 10,
              "gCol": 6,
              "type": "1",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879255",
              "row": "9",
              "col": "8",
              "gRow": 10,
              "gCol": 9,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879258",
              "row": "9",
              "col": "11",
              "gRow": 10,
              "gCol": 12,
              "type": "0",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879262",
              "row": "9",
              "col": "14",
              "gRow": 10,
              "gCol": 16,
              "type": "1-3",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879249",
              "row": "9",
              "col": "3",
              "gRow": 10,
              "gCol": 3,
              "type": "1",
              "flag": "0",
              "price": "69"
            },
            {
              "id": "16879253",
              "row": "9",
              "col": "6",
              "gRow": 10,
              "gCol": 7,
              "type": "2",
              "flag": "0",
              "price": "69"
            }
          ],
          "seatTypeList": [
            {
              "name": "可选",
              "type": "0",
              "seats": 1,
              "icon": "https://i.postimg.cc/BbbWyY5D/image.png",
              "isShow": "1",
              "position": "up"
            },
            {
              "name": "已选",
              "type": "0-1",
              "seats": 1,
              "icon": "https://i.postimg.cc/1X2dd93h/image.png",
              "isShow": "1",
              "position": "up"
            },
            {
              "name": "已售",
              "type": "0-2",
              "seats": 1,
              "icon": "https://i.postimg.cc/LXywzkds/image.png",
              "isShow": "1",
              "position": "up"
            },
            {
              "name": "维修",
              "type": "0-3",
              "seats": 1,
              "icon": "https://i.postimg.cc/BZVRbCcY/image.png",
              "isShow": "1",
              "position": "up"
            },
            {
              "name": "情侣首座可选",
              "type": "1",
              "seats": 1,
              "icon": "https://i.postimg.cc/bYVfbP8R/image.png",
              "isShow": "0",
              "position": "up"
            },
            {
              "name": "情侣首座已选",
              "type": "1-1",
              "seats": 1,
              "icon": "https://i.postimg.cc/nrC5TsZG/image.png",
              "isShow": "0",
              "position": "up"
            },
            {
              "name": "情侣首座已售",
              "type": "1-2",
              "seats": 1,
              "icon": "https://i.postimg.cc/8CS2DPBT/image.png",
              "isShow": "0",
              "position": "up"
            },
            {
              "name": "情侣首座维修",
              "type": "1-3",
              "seats": 1,
              "icon": "https://i.postimg.cc/QMJRMG01/image.png",
              "isShow": "0",
              "position": "up"
            },
            {
              "name": "情侣次座可选",
              "type": "2",
              "seats": 1,
              "icon": "https://i.postimg.cc/sxLFRYKL/image.png",
              "isShow": "0",
              "position": "up"
            },
            {
              "name": "情侣次座已选",
              "type": "2-1",
              "seats": 1,
              "icon": "https://i.postimg.cc/nc68R1Xj/image.png",
              "isShow": "0",
              "position": "up"
            },
            {
              "name": "情侣次座已售",
              "type": "2-2",
              "seats": 1,
              "icon": "https://i.postimg.cc/P5ZgB8D6/image.png",
              "isShow": "0",
              "position": "up"
            },
            {
              "name": "情侣次座维修",
              "type": "2-3",
              "seats": 1,
              "icon": "https://i.postimg.cc/3Jy5FqxQ/image.png",
              "isShow": "0",
              "position": "up"
            },
            {
              "name": "情侣座",
              "type": "5",
              "seats": 2,
              "icon": "https://i.postimg.cc/85kxJK03/image.png",
              "isShow": "1",
              "position": "up"
            }
          ],
          "cinema_name": "惊奇队长影院"
        }
      }
      var resSeatList = response.result.seatList;
      // 座位处理 -------开始
      if (!resSeatList) {
        return;
      }
      resSeatList.forEach(element => {
        // 获取座位的类型的首字母
        let firstNumber = element.type.substr(0, 1);
        // 在原来的对象中加入两个属性  otherLoveSeatIndex 对应情侣座位的原数组下标 otherLoveSeatId  对应情侣座位的Id
        element.otherLoveSeatIndex = null;
        element.otherLoveSeatId = null;
        // 座位的类型的首字母为 '1' 是情侣首座 处理情侣首座位
        if (firstNumber === "1") {
          for (const index in resSeatList) {
            if (
              resSeatList[index].gRow === element.gRow &&
              resSeatList[index].gCol === element.gCol + 1
            ) {
              element.otherLoveSeatIndex = index;
              element.otherLoveSeatId = resSeatList[index].id;
            }
          }
        }
        // 座位的类型的首字母为 '2' 是情侣次座 处理情侣次座位
        if (firstNumber === "2") {
          for (const index in resSeatList) {
            if (
              resSeatList[index].gRow === element.gRow &&
              resSeatList[index].gCol === element.gCol - 1
            ) {
              element.otherLoveSeatIndex = index;
              element.otherLoveSeatId = resSeatList[index].id;
            }
          }
        }
        // 加载座位的图标
        for (const item of response.result.seatTypeList) {
          // 加载每个座位的初始图标defautIcon 和 当前图标 nowIcon
          if (element.type === item.type) {
            element.nowIcon = item.icon;
            element.defautIcon = item.icon;
          }
          // 根据首字母找到对应的被选中图标
          if (firstNumber + "-1" === item.type) {
            element.selectedIcon = item.icon;
          }
          // 根据首字母找到对应的被选中图标
          if (firstNumber + "-2" === item.type) {
            element.soldedIcon = item.icon;
          }
          // 根据首字母找到对应的被选中图标
          if (firstNumber + "-3" === item.type) {
            element.fixIcon = item.icon;
          }
        }
        // 如果座位是已经售出 和 维修座位 加入属性canClick 判断座位是否可以点击
        if (
          element.defautIcon === element.soldedIcon ||
          element.defautIcon === element.fixIcon
        ) {
          element.canClick = false;
        } else {
          element.canClick = true;
        }
      });
      // 座位处理 -------结束
      // 开始处理上方影片信息显示数据
      var temp = response.result.showTime;
      if (temp.length === 20) {
        this.showDate =
          temp.substring(0, 10) + "(" + temp.substring(11, 14) + ")";
        this.showTime = temp.substring(15, 20);
      }
      this.seatList = resSeatList;
      this.hallInfo = response.result.hallInfo;
      this.xMax = this.hallInfo.col;
      this.yMax = this.hallInfo.row;
      this.seatTypeList = response.result.seatTypeList;
      this.movieName = response.result.movieName;
      this.hallName = response.result.name;
      if (response.result.ad_template !== null) {
        this.adList = response.result.ad_template.ads;
      }
      //     } else {
      //       alert(response.msg);
      //       router.go(-1);
      //     }
      //   }).catch(error => {
      //   Notify({type: "warning", message: error});
      // });
    },
    // 点击每个座位触发的函数
    clickSeat: function (index) {
      if (this.seatList[index].canClick) {
        if (
          this.seatList[index].nowIcon === this.seatList[index].selectedIcon
        ) {
          this.processSelected(index);
        } else {
          this.processUnSelected(index);
        }
      }
    },
    // 处理已选的座位
    processSelected: function (index) {
      let _selectedSeatList = this.selectedSeatList;
      let otherLoveSeatIndex = this.seatList[index].otherLoveSeatIndex;
      if (otherLoveSeatIndex !== null) {
        // 如果是情侣座位
        // 改变这些座位的图标为初始图标
        this.$set(
          this.seatList[index],
          "nowIcon",
          this.seatList[index].defautIcon
        );
        this.$set(
          this.seatList[otherLoveSeatIndex],
          "nowIcon",
          this.seatList[otherLoveSeatIndex].defautIcon
        );
        for (const key in _selectedSeatList) {
          // 移除id一样的座位
          if (_selectedSeatList[key].id === this.seatList[index].id) {
            _selectedSeatList.splice(key, 1);
          }
        }
        // 移除对应情侣座位
        for (const key in _selectedSeatList) {
          if (
            _selectedSeatList[key].id === this.seatList[otherLoveSeatIndex].id
          ) {
            _selectedSeatList.splice(key, 1);
          }
        }
      } else {
        // 改变这些座位的图标为初始图标 并 移除id一样的座位
        this.$set(
          this.seatList[index],
          "nowIcon",
          this.seatList[index].defautIcon
        );
        for (const key in _selectedSeatList) {
          if (_selectedSeatList[key].id === this.seatList[index].id) {
            _selectedSeatList.splice(key, 1);
          }
        }
      }
    },
    // 处理未选择的座位
    processUnSelected: function (index) {
      // 如果是选择第一个座位 放大区域并移动区域 突出座位 增加用户体验
      if (this.selectedSeatList.length === 0) {
        let top =
          (this.seatList[index].gRow * this.positionDistin -
            this.horizontalLine) *
          this.seatScale;
        let left =
          (this.seatList[index].gCol * this.positionDistin - this.middleLine) *
          this.seatScale;
        top = top > 0 ? -top - this.positionDistin : -top + this.positionDistin;
        left =
          left > 0 ? -left - this.positionDistin : -left + this.positionDistin;
        this.$refs.seatArea.changeScale();
        this.$refs.seatArea.changePosition(top, left);
      }
      let _selectedSeatList = this.selectedSeatList;
      let otherLoveSeatIndex = this.seatList[index].otherLoveSeatIndex;
      if (otherLoveSeatIndex !== null) {
        // 如果选中的是情侣座位 判断选择个数不大于 maxSelect
        if (_selectedSeatList.length >= this.maxSelect - 1) {
          alert("最多只能选择" + this.maxSelect + "个座位哦~");
          return;
        }
        // 改变这些座位的图标为已选择图标
        this.$set(
          this.seatList[index],
          "nowIcon",
          this.seatList[index].selectedIcon
        );
        this.$set(
          this.seatList[otherLoveSeatIndex],
          "nowIcon",
          this.seatList[otherLoveSeatIndex].selectedIcon
        );
        // 记录 orgIndex属性 是原seatList数组中的下标值
        this.seatList[index].orgIndex = index;
        this.seatList[otherLoveSeatIndex].orgIndex = otherLoveSeatIndex;
        // 把选择的座位放入到已选座位数组中
        _selectedSeatList.push(this.seatList[index]);
        _selectedSeatList.push(this.seatList[otherLoveSeatIndex]);
      } else {
        // 如果选中的是非情侣座位 判断选择个数不大于 maxSelect
        if (_selectedSeatList.length >= this.maxSelect) {
          alert("最多只能选择" + this.maxSelect + "个座位哦~");
          return;
        }
        // 改变这些座位的图标为已选择图标
        this.$set(
          this.seatList[index],
          "nowIcon",
          this.seatList[index].selectedIcon
        );
        // 记录 orgIndex属性 是原seatList数组中的下标值
        this.seatList[index].orgIndex = index;
        // 把选择的座位放入到已选座位数组中
        _selectedSeatList.push(this.seatList[index]);
      }
    },
    back: function () {
      this.$router.go(-1);
    },
    loading: function (value) {
      this.load = value;
    },
    thumbnailBackgroud: function (seatItem) {
      if (seatItem.nowIcon === seatItem.selectedIcon) {
        return "green";
      } else if (seatItem.nowIcon === seatItem.soldedIcon) {
        return "red";
      } else if (seatItem.nowIcon === seatItem.fixIcon) {
        return "red";
      } else {
        return "white";
      }
    }
  },
  computed: {
    // 座位区域高度rem
    seatAreaHeightRem: function () {
      let screenRem =
        (this.clientWidth ||
          this.windowWidth ||
          this.documentWidth) / 10;
      let height =
        this.documentHeight ||
        this.windowHeight ||
        this.clientHeight;
      // 除了座位区域的大小
      let otherDom = 0;//1.08 + 1.2 + 1.2 + 1.87 + 0.67 + 1.2; // 头+排期信息+座位示例 +底部快捷选择+确认按钮
      // 剩下的座位区域的大小
      return height / screenRem - otherDom;
    },
    // 取最大横坐标
    // xMax: function () {
    //   let i = 0;
    //   for (let index in this.seatList) {
    //     if (this.seatList[index].gCol > i) {
    //       i = this.seatList[index].gCol;
    //     }
    //   }
    //   return i;
    // },
    // // 取最大纵坐标
    // yMax: function () {
    //   let i = 0;
    //   for (let index in this.seatList) {
    //     if (this.seatList[index].gRow > i) {
    //       i = this.seatList[index].gRow;
    //     }
    //   }
    //   return i;
    // },
    // 竖中轴线
    middleLine: function () {
      return (this.xMax / 2 + 1) * this.positionDistin - 0.025;
    },
    // 横中轴线
    horizontalLine: function () {
      return (this.yMax / 2 + 1) * this.positionDistin - 0.025;
    },
    // 根据影厅的大小缩放比例(需要把影厅全部显示出来)
    seatScale: function () {
      let seatScaleX = 1;
      let seatScaleY = 1;
      seatScaleX = this.seatAreaWidthRem / this.seatBoxWidth;
      seatScaleY = this.seatAreaHeightRem / this.seatBoxHeight;
      return seatScaleX < seatScaleY ? seatScaleX : seatScaleY;
    },
    // 让影厅居中展示的偏移值
    seatBoxCenterMargin: function () {
      return -(this.seatBoxWidth * this.seatScale) / 2;
    },
    // class 为 seatBox 的高度值 单位为rem
    seatBoxHeight: function () {
      return (this.yMax + 1) * this.positionDistin + this.height;
    },
    // class 为 seatBox 的宽度值 单位为rem
    seatBoxWidth: function () {
      return (this.xMax + 1) * this.positionDistin + this.width;
    },
    // 缩略图宽 rem
    thumbnailBoxWidth: function () {
      return (
        (this.xMax + 1) * this.thumbnailPositionDistin + this.thumbnailWidth
      );
    },
    // 缩略图高 rem
    thumbnailBoxHeight: function () {
      return (
        (this.yMax + 1) * this.thumbnailPositionDistin + this.thumbnailHeight
      );
    },
    // 快速选择和选择座位组件component on-bind:is的值
    selectedTabComponents: function () {
      return "SelectedTab";
    },
    // 座位左边栏的数组
    seatToolArr: function () {
      let seatToolArr = [];
      let yMax = this.yMax;
      for (let i = 1; i <= yMax; i++) {
        let el = this.seatList.find(item => item.gRow === i);
        if (el) {
          seatToolArr.push(el.row);
        } else {
          seatToolArr.push("");
        }
      }
      return seatToolArr;
    }
  }
};
</script>
<style lang="stylus" rel="stylesheet/stylus">
  .wapper {
    width: 100%;
    height: 100%;
    background: #f3f4f6;

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

    .infoCard {
      background: white;
      font-size: 16px;
      line-height: 60px;
      height: 60px;
    }

    .seat-detail-item {
      display: flex;
      align-content: center;

      .seatTypeClass {
        display: block;
        height: 0.466667rem;
        line-height: 0.466667rem;
        white-space: nowrap;
      }
    }

    .thumbnailSeatClass {
      position: absolute;
    }

    .seatBox {
      position: absolute;
      left: 50%;
      transform-origin: 0rem 0rem 0rem;

      .middle-line {
        position: absolute;
        border-right: 0.05rem rgba(0, 0, 0, 0.2) dashed;
      }

      .seatClass {
        position: absolute;

        .seatImgClass {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
        }
      }
    }
  }
</style>
