<template>
  <div>xxx</div>
</template>

<script>
// import moduleName from 'module';
import "three";
var THREE = require("three");

export default {
  name: "testThree",
  data() {
    return {
      renderer: "",
      scene: "",
      camera: ""
    };
  },
  mounted() {
    this.start();
  },
  methods: {
    init() {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(this.renderer.domElement);
    },
    animate() {
      window.requestAnimationFrame(this.animate);
      this.renderer.render(this.scene, this.camera);
    },
    start() {
      this.init();
      this.animate();
    }
  }
};
</script>

<style lang="less" scoped>
</style>