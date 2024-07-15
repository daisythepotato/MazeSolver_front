import * as THREE from "https://cdn.skypack.dev/three@0.128.0";

export class Player {
  constructor(scene, camera, initialPosition) {
    this.scene = scene;
    this.camera = camera;
    this.capsule = this.createPlayer();
    this.capsule.position.copy(initialPosition);
    this.scene.add(this.capsule);
  }

  createPlayer() {
    const radius = 0.5;
    const widthSegments = 5;
    const heightSegments = 16;
    const geometry = new THREE.SphereGeometry(
      radius,
      widthSegments,
      heightSegments
    );
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(0, radius, 0); // 초기 위치 설정
    return sphere;
  }
}
