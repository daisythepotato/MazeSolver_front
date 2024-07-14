import * as THREE from "https://cdn.skypack.dev/three@0.128.0";

export function createBasicMaze(scene, collidableObjects) {
  const mazeSize = 50; // 미로의 크기
  const wallHeight = 5; // 벽의 높이
  const wallThickness = 0.5; // 벽의 두께

  // 바닥 생성
  const floorGeometry = new THREE.PlaneGeometry(mazeSize, mazeSize);
  const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // 테두리 벽 생성
  const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
  const halfSize = mazeSize / 2;

  const createWall = (x, z, width, depth) => {
    const wallGeometry = new THREE.BoxGeometry(width, wallHeight, depth);
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(x, wallHeight / 2, z);
    scene.add(wall);
    collidableObjects.push(wall);
  };

  // 상단 벽
  createWall(0, -halfSize + wallThickness / 2, mazeSize, wallThickness);
  // 하단 벽
  createWall(0, halfSize - wallThickness / 2, mazeSize, wallThickness);
  // 왼쪽 벽
  createWall(-halfSize + wallThickness / 2, 0, wallThickness, mazeSize);
  // 오른쪽 벽
  createWall(halfSize - wallThickness / 2, 0, wallThickness, mazeSize);

  console.log("Basic maze initialized");
}
