import { LoadingBar } from '@/libs/LoadingBar';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { Plane } from './Plane';

export class PlaneGame {
  loadingBar: LoadingBar;
  clock: THREE.Clock;
  camera: THREE.PerspectiveCamera;
  cameraController: THREE.Object3D;
  cameraTarget: THREE.Vector3;
  scene: THREE.Scene;
  ambient: THREE.HemisphereLight;
  renderer: THREE.WebGLRenderer;
  loading: boolean = false;
  plane: Plane | null = null;

  constructor() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    this.loadingBar = new LoadingBar();
    this.loadingBar.visible = false;
    this.clock = new THREE.Clock();

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(-4.37, 0, -4.75);
    this.camera.lookAt(0, 0, 6);

    this.cameraController = new THREE.Object3D();
    this.cameraController.add(this.camera);

    this.cameraTarget = new THREE.Vector3(0, 0, 6);
    this.scene = new THREE.Scene();
    this.scene.add(this.cameraController);

    this.ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    this.scene.add(this.ambient);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);
    this.setEnvironment();
    this.load();

    this.renderer.setAnimationLoop(this.render.bind(this));

    window.addEventListener('resize', this.resize.bind(this));
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  setEnvironment() {
    const loader = new RGBELoader();
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    loader.load(
      '/assets/hdr/venice_sunset_1k.hdr',
      (texture) => {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        this.scene.environment = envMap;
        texture.dispose();
        pmremGenerator.dispose();
      },
      undefined,
      (error) => {
        console.error('Failed to load HDR environment map:', error);
      },
    );
  }

  load() {
    this.loading = true;
    this.loadingBar.visible = true;
    this.loadSkyBox();
    this.plane = new Plane(this);
  }

  loadSkyBox() {
    this.scene.background = new THREE.CubeTextureLoader()
      .setPath('/assets/plane/paintedsky/')
      .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);
  }

  updateCamera() {
    if (!this.plane) return;
    this.cameraController.position.copy(this.plane.position);
    this.cameraController.position.y = 0;
    this.cameraTarget.copy(this.plane.position);
    this.cameraTarget.z += 6;
    this.camera.lookAt(this.cameraTarget);
  }

  render() {
    if (this.loading) {
      if (!this.plane?.ready) return;

      this.loading = false;
      this.loadingBar.visible = false;
    }
    const time = this.clock.getElapsedTime();
    this.plane?.update(time);
    this.updateCamera();
    this.renderer.render(this.scene, this.camera);
  }
}
