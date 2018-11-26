<template>
  <div class="home">
    <div class="home_item" v-for="(item, index) in init_data" :key="index">
      <img v-lazy="item.img_url" :alt="item.title">
      <h3>{{item.title}}</h3>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import fooStoreModule from '../store/modules/foo'

export default {
  data () {
    return {
      init_data: []
    }
  },
  asyncData ({ store }) {
    store.registerModule('foo', fooStoreModule)
    return store.dispatch('foo/inc')
  },

  // 重要信息：当多次访问路由时，
  // 避免在客户端重复注册模块。
  destroyed () {
    this.$store.unregisterModule('foo')
  },

  mounted () {
    this.init_data = this.$store.state.foo.count;
  }
}
</script>

<style lang="less" scoped>
  .home{
    .home_item{
      text-align: center;
      display: inline-block;
      margin: 10px;
      
      img{
        width: 125px;
        height: 175px;
      }
    }
    
  }
</style>

