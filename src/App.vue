<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
  export default {
    name: 'app',
  }
</script>

<style>
  #app {
    position: relative;
  
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  
    font-family: 'Roboto', sans-serif;
  }
</style>