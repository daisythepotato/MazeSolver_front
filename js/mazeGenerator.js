import * as THREE from "https://cdn.skypack.dev/three@0.128.0";

export function createBasicMaze(scene, collidableObjects, wallMaterial) {
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
  const halfSize = mazeSize / 2;

  const createWall = (x, z, width, depth, addToMaze) => {
    const wallGeometry = new THREE.BoxGeometry(width, wallHeight, depth);
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(x, wallHeight / 2, z);
    scene.add(wall);
    collidableObjects.push(wall);

    if (addToMaze) {
      // 벽의 위치를 격자에 추가
      const gridX = Math.round(x + maze.size / 2);
      const gridZ = Math.round(z + maze.size / 2);
      const endX = gridX + Math.round(width / 2); // 가로 길이 고려
      const endZ = gridZ + Math.round(depth / 2); // 세로 길이 고려
      for (let i = Math.max(0, gridX); i < Math.min(maze.size, endX); i++) {
        for (let j = Math.max(0, gridZ); j < Math.min(maze.size, endZ); j++) {
          maze.addWall(i, j);
        }
      }
    }
  };

  const position = [
    {
      x: 0,
      z: -halfSize + wallThickness / 2,
      width: mazeSize,
      depth: wallThickness,
    },
    {
      x: 0,
      z: halfSize - wallThickness / 2,
      width: mazeSize,
      depth: wallThickness,
    },
    {
      x: -halfSize + wallThickness / 2,
      z: 0,
      width: wallThickness,
      depth: mazeSize,
    },
    {
      x: halfSize - wallThickness / 2,
      z: 0,
      width: wallThickness,
      depth: mazeSize,
    },
  ];
  position.forEach((pos) => createWall(pos.x, pos.z, pos.width, pos.depth));
  console.log("Basic maze initialized");
}
