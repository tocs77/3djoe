import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class App {
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  mesh: THREE.Mesh;

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
    container.appendChild(this.renderer.domElement);
    this.renderer.setAnimationLoop(this.render.bind(this));

    // const geometry = new THREE.BoxGeometry(1, 1, 1);
    // const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    // this.mesh = new THREE.Mesh(geometry, material);
    // this.scene.add(this.mesh);
    const geometry = this.createStarGeometry(0.5, 1, 5);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);

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

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  render() {
    this.mesh.rotateY(0.01);
    this.renderer.render(this.scene, this.camera);
  }
}
