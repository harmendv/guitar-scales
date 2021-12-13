<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss">
html {
  min-height: 100%;
  height: 100%;
  background: linear-gradient(45deg, #cdd6e7, #9ab0da);
  background-size: cover;
  background-attachment: fixed;
}
body {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 100%;
  box-sizing: border-box;
  margin: auto auto;
}

#app {
  max-width: 1200px;
  width: 100%;
}

.view {
  display: flex;
  align-items: center;
  flex-direction: column;
}
</style>
