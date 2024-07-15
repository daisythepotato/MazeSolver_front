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

    // 벽이 이미 있는지 확인
    if (this.isWallPresent(snapX, snapZ)) {
      console.log(`Wall already exists at x: ${snapX}, y: ${snapZ}`);
      return; // 이미 벽이 있으면 생성 취소
    }

    const wallGeometry = new THREE.BoxGeometry(gridSize, 5, gridSize);
    const wall = new THREE.Mesh(wallGeometry, this.wallMaterial);
    wall.position.set(snapX, 2.5, snapZ);
    this.scene.add(wall);
    this.collidableObjects.push(wall);

    console.log(
      `Wall created at x: ${snapX.toFixed(2)}, y: ${snapZ.toFixed(2)}`
    );
  }

  isWallPresent(x, z) {
    for (let obj of this.collidableObjects) {
      if (obj.position.x === x && obj.position.z === z) {
        return true; // 해당 위치에 벽이 이미 존재
      }
    }
    return false; // 벽이 없음
  }
}
