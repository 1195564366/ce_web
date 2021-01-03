<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { Cache } from '@utils'
export default {
  name: 'App',
  created () {
    this.getDicData();
  },
  methods: {
    async getDicData () {
      const result = await this.$fetchGet('/common/enume');
      Cache.set('EC_DIC', result || []);
    }
  }
}
</script>
