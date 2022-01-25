<template>
  <div class="about">
    <h1>{{ item.title }}</h1>
  </div>
</template>
<script>
export default {
  asyncData({ store, route }) {
    return store.dispatch('fetchItem', { id: route.params.id });
  },
  computed: {
    item() {
      return this.$store.state.item;
    },
  },
};
</script>
