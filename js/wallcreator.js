// wallcreator.js
import * as THREE from "https://cdn.skypack.dev/three@0.128.0";

export class WallCreator {
  constructor(scene, collidableObjects, wallMaterial) {
    this.scene = scene;
    this.collidableObjects = collidableObjects;
    this.wallMaterial = wallMaterial;
  }

  createWallAtClick(mouse, camera, callback) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(this.scene.children, true);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      const snapX = Math.round(point.x);
      const snapZ = Math.round(point.z);
      callback(snapX, snapZ); // 콜백 함수 호출하여 미로 검사 및 벽 추가
    }
  }

  createWall(x, z) {
    const gridSize = 1; // 격자 크기
    const snapX = x;
    const snapZ = z;

    if (this.isWallPresent(snapX, snapZ)) {
      console.log(`Wall already exists at x: ${snapX}, z: ${snapZ}`);
      return;
    }

    const wallGeometry = new THREE.BoxGeometry(gridSize, 5, gridSize);
    const wall = new THREE.Mesh(wallGeometry, this.wallMaterial);
    wall.position.set(snapX, 2.5, snapZ);
    this.scene.add(wall);
    this.collidableObjects.push(wall);

    console.log(
      `Wall created at x: ${snapX.toFixed(2)}, z: ${snapZ.toFixed(2)}`
    );
  }

  isWallPresent(x, z) {
    for (let obj of this.collidableObjects) {
      if (obj.position.x === x && obj.position.z === z) {
        return true;
      }
    }
    return false;
  }
}
