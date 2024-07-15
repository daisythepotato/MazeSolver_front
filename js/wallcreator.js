import * as THREE from "https://cdn.skypack.dev/three@0.128.0";

export class WallCreator {
  constructor(scene, collidableObjects, wallMaterial) {
    this.scene = scene;
    this.collidableObjects = collidableObjects;
    this.wallMaterial = wallMaterial;
  }

  createWallAtClick(mouse, camera) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(this.scene.children, true);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      this.createWall(point.x, point.z);
    }
  }

  createWall(x, z) {
    const gridSize = 1; // 격자 크기
    const snapX = Math.round(x / gridSize) * gridSize;
    const snapZ = Math.round(z / gridSize) * gridSize;

    const wallGeometry = new THREE.BoxGeometry(gridSize, 5, gridSize);
    const wall = new THREE.Mesh(wallGeometry, this.wallMaterial);
    wall.position.set(snapX, 2.5, snapZ);
    this.scene.add(wall);
    this.collidableObjects.push(wall);

    console.log(
      `Wall created at x: ${snapX.toFixed(2)}, y: ${snapZ.toFixed(2)}`
    );
  }
}
