// ThreeJS and Third-party deps
import * as THREE from "three"
import * as dat from 'dat.gui'
import Stats from "three/examples/jsm/libs/stats.module"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

// Core boilerplate code deps
import { createCamera, createComposer, createRenderer, runApp, getDefaultUniforms } from "./core-utils"

import { EdgesPass } from "./EdgesPass"

global.THREE = THREE

/**************************************************
 * 0. Tweakable parameters for the scene
 *************************************************/
const params = {
  // general scene params
  texelUnit: 1.0,
  multiplier: 0.6
}


/**************************************************
 * 1. Initialize core threejs components
 *************************************************/
// Create the scene
let scene = new THREE.Scene()

// Create the renderer via 'createRenderer',
// 1st param receives additional WebGLRenderer properties
// 2nd param receives a custom callback to further configure the renderer
let renderer = createRenderer({ antialias: true }, (_renderer) => {
  _renderer.setClearColor('#eee')
  _renderer.physicallyCorrectLights = true
  _renderer.outputEncoding = THREE.sRGBEncoding
  _renderer.toneMapping = THREE.CineonToneMapping
  _renderer.toneMappingExposure = 1.75
  _renderer.shadowMap.enabled = true
  _renderer.shadowMap.type = THREE.PCFSoftShadowMap
})

// Create the camera
// Pass in fov, near, far and camera position respectively
let camera = createCamera(75, 1, 1000, { x: 0, y: 2, z: 5 })

// (Optional) Create the EffectComposer and passes for post-processing
// If you don't need post-processing, just comment/delete the following creation code, and skip passing any composer to 'runApp' at the bottom
let edgesPass = new EdgesPass({
  width: window.innerWidth,
  height: window.innerHeight,
  uParams: params
})
// The RenderPass is already created in 'createComposer'
let composer = createComposer(renderer, scene, camera, (comp) => {
  comp.addPass(edgesPass)
})

/**************************************************
 * 2. Build your scene in this threejs app
 * This app object needs to consist of at least the async initScene() function (it is async so the animate function can wait for initScene() to finish before being called)
 * initScene() is called after a basic threejs environment has been set up, you can add objects/lighting to you scene in initScene()
 * if your app needs to animate things(i.e. not static), include a updateScene(interval, elapsed) function in the app as well
 *************************************************/
let app = {
  async initScene() {
    // OrbitControls
    this.controls = new OrbitControls(camera, renderer.domElement)
    this.controls.enableDamping = true

    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 200, 32)
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    const torus = new THREE.Mesh(geometry, material)
    torus.castShadow = true
    torus.rotation.y = Math.PI / 4
    torus.position.set(0, 1, 0)
    scene.add(torus)

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    )
    plane.rotation.x = -Math.PI / 2
    plane.position.y = -0.75
    plane.receiveShadow = true
    scene.add(plane)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.castShadow = true
    directionalLight.position.set(2, 2, 2)
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    const hemisphereLight = new THREE.HemisphereLight(0x7a3114, 0x48c3ff, 0.5)
    scene.add(hemisphereLight)

    // GUI controls
    const gui = new dat.GUI()
    gui.add(params, 'texelUnit', 1, 20, 1)
    gui.add(params, 'multiplier', 0.1, 10, 0.1)

    // Stats - show fps
    this.stats1 = new Stats()
    this.stats1.showPanel(0) // Panel 0 = fps
    this.stats1.domElement.style.cssText = "position:absolute;top:0px;left:0px;"
    // this.container is the parent DOM element of the threejs canvas element
    this.container.appendChild(this.stats1.domElement)
  },
  // @param {number} interval - time elapsed between 2 frames
  // @param {number} elapsed - total time elapsed since app start
  updateScene(interval, elapsed) {
    this.controls.update()
    this.stats1.update()
  }
}

/**************************************************
 * 3. Run the app
 * 'runApp' will do most of the boilerplate setup code for you:
 * e.g. HTML container, window resize listener, mouse move/touch listener for shader uniforms, THREE.Clock() for animation
 * Executing this line puts everything together and runs the app
 * ps. if you don't use custom shaders, pass undefined to the 'uniforms'(2nd-last) param
 * ps. if you don't use post-processing, pass undefined to the 'composer'(last) param
 *************************************************/
runApp(app, scene, renderer, camera, true, undefined, composer)
