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
  background: #0b0c0e;
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
  padding: 20px;
}

#app {
  max-width: 1100px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view {
  display: flex;
  align-items: center;
  flex-direction: column;
}


@media (max-width: 730px) {
  .view {
    transform: rotate(90deg);
  }
}
</style>
