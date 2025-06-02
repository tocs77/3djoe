import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { LoadingBar } from './libs/LoadingBar';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

export class App {
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  loadingBar: LoadingBar;
  plane: THREE.Group | null = null;
  eve: THREE.Group | null = null;
  mixer: THREE.AnimationMixer | null = null;
  eveAnimations: Record<string, THREE.AnimationClip> = {};
  currentAction: string = '';
  clock: THREE.Clock;
  curAction: THREE.AnimationAction | undefined = undefined;

  constructor() {
    const container = document.createElement('div');
    document.body.appendChild(container);
    window.addEventListener('resize', this.resize.bind(this));
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    this.clock = new THREE.Clock();
    this.camera.position.set(0, 0, 4);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xaaaaaa);
    this.scene.add(this.camera);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);
    this.renderer.setAnimationLoop(this.render.bind(this));

    this.loadingBar = new LoadingBar();
    //this.loadGLTFPlane();
    this.loadGLTFEve();
    const ambientLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.3);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight();
    directionalLight.position.set(0.2, 1, 1);
    this.scene.add(directionalLight);

    new OrbitControls(this.camera, this.renderer.domElement);
  }

  createStarGeometry(innerRadius: number, outerRadius: number, points: number) {
    const shape = new THREE.Shape();
    const PI2 = Math.PI * 2;
    const inc = PI2 / (points * 2);
    shape.moveTo(outerRadius, 0);
    let inner = true;
    for (let theta = 0; theta <= PI2; theta += inc) {
      const r = inner ? innerRadius : outerRadius;
      shape.lineTo(r * Math.cos(theta), r * Math.sin(theta));
      inner = !inner;
    }
    const extrudeSettings = {
      steps: 1,
      depth: 1,
      bevelEnabled: false,
    };
    const extrudeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    return extrudeGeometry;
  }

  loadGLTFPlane() {
    const loader = new GLTFLoader().setPath('/assets/plane/');
    loader.load(
      'microplane.glb',
      (gltf) => {
        this.scene.add(gltf.scene);
        this.loadingBar.visible = false;
        this.renderer.setAnimationLoop(this.render.bind(this));
        this.plane = gltf.scene;
      },
      (xhr) => {
        this.loadingBar.progress = xhr.loaded / xhr.total;
      },
      (error) => {
        console.error(error);
      },
    );
  }

  loadGLTFEve() {
    const loader = new GLTFLoader().setPath('/assets/factory/');
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('../../../node_modules/three/examples/jsm/libs/draco/');
    loader.setDRACOLoader(dracoLoader);
    loader.load(
      'eve.glb',
      (gltf) => {
        this.scene.add(gltf.scene);

        this.eve = gltf.scene;
        this.mixer = new THREE.AnimationMixer(this.eve);
        for (const animation of gltf.animations) {
          this.eveAnimations[animation.name.toLowerCase()] = animation;
        }
        this.newEveAnimation();
        this.loadingBar.visible = false;
        this.renderer.setAnimationLoop(this.render.bind(this));
      },
      (xhr) => {
        this.loadingBar.progress = xhr.loaded / xhr.total;
      },
      (error) => {
        console.error(error);
      },
    );
  }

  newEveAnimation() {
    const keys = Object.keys(this.eveAnimations);
    let randomKey = keys[Math.floor(Math.random() * keys.length)];
    while (true) {
      randomKey = keys[Math.floor(Math.random() * keys.length)];
      if (randomKey !== this.currentAction) break;
    }
    this.action = randomKey;
    setTimeout(this.newEveAnimation.bind(this), 3000);
  }

  set action(name: string) {
    const clip = this.eveAnimations[name];
    if (clip) {
      const action = this.mixer?.clipAction(clip);
      if (!action) return;
      action?.reset();
      action?.play();
      if (this.curAction) {
        this.curAction.crossFadeTo(action, 0.5);
      }
      this.currentAction = name;
      this.curAction = action;
    }
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  render() {
    if (this.plane) {
      this.plane.rotation.y += 0.01;
    }
    const dt = this.clock.getDelta();
    if (this.mixer) this.mixer.update(dt);
    this.renderer.render(this.scene, this.camera);
  }
}
