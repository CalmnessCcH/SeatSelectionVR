<template>
  <div style="width: 100%; height: 100%;">
    <div class="landscape" v-if="!landscape">
      <span class="text">请横屏观看</span>
    </div>
    <div class="main" v-show="landscape">
      <div class="start" v-if="startCard">
        <van-button class="start-btn" round type="info" @click="videoPlay('init')">点击观看</van-button>
      </div>
      <div class="info">
        <van-tag size="large" type="primary">当前座位：{{ selectedSeat[nowSeatIndex].row }}排{{ selectedSeat[nowSeatIndex].col
          }}座
        </van-tag>
      </div>
      <div class="ad">
        <van-image
          width="70"
          height="70"
          :src="adImg"
          @click="goToAdUrl()"
        ></van-image>
      </div>
      <div class="exit">
        <van-button type="info" @click="exit()">返回选座</van-button>
      </div>
      <div class="switch-seat">
        <van-row gutter="20">
          <van-col span="12">
            <van-button icon="arrow-left" type="info" @click="switchSeat('previous')"></van-button>
          </van-col>
          <van-col span="12">
            <van-button icon="arrow" type="info" @click="switchSeat('next')"></van-button>
          </van-col>
        </van-row>
      </div>
      <div class="container" ref="instructions">
        <section id="loading-screen">
          <div id="loader"></div>
        </section>

        <div class="cinema" ref="cinema"></div>
        <div id="mse" ref="video" style="display:none"></div>
        <!-- <video
          ref="video"
          preload="none"
          playsinline
          webkit-playsinline
          crossorigin="anonymous"
          poster="/static/img/screen_default.png"
          :src="videoSrc"
          style="display:none"
        > -->
          <!-- <source src="/static/media/sintel.ogg" type="video/ogg; codecs='theora, vorbis'" />
          <source src="/static/media/sintel.mp4" type="video/mp4; codecs='avc1.42E01E, mp4a.40.2'" />-->
        <!-- </video> -->
      </div>
    </div>
  </div>
</template>

<script>
  var THREE = require("three");
  // import TWEEN from "@/libs/tween.esm.js";
  // const { Tween, Easing, autoPlay } = require('es6-tween');
  // import enableInlineVideo from 'iphone-inline-video';
  import {PointerLockControls} from "@/libs/threejs/libs/jsm/controls/PointerLockControls.js";
  import {RectAreaLightUniformsLib} from "@/libs/threejs/libs/jsm/lights/RectAreaLightUniformsLib.js";
  import {OBJLoader} from "@/libs/threejs/libs/jsm/loaders/OBJLoader.js";
  import {MTLLoader} from "@/libs/threejs/libs/jsm/loaders/MTLLoader.js";
  import {FBXLoader} from "@/libs/threejs/libs/jsm/loaders/FBXLoader.js";
  import {BabylonLoader} from "@/libs/threejs/libs/jsm/loaders/BabylonLoader.js";
  import {FrontSide, DoubleSide} from "three";
  import 'xgplayer';
  import FlvPlayer from 'xgplayer-flv';
  // linear color space
  export default {
    name: "cinema",
    props: ["propSeatList", "propSelectedSeat", "propHallInfo", "propAdList"],
    data() {
      return {
        container: "",
        scene: null,
        camera: "",
        renderer: "",
        controls: "",
        video: "",
        id: "",
        startCard: true,
        videoSrc: "",
        landscape: false,
        currentVideo: 0,
        pointLight: "",
        videoBaseUrl: "",
        imgBaseUrl: "",
        videoSrcList: this.propAdList,
        videoTexture: "",
        nowSeatIndex: 0,
        selectedSeat: this.propSelectedSeat,
        hallInfo: this.propHallInfo,
        seatGroup: '',
        adUrl: '',
        adImg: '',
        people: '',
        cinemaAltitude: '',
        cinemaHeight: '',
        cinemaWidth: '',
        seatList: this.propSeatList,
      };
    },
    mounted() {
      let self = this; // 这里
      let width = document.documentElement.clientWidth;
      let height = document.documentElement.clientHeight;
      if (width > height) {
        self.landscape = true;
        self.showCinema();
      }
      if (document.hidden !== undefined) {
        // document.addEventListener('visibilitychange', this.replay, false)
      }
      window.addEventListener(
        "onorientationchange" in window ? "orientationchange" : "resize", this.turnScreen,
        false
      );

    },
    beforeDestroy() {
      // Perform the teardown procedure for someLeakyProperty.
      // (In this case, effectively nothing)
      cancelAnimationFrame(this.id);
      while (this.scene.children.length > 0) {
        this.scene.remove(this.scene.children[0]);
      }
      // document.removeEventListener('visibilitychange', this.replay, false);
      // this.video.removeEventListener("ended", this.nextVideo);
      window.removeEventListener("resize", this.onWindowResize, false);
      window.removeEventListener(
        "onorientationchange" in window ? "orientationchange" : "resize", this.turnScreen, false);
      this.scene = null;
      this.camera = null;
      this.controls = null;
      this.renderer = null;
      this.video = null;
    },
    methods: {
      turnScreen() {
        let self = this;
        // if (window.orientation === 90 || window.orientation === -90) {
        //   alert("横屏");
        // }
        switch (
          window.orientation //90 -90 横屏,0 180 竖屏
          ) {
          case -90:
          case 90:
            setTimeout(() => {
              self.landscape = true;
              self.showCinema();
            }, 1000);

            break;
          case 0:
          case 180:
            self.landscape = false;
            break;
        }
        //window.location.reload();
      },
      replay() {
        if (document.visibilityState == 'visible') {
          this.video.play();
        }
      },
      goToAdUrl() {
        // this.video.pause();
        window.open(this.adUrl, '_system');
      },
      exit() {
        this.$emit("exit3d",);
      },
      nextVideo() {
        this.videoPlay("next");
      },
      initNowSeat() {
        let self = this;
        var seat = self.seatGroup.getObjectByName(self.getNowSeat());
        // seat.translateY(50);
        // console.log(seat.position);
        // console.log(self.camera.position);
        // new TWEEN.Tween(self.camera.position)
        //   .to(
        //     {
        //       x: seat.position.x,
        //       y: seat.position.y + 100,
        //       z: seat.position.z
        //     },
        //     2500
        //   )
        //   .delay(200)
        //   .easing(TWEEN.Easing.Cubic.InOut)
        //   .onUpdate(function() {
        //     self.camera.position.set(
        //       seat.position.x,
        //       seat.position.y + 100,
        //       seat.position.z
        //     );
        //   })
        //   .start();
        self.camera.position.set(
          seat.position.x,
          seat.position.y + 65,
          seat.position.z
        );
        if (self.pointLight === "") {
          self.pointLight = new THREE.PointLight(0x2b2b2d, 3, 100000);
          self.scene.add(self.pointLight);
        }
        // new TWEEN.Tween(self.pointLight.position)
        //   .to(
        //     {
        //       x: seat.position.x,
        //       y: seat.position.y + 100,
        //       z: seat.position.z
        //     },
        //     2500
        //   )
        //   .delay(200)
        //   .easing(TWEEN.Easing.Cubic.InOut)
        //   .onUpdate(function() {
        //     self.pointLight.position.set(
        //       seat.position.x,
        //       seat.position.y + 100,
        //       seat.position.z
        //     );
        //   })
        //   .start();
        self.pointLight.position.set(
          seat.position.x,
          seat.position.y + 100,
          seat.position.z
        );
        // if (self.people !== "") {
        //   self.people.position.set(
        //     seat.position.x,
        //     seat.position.y + 100,
        //     seat.position.z - 100
        //   );
        // }

        self.lookScreen();
      },
      switchSeat(mod) {
        if (mod === "next") {
          if (this.nowSeatIndex < this.selectedSeat.length - 1) {
            this.nowSeatIndex++;
          } else {
            this.nowSeatIndex = 0;
          }
        } else {
          if (this.nowSeatIndex > 0) {
            this.nowSeatIndex--;
          } else {
            this.nowSeatIndex = this.selectedSeat.length - 1;
          }
        }
        this.initNowSeat();
      },
      getNowSeat() {
        let nowSeat = this.selectedSeat[this.nowSeatIndex];
        return `seat_${nowSeat.gRow}_${nowSeat.gCol}`;
      },
      videoPlay(flag) {
        let self = this;
        // var isPlaying = self.video.hasStart && !self.video.paused
        //   // self.video.currentTime > 0 &&
        //   // !self.video.paused &&
        //   // !self.video.ended &&
        //   // self.video.readyState > 2;
        // console.log(isPlaying)
        // if (!isPlaying) {
          // self.video.src = self.videoBaseUrl + self.videoSrcList[self.currentVideo].ad_name;
          self.video.start(self.videoSrcList[self.currentVideo].url)
          // console.log(self.video.src)
          self.adUrl = self.videoSrcList[self.currentVideo].ad_url;
          self.adImg = self.imgBaseUrl + self.videoSrcList[self.currentVideo].img;
          // self.video.load();
          if (flag === "init") {
            self.startCard = false;
            setTimeout(() => {
              var playPromise = self.video.play();
              self.show(playPromise);
              // self.currentVideo++;
              // if (self.currentVideo >= self.videoSrcList.length) {
              //   self.currentVideo = 0;
              // }
            }, 1000);
          // } else {
            // setTimeout(() => {
            //   self.currentVideo++;
            //   if (self.currentVideo >= self.videoSrcList.length) {
            //     self.currentVideo = 0;
            //   }
            //   self.video.play();
            // }, 1000);
          // }
        }
      },
      showCinema() {
        if (this.scene === null) {
          this.init();
          this.animate();
        }

      },
      show(playPromise) {
        let self = this;
        if (playPromise !== undefined) {
          playPromise
            .then(_ => {
              var texture = new THREE.VideoTexture(self.video.video);
              texture.minFilter = THREE.LinearFilter;
              texture.magFilter = THREE.LinearFilter;
              texture.format = THREE.RGBFormat;
              var movieMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                overdraw: true
              });

              self.movieScreen.material = movieMaterial;
              // the geometry on which the movie will be displayed;
              // 		movie image will be scaled to fit these dimensions.
              // var movieGeometry = new THREE.PlaneGeometry(
              //   self.cinemaWidth,
              //   self.cinemaWidth / 2,
              //   4,
              //   4
              // );
              // self.movieScreen = new THREE.Mesh(movieGeometry, movieMaterial);
              //
              // self.movieScreen.rotateY(Math.PI);
              // self.movieScreen.position.set(0, self.cinemaWidth / 4, 0);
              // // movieScreen.position.set(0, 240, -500);
              //
              // self.scene.add(self.movieScreen);
              // console.log(self.camera.position);

              // self.launchFullscreen(self.$refs.cinema);
            })
            .catch(error => {
              console.log(error);
              // self.videoPlay("next");
              // Auto-play was prevented
              // Show paused UI.
            });
        }
      },
      launchFullscreen(element) {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        }
      },
      // FUNCTIONS
      init() {
        // SCENE
        let self = this;
        self.scene = new THREE.Scene();

        // CAMERA
        var SCREEN_WIDTH = window.innerWidth,
          SCREEN_HEIGHT = window.innerHeight;
        var VIEW_ANGLE = 45,
          ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
          NEAR = 1,
          FAR = 100000;
        self.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        self.scene.add(self.camera);
        self.camera.position.set(0, 0, 0);
        // RENDERER

        self.renderer = new THREE.WebGLRenderer({antialias: true});
        self.renderer.setPixelRatio(window.devicePixelRatio);
        self.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        self.renderer.shadowMap.enabled = true;
        self.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        self.renderer.gammaInput = true;
        self.renderer.gammaOutput = true;
        self.container = self.$refs.cinema;
        self.container.appendChild(self.renderer.domElement);
        // CONTROLS
        // self.controls = new OrbitControls(self.camera, self.renderer.domElement);
        self.controls = new PointerLockControls(self.camera, self.container);
        self.scene.add(self.controls.getObject());

        window.addEventListener("resize", self.onWindowResize, false);

        // EVENTS
        self.cinemaWidth =
          self.hallInfo.col * (self.hallInfo.seatWidth) + 100;
        self.cinemaWidth = self.hallInfo.screenWidth > self.cinemaWidth ? self.hallInfo.screenWidth + 100 : self.cinemaWidth;
        self.cinemaHeight =
          self.hallInfo.row *
          (self.hallInfo.seatWidth + self.hallInfo.seatSpace) +
          self.hallInfo.screenSpace +
          100;
        self.cinemaAltitude = self.hallInfo.seatHeight + self.hallInfo.row * self.hallInfo.seatStepHeight;
        self.cinemaAltitude = (self.cinemaWidth / 2) > self.cinemaAltitude ? self.cinemaWidth / 2 : self.cinemaAltitude;
        var geoFloor = new THREE.BoxBufferGeometry(
          self.cinemaWidth + 100,
          0.2,
          self.cinemaHeight + 100
        );
        var matStdFloor = new THREE.MeshStandardMaterial({
          color: 0x2b2b2d,
          roughness: 0,
          metalness: 0
        });
        var mshStdFloor = new THREE.Mesh(geoFloor, matStdFloor);
        mshStdFloor.position.set(0, 0, -(self.cinemaHeight / 2));
        self.scene.add(mshStdFloor);

        for (let i = 2; i <= self.hallInfo.row; i++) {
          var z = 0;
          if (i === self.hallInfo.row) {
            z = self.hallInfo.seatWidth + self.hallInfo.seatSpace + 100;
          } else {
            z = self.hallInfo.seatWidth + self.hallInfo.seatSpace;
          }
          var footstep = new THREE.BoxBufferGeometry(
            self.cinemaWidth + 100,
            self.hallInfo.seatStepHeight * (i - 1),
            z
          );
          var matFootstep = new THREE.MeshStandardMaterial({
            color: 0x2b2b2d,
            roughness: 0,
            metalness: 0
          });
          var mshFootstep = new THREE.Mesh(footstep, matFootstep);
          if (i === self.hallInfo.row) {
            mshFootstep.position.set(0, self.hallInfo.seatStepHeight * (i - 1) / 2, -(50 + self.hallInfo.screenSpace + (self.hallInfo.seatWidth + self.hallInfo.seatSpace) * (i - 1)));
          } else {
            mshFootstep.position.set(0, self.hallInfo.seatStepHeight * (i - 1) / 2, -(self.hallInfo.screenSpace + (self.hallInfo.seatWidth + self.hallInfo.seatSpace) * (i - 1)));
          }

          mshFootstep.name = `footstep_${i}`;
          self.scene.add(mshFootstep);
        }

        // box

        var geometry = new THREE.BoxGeometry(self.cinemaWidth + 100,
          self.cinemaAltitude + 100 + 5,
          self.cinemaHeight + 100);
        var material = new THREE.MeshStandardMaterial({
          bumpScale: 10,
          color: 0x2b2b2d,
          metalness: 0.8,
          roughness: 0.8,
          side: THREE.DoubleSide
        });
        var cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, self.cinemaAltitude / 2 + 50 - 5, -(self.cinemaHeight / 2));
        self.scene.add(cube);

        var ambient = new THREE.AmbientLight(0xffffff, 0.8);
        self.scene.add(ambient);
        // var skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
        // var skyBoxMaterial = new THREE.MeshBasicMaterial({
        //   color: 0x9999ff,
        //   side: THREE.BackSide
        // });
        //
        // var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
        // self.scene.add(skyBox);
        // self.scene.fog = new THREE.FogExp2(0x9999ff, 0.00025);
        self.initScreen();
        // var axes = new THREE.AxisHelper(10);
        // self.scene.add(axes);

        const loadingManager = new THREE.LoadingManager(() => {
          const loadingScreen = document.getElementById("loading-screen");
          loadingScreen.classList.add("fade-out");

          // optional: remove loader from DOM via event listener
          loadingScreen.addEventListener("transitionend", self.onTransitionEnd);
        });

        var textureLoader = new THREE.TextureLoader(loadingManager);
        textureLoader.load("/static/model/obj/dcmap_unknown_tuscany_1.jpg", function (texture) {
          // texture.wrapS = THREE.RepeatWrapping;
          // texture.wrapT = THREE.RepeatWrapping;
          // texture.repeat.set( 10, 10 );
          // mesh is a group contains multiple sub-objects. Traverse and apply texture to all.
          var material = new THREE.MeshPhysicalMaterial({map: texture, metalness: 0.5, roughness: 0.5});
          mshStdFloor.material = material;
          for (let i = 2; i <= self.hallInfo.row; i++) {
            var mshFootstep = self.scene.getObjectByName(`footstep_${i}`);
            mshFootstep.material = material;
          }
        });

        if (self.hallInfo.wall_texture !== undefined && self.hallInfo.wall_texture !== null && self.hallInfo.wall_texture !== "") {
          textureLoader.load("/static/model/obj/star.jpg", function (texture) {
            // mesh is a group contains multiple sub-objects. Traverse and apply texture to all.
            var material = new THREE.MeshPhysicalMaterial({
              map: texture,
              bumpScale: 10,
              color: 0x171515,
              metalness: 0,
              roughness: 0.7,
              side: THREE.DoubleSide
            });
            cube.material = material;
          });
        }


        // var onError = function (error) {
        //   console.log(error);
        // };
        // var onProgress = function (xhr) {
        //   if (xhr.lengthComputable) {
        //     var percentComplete = (xhr.loaded / xhr.total) * 100;
        //     // console.log(Math.round(percentComplete, 2) + "% downloaded");
        //   }
        // };
        // new MTLLoader(loadingManager)
        //   .setPath("/static/model/obj/")
        //   .load("unknown_tuscany_obj.mtl", function (materials) {
        //     materials.preload();
        //
        //     new OBJLoader(loadingManager)
        //       .setMaterials(materials)
        //       .setPath("/static/model/obj/")
        //       .load(
        //         "unknown_tuscany_obj.obj",
        //         function (object) {
        //           self.seatGroup = new THREE.Group();
        //           object.castShadow = true;
        //           var center = new THREE.Vector3();
        //           var box = new THREE.Box3().setFromObject(object);
        //
        //           let radius = box.getBoundingSphere(center).radius;
        //           // object.translate(
        //           //   box.center(center).x,
        //           //   box.center(center).y,
        //           //   box.center(center).z
        //           // );
        //           object.position.set((self.hallInfo.seatWidth + 10) * self.hallInfo.col / 2, 0, 0);
        //           let scale = self.hallInfo.seatWidth / radius;
        //           object.scale.multiplyScalar(scale);
        //           // object.rotateY(Math.PI);
        //           object.translateZ(-self.hallInfo.screenSpace);
        //           for (var i = 0; i < self.seatList.length; i++) {
        //             var obj = object.clone();
        //             obj.translateX(
        //               -((self.hallInfo.seatWidth + 10) * self.seatList[i].gCol)
        //             );
        //             obj.translateZ(
        //               -(
        //                 (self.hallInfo.seatWidth + self.hallInfo.seatSpace + 10) *
        //                 (self.seatList[i].gRow - 1)
        //               )
        //             );
        //             obj.translateY(
        //               self.hallInfo.seatStepHeight * (self.seatList[i].gRow - 1)
        //             );
        //             obj.name = `seat_${self.seatList[i].gRow}_${self.seatList[i].gCol}`;
        //             self.seatGroup.add(obj);
        //           }
        //           var box = new THREE.Box3().setFromObject(self.seatGroup);
        //           self.scene.add(self.seatGroup);
        //           self.initNowSeat();
        //         },
        //         onProgress,
        //         onError
        //       );
        //   });
        var loader = new FBXLoader(loadingManager);

        loader.load(
          // 资源的URL
          "/static/model/obj/chair.fbx",

          // onLoad回调
          // Here the loaded data is assumed to be an object
          function (object) {
            // Add the loaded object to the scene
            var textureLoader = new THREE.TextureLoader(loadingManager);
            textureLoader.load("/static/model/obj/chair.jpg", function (texture) {
              // mesh is a group contains multiple sub-objects. Traverse and apply texture to all.
              var material = new THREE.MeshPhysicalMaterial({map: texture, metalness: 0.5, roughness: 0.5});
              object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                  // apply texture
                  child.material = material;
                  child.material.needsUpdate = true;
                }
              });
              self.seatGroup = new THREE.Group();
              object.castShadow = true;
              var center = new THREE.Vector3();
              var box = new THREE.Box3().setFromObject(object);

              let radius = box.getBoundingSphere(center).radius;
              // object.translate(
              //   box.center(center).x,
              //   box.center(center).y,
              //   box.center(center).z
              // );
              object.position.set((self.hallInfo.seatWidth) * self.hallInfo.col / 2, 0, 0);
              let scale = self.hallInfo.seatWidth / radius;
              object.scale.multiplyScalar(scale);
              object.rotation.set(0, 0, 0);
              object.translateZ(-self.hallInfo.screenSpace);
              for (var i = 0; i < self.seatList.length; i++) {
                var obj = object.clone();
                obj.translateX(
                  -((self.hallInfo.seatWidth) * self.seatList[i].gCol)
                );
                obj.translateZ(
                  -(
                    (self.hallInfo.seatWidth + self.hallInfo.seatSpace) *
                    (self.seatList[i].gRow - 1)
                  )
                );
                obj.translateY(
                  self.hallInfo.seatStepHeight * (self.seatList[i].gRow - 1)
                );
                obj.name = `seat_${self.seatList[i].gRow}_${self.seatList[i].gCol}`;
                self.seatGroup.add(obj);
              }
              var box = new THREE.Box3().setFromObject(self.seatGroup);
              self.scene.add(self.seatGroup);
              self.initNowSeat();
            });
          },

          // onProgress回调
          function (xhr) {
            // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
          },

          // onError回调
          function (err) {
            console.error('An error happened');
          }
        );
        // new FBXLoader().load('/static/model/obj/Finn.FBX', function (object) {
        //   object.castShadow = true;
        //   var radius = 8000;
        //   let scale = self.hallInfo.seatWidth / radius;
        //   object.scale.multiplyScalar(scale);
        //   self.people = object;
        //   self.scene.add(self.people);
        //   self.initNowSeat();
        // });
        // loader.loadMtl('/static/unknown_tuscany_obj.mtl', null, (materials) => {
        //       loader.setMaterials(materials);
        //       loader.load('/static/unknown_tuscany_obj.obj', (event) => {
        //         const root = event.detail.loaderRootNode;
        //         self.scene.add(root);
        //       });
        //     });
        // load a resource
        // loader.load(
        //   // resource URL
        //   "/static/unknown_tuscany_obj.obj",
        //   // called when resource is loaded
        //   function(object) {
        //     self.scene.add(object);
        //   },
        //   // called when loading is in progresses
        //   function(xhr) {
        //     console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        //   },
        //   // called when loading has errors
        //   function(error) {
        //     console.log("An error happened");
        //   }
        // );
        // FLOOR
        // var floorTexture = new THREE.ImageUtils.loadTexture(
        //   "static/media/checkerboard.jpg"
        // );
        // floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
        // floorTexture.repeat.set(10, 10);
        // var floorMaterial = new THREE.MeshBasicMaterial({
        //   map: floorTexture,
        //   side: THREE.DoubleSide
        // });

        // var specularShininess = Math.pow(2, 0.5 * 10);
        // var specularColor = new THREE.Color(0.5 * 0.2, 0.5 * 0.2, 0.5 * 0.2);
        // var diffuseColor = new THREE.Color()
        //   .setHSL(0.5, 0.5, 0.5 * 0.5 + 0.1)
        //   .multiplyScalar(1 - 0.5 * 0.2);
        // var floorMaterial = new THREE.MeshToonMaterial({
        //   color: diffuseColor,
        //   specular: specularColor,
        //   reflectivity: 0.5,
        //   shininess: specularShininess,
        //   side: THREE.DoubleSide
        // });
        // var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
        // var floor = new THREE.Mesh(floorGeometry, floorMaterial);
        // floor.position.y = -0.5;
        // floor.rotation.x = Math.PI / 2;
        // self.scene.add(floor);

        // SKYBOX/FOG
        // var skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
        // var skyBoxMaterial = new THREE.MeshBasicMaterial({
        //   color: 0x9999ff,
        //   side: THREE.BackSide
        // });
        // var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
        // self.scene.add(skyBox);
        // self.scene.fog = new THREE.FogExp2(0x9999ff, 0.00025);

        var instructions = self.$refs.instructions;

        instructions.addEventListener(
          "click",
          function () {
            self.controls.lock();
          },
          false
        );
        // var axesHelper = new THREE.AxesHelper(10000);
        // self.scene.add(axesHelper);
        // LIGHT
        // RectAreaLightUniformsLib.init();
        // var rectLight = new THREE.RectAreaLight(0xffffff, 8, 1000, 1000);
        // rectLight.position.set(0, 500, 0);
        // self.scene.add(rectLight);
        // var rectLightMesh = new THREE.Mesh(
        //   new THREE.PlaneBufferGeometry(),
        //   new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })
        // );
        // rectLightMesh.scale.x = rectLight.width;
        // rectLightMesh.scale.y = rectLight.height;
        // rectLightMesh.rotateZ(Math.PI/2);
        // rectLightMesh.rotateY(Math.PI/2);
        // rectLight.add(rectLightMesh);
        // var rectLightMeshBack = new THREE.Mesh(
        //   new THREE.PlaneBufferGeometry(),
        //   new THREE.MeshBasicMaterial({ color: 0x080808 })
        // );
        // rectLightMesh.add(rectLightMeshBack);

        ///////////
        // VIDEO //
        ///////////

        // create the video element

        // self.video = self.$refs.video;
        self.video = new FlvPlayer({
          id: 'mse',
          url: 'https://60-221-21-138.bytefcdnrd.com/third/stream-688435761856119467_hd.flv?302_type=cold_aggr&_session_id=2017153953.n.cn-yj2pds.7xtu_2504&abr_pts=-1800&domain=pull-hs-f5.flive.douyincdn.com&manage_ip=&node_id=&pro_type=http2&redirect_from=pod.cn-yj2pds.7xtu.nss&vhost=push-rtmp-hs-f5.douyincdn.com',
          poster: './poster.png',
          isLive: true,
          // preloadTime: 30,
          // minCachedTime: 5,
          cors: true
        })
        self.video.play()
        // self.video.addEventListener("ended", this.nextVideo);
        // enableInlineVideo(self.video, {everywhere: true});
      },
      initScreen() {
        let self = this;
        var texture = new THREE.TextureLoader().load(
          "/static/img/screen_default1.png"
        );

        var movieMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          overdraw: true
        });
        // the geometry on which the movie will be displayed;
        // 		movie image will be scaled to fit these dimensions.
        var movieGeometry = new THREE.PlaneGeometry(
          self.hallInfo.screenWidth,
          self.hallInfo.screenHeight,
          4,
          4
        );
        self.movieScreen = new THREE.Mesh(movieGeometry, movieMaterial);

        self.movieScreen.rotateY(Math.PI);
        self.movieScreen.position.set(0, self.cinemaWidth / 4, 0);
        // movieScreen.position.set(0, 240, -500);

        self.scene.add(self.movieScreen);
      },
      onTransitionEnd(event) {
        event.target.remove();
      },
      lookScreen() {
        let self = this;
        var line = new THREE.Line3(
          self.camera.position,
          self.movieScreen.position
        );
        var look = new THREE.Vector3();
        line.delta(look);
        self.camera.lookAt(look);
      },
      animate() {
        this.id = window.requestAnimationFrame(this.animate);
        // TWEEN.update();
        this.render();
      },
      onWindowResize() {
        let self = this;
        setTimeout(() => {
          self.camera.aspect = window.innerWidth / window.innerHeight;
          self.renderer.setSize(window.innerWidth, window.innerHeight);
        }, 1000);

      },
      render() {
        this.renderer.render(this.scene, this.camera);
      }
    }
  };
</script>

<style lang="less" scoped>
  .start {
    position: absolute;
    z-index: 3;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.65);
    opacity: 1;
    transition: 1s opacity;

    .start-btn {
      display: block;
      position: relative;
      left: 50%;
      top: 50%;
      width: 100px;
      height: 100px;
      margin: -50px 0 0 -50px;
    }
    .van-button--info {
      background-color: #0000004a;
      border: 1px solid #000000;
    }
  }

  .start.fade-out {
    opacity: 0;
  }

  .landscape {
    position: absolute;
    z-index: 4;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 1);
    opacity: 1;
    transition: 1s opacity;

    .text {
      display: block;
      position: relative;
      left: 50%;
      top: 50%;
      font-size: 20px;
      color: white;
      width: 100px;
      height: 100px;
      margin: -50px 0 0 -50px;
    }
  }

  .switch-seat {
    position: absolute;
    z-index: 2;
    bottom: 20px;
    left: 50%;
    width: 100px;
    height: 50px;
    margin: -25px 0 0 -50px;
    opacity: 1;
    transition: 1s opacity;
    .van-button--info {
      color: #fff;
      background-color: #00000061;
      border: 1px solid #ffffff;
      border-radius: 50%;
    }
  }

  .info {
    position: absolute;
    z-index: 2;
    bottom: 20px;
    left: 20px;
    width: 300px;
    height: 50px;
    opacity: 1;
    transition: 1s opacity;
    text-align: left;
  }

  .ad {
    position: absolute;
    z-index: 2;
    bottom: 40px;
    right: 20px;
    width: 300px;
    height: 50px;
    margin: -25px 0 0 -50px;
    opacity: 1;
    transition: 1s opacity;
    text-align: right;
    .van-image {
      bottom: 0;
      right: 0;
      position: absolute;
    }
  }

  .exit {
    position: absolute;
    z-index: 2;
    top: 20px;
    left: 20px;
    width: 300px;
    height: 50px;
    margin: 0 0 0 -50px;
    opacity: 1;
    transition: 1s opacity;
    text-align: right;
    .van-button--info {
      left: 50px;
      color: #fff;
      position: absolute;
      background-color: #00000061;
      border: 1px solid #ffffff;
    }
  }

  .container {
    width: 100%;
    height: 100%;
    .cinema {
      width: 100%;
      height: 100%;
    }
    canvas {
      width: 100%;
      height: 100%;
      display: block;
    }

    #video {
      position: fixed;
      left: 0;
      bottom: 0;
    }

    #loading-screen {
      position: absolute;
      z-index: 6;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #000000;
      opacity: 1;
      transition: 1s opacity;
    }

    #loading-screen.fade-out {
      opacity: 0;
    }

    #loader {
      display: block;
      position: relative;
      left: 50%;
      top: 50%;
      width: 150px;
      height: 150px;
      margin: -75px 0 0 -75px;
      border-radius: 50%;
      border: 3px solid transparent;
      border-top-color: #9370db;
      -webkit-animation: spin 2s linear infinite;
      animation: spin 2s linear infinite;
    }
    #loader:before {
      content: "";
      position: absolute;
      top: 5px;
      left: 5px;
      right: 5px;
      bottom: 5px;
      border-radius: 50%;
      border: 3px solid transparent;
      border-top-color: #ba55d3;
      -webkit-animation: spin 3s linear infinite;
      animation: spin 3s linear infinite;
    }
    #loader:after {
      content: "";
      position: absolute;
      top: 15px;
      left: 15px;
      right: 15px;
      bottom: 15px;
      border-radius: 50%;
      border: 3px solid transparent;
      border-top-color: #ff00ff;
      -webkit-animation: spin 1.5s linear infinite;
      animation: spin 1.5s linear infinite;
    }
    @-webkit-keyframes spin {
      0% {
        -webkit-transform: rotate(0deg);
        -ms-transform: rotate(0deg);
        transform: rotate(0deg);
      }
      100% {
        -webkit-transform: rotate(360deg);
        -ms-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }
    @keyframes spin {
      0% {
        -webkit-transform: rotate(0deg);
        -ms-transform: rotate(0deg);
        transform: rotate(0deg);
      }
      100% {
        -webkit-transform: rotate(360deg);
        -ms-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }
  }

  /*@media screen and (orientation: portrait) {*/
  /*.main {*/
  /*-webkit-transform: rotate(90deg);*/
  /*-moz-transform: rotate(90deg);*/
  /*-ms-transform: rotate(90deg);*/
  /*transform: rotate(90deg);*/
  /*!*width: 100vh;*!*/
  /*!*height: 100vh;*!*/
  /*!*去掉overflow 微信显示正常，但是浏览器有问题，竖屏时强制横屏缩小*!*/
  /*!*overflow: hidden;*!*/
  /*}*/
  /*}*/

  /*@media screen and (orientation: landscape) {*/
  /*.main {*/
  /*-webkit-transform: rotate(0);*/
  /*-moz-transform: rotate(0);*/
  /*-ms-transform: rotate(0);*/
  /*transform: rotate(0)*/
  /*}*/
  /*}*/
</style>
