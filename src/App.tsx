import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { LoadingBar } from './libs/LoadingBar';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class App {
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  loadingBar: LoadingBar;
  plane: THREE.Group | null = null;

  constructor() {
    const container = document.createElement('div');
    document.body.appendChild(container);
    window.addEventListener('resize', this.resize.bind(this));
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
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
    this.loadGLTF();

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

  loadGLTF() {
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

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  render() {
    if (this.plane) {
      this.plane.rotation.y += 0.01;
    }
    this.renderer.render(this.scene, this.camera);
  }
}
