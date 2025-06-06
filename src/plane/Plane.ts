import { LoadingBar } from '@/libs/LoadingBar';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { PlaneGame } from './PlaneGame';
import * as THREE from 'three';

export class Plane {
  ready: boolean = false;
  game: PlaneGame;
  loadingBar: LoadingBar;
  scene: THREE.Scene;
  tmpPosition: THREE.Vector3;
  plane: THREE.Group | null = null;
  velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0.1);
  propeller: THREE.Object3D | null = null;

  constructor(game: PlaneGame) {
    this.game = game;
    this.loadingBar = game.loadingBar;
    this.scene = game.scene;
    this.load();
    this.tmpPosition = new THREE.Vector3();
  }

  get position() {
    if (this.plane) this.plane.getWorldPosition(this.tmpPosition);
    return this.tmpPosition;
  }

  set visible(value: boolean) {
    if (this.plane) this.plane.visible = value;
  }

  update(time: number) {
    if (this.propeller) this.propeller.rotateZ(1);
    if (this.plane) {
      this.plane.rotation.set(0, 0, Math.sin(time * 3) * 0.2, 'XYZ');
      this.plane.position.y = Math.cos(time) * 1.5;
    }
  }

  load() {
    const loader = new GLTFLoader().setPath('/assets/plane/');
    this.ready = false;
    loader.load(
      'microplane.glb',
      (gltf) => {
        this.scene.add(gltf.scene);
        this.plane = gltf.scene;
        this.velocity = new THREE.Vector3(0, 0, 0.1);
        const propeller = this.plane.getObjectByName('propeller');
        if (propeller) {
          this.propeller = propeller;
        } else {
          console.error('propeller not found');
        }

        this.ready = true;
      },
      (xhr) => {
        this.loadingBar.update('palne', xhr.loaded, xhr.total);
      },
      (error) => {
        console.error(error);
      },
    );
  }
}
