import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import TWEEN from 'three/examples/jsm/libs/tween.module.js';

const scene = new THREE.Scene()

// light Properties
const pointLight = new THREE.PointLight(0xffffff, 20, 100)
pointLight.position.set(0, 2, 0)
scene.add(pointLight)

// Camera Properties
const camera = new THREE.PerspectiveCamera(
  65, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  1000
)

// Renderer Properties
const canvas = document.querySelector('canvas.threejs')
const renderer = new THREE.WebGLRenderer({
  canvas,
antialias: true

})
renderer.setSize(window.innerWidth, window.innerHeight)

const maxPixelRatio = Math.min(window.devicePixelRatio, 2)
renderer.setPixelRatio(maxPixelRatio)

// Controls (Movement)
const controls = new PointerLockControls(camera, canvas)
let mouseDown = false

canvas.addEventListener('mousedown', () => {
  mouseDown = true
  controls.lock()
})

canvas.addEventListener('mouseup', () => {
  mouseDown = false
  controls.unlock()
})

// Raycaster Setup
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
let clickableObjects = []

//Objects to Animate (initialized after load)
let camera1, drawer1, drawer2, drawer3, handle, monitor, pillow1, pillow2, plant, plushie, seat, speaker1, speaker2

//Load 3D Model
const loader = new GLTFLoader()
loader.load(
  'models/RoomTemp.glb',
  (gltf) => {
    const model = gltf.scene
    model.position.set(2, -4, 2)
    scene.add(model)

    //Objects to Animate
    camera1 = model.getObjectByName('camera.main')
    drawer1 = model.getObjectByName('drawer1.main')
    drawer2 = model.getObjectByName('drawer2.main')
    drawer3 = model.getObjectByName('drawer3.main')
    handle = model.getObjectByName('handle.main')
    monitor = model.getObjectByName('monitor.main')
    pillow1 = model.getObjectByName('pillow1.main')
    pillow2 = model.getObjectByName('pillow2.main')
    plant = model.getObjectByName('plant.main')
    plushie = model.getObjectByName('plushie.main')
    seat = model.getObjectByName('seat.main')
    speaker1 = model.getObjectByName('speaker1.main')
    speaker2 = model.getObjectByName('speaker2.main')

    // Populate clickable objects array from all meshes inside the model
    clickableObjects = []
    model.traverse((child) => {
      if (child.isMesh) {
        clickableObjects.push(child)
        console.log('clickable mesh:', child.name)
      }
    })
    console.log('clickable object count:', clickableObjects.length)
  },
  undefined,
  (error) => {
    console.error('An error occurred while loading the model:', error)
  }
)

//Camera Resize Detection
const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

window.addEventListener('resize', onWindowResize)
onWindowResize()

// Animation function using Tween
const animateObject = (object) => {
  const startScale = object.scale.clone()
  const targetScale = startScale.clone().multiplyScalar(1.1)
  const startPos = object.position.clone()
  const targetPos = startPos.clone().add(new THREE.Vector3(0, 0.3, 0))

  new TWEEN.Tween({ scale: 1, y: 0 })
    .to({ scale: 1.1, y: 0.3 }, 300)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate((obj) => {
      object.scale.copy(startScale).multiplyScalar(obj.scale)
      object.position.copy(startPos).add(new THREE.Vector3(0, obj.y, 0))
    })
    .yoyo(true)
    .repeat(1)
    .start()
}

// Raycasting click handler
canvas.addEventListener('click', (event) => {
  console.log('click event fired')
  const rect = renderer.domElement.getBoundingClientRect()

  if (document.pointerLockElement === canvas) {
    // When pointer lock is active, use the center of the screen
    mouse.set(0, 0)
  } else {
    // Calculate mouse position in normalized device coordinates
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }

  // Update raycaster with camera and mouse position
  raycaster.setFromCamera(mouse, camera)

  // Check for intersections with clickable objects
  const intersects = raycaster.intersectObjects(clickableObjects, true)
  console.log('raycast hits', intersects.length)

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object
    console.log('clicked object', clickedObject.name)
    animateObject(clickedObject)
  }
})

// Render Loop
const renderloop = () => {
  TWEEN.update()
  renderer.render(scene, camera)
  window.requestAnimationFrame(renderloop)
}

renderloop()


