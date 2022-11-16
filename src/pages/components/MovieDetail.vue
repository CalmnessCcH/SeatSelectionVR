<template>
  <div class="card">
    <van-card :desc="movieObj.enm" :thumb="movieObj.img">
      <div slot="title" class="title">{{movieObj.nm}}</div>
      <div slot="tags">
        <van-tag plain type="danger" class="tag" v-if="movieObj.cat">{{movieObj.cat}}</van-tag>
        <van-tag plain type="danger" v-if="movieObj.sc">{{movieObj.sc}}</van-tag>
      </div>
      <div slot="tags" class="desc">{{movieObj.scr_time}}</div>
      <div slot="tags" class="desc">{{movieObj.pubDesc}}</div>
    </van-card>
  </div>
</template>

<script>
export default {
  name: "MovieDetail",
  props: {
    movieObj: {
      type: Object,
      default() {
        return {};
      }
    }
  }
};
</script>

<style lang="less" scoped>
.card {
  text-align: left;
  .title {
    font-size: 16px;
    margin-bottom: 0px;
  }
  .desc {
    margin: 2px 0;
  }
  .tag {
    margin-right: 5px;
    margin: 3px 5px 5px 0;
  }
}
</style>