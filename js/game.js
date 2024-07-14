import * as THREE from "https://cdn.skypack.dev/three@0.128.0";
import { Player } from "./player.js";
import { NPC } from "./npc.js";

export class Game {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xeeeeee);
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);

    this.collidableObjects = [];
    // 플레이어의 초기 위치를 미로의 왼쪽 위 모서리로 설정
    const playerInitialPosition = new THREE.Vector3(-23, 0.5, -23);
    this.player = new Player(this.scene, this.camera, playerInitialPosition);
    this.npc = new NPC(this.scene, this.collidableObjects);

    this.keyStates = {};

    this.speed = 0.1;
    this.turnSpeed = 0.02;

    this.addLights();

    window.addEventListener("resize", () => this.onWindowResize(), false);
    window.addEventListener("keydown", (event) => this.onKeyDown(event), false);
    window.addEventListener("keyup", (event) => this.onKeyUp(event), false);
  }

  init() {
    this.camera.position.set(0, 1.5, 5);
    this.camera.lookAt(0, 1.5, 0);
    this.addMaze();
  }

  addLights() {
    const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    this.scene.add(light);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(0, 10, 10);
    this.scene.add(directionalLight);
  }

  addMaze() {
    const mazeSize = 50; // 미로의 크기
    const wallHeight = 5; // 벽의 높이
    const wallThickness = 0.5; // 벽의 두께

    // 바닥 생성
    const floorGeometry = new THREE.PlaneGeometry(mazeSize, mazeSize);
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);

    // 테두리 벽 생성
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
    const halfSize = mazeSize / 2;

    const createWall = (x, z, width, depth) => {
      const wallGeometry = new THREE.BoxGeometry(width, wallHeight, depth);
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(x, wallHeight / 2, z);
      this.scene.add(wall);
      this.collidableObjects.push(wall);
    };

    // 상단 벽
    createWall(0, -halfSize + wallThickness / 2, mazeSize, wallThickness);
    // 하단 벽
    createWall(0, halfSize - wallThickness / 2, mazeSize, wallThickness);
    // 왼쪽 벽
    createWall(-halfSize + wallThickness / 2, 0, wallThickness, mazeSize);
    // 오른쪽 벽
    createWall(halfSize - wallThickness / 2, 0, wallThickness, mazeSize);

    console.log("Maze initialized");
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onKeyDown(event) {
    this.keyStates[event.code] = true;
  }

  onKeyUp(event) {
    this.keyStates[event.code] = false;
  }

  checkCollisions() {
    const playerBox = new THREE.Box3().setFromObject(this.player.capsule);

    for (let i = 0; i < this.collidableObjects.length; i++) {
      const wallBox = new THREE.Box3().setFromObject(this.collidableObjects[i]);
      if (playerBox.intersectsBox(wallBox)) {
        console.log("Collision detected");
        return true;
      }
    }
    return false;
  }

  update() {
    if (this.player.capsule) {
      const previousPosition = this.player.capsule.position.clone();

      if (this.keyStates["KeyW"]) {
        this.player.capsule.translateZ(this.speed);
        if (this.checkCollisions()) {
          this.player.capsule.position.copy(previousPosition);
        }
      }
      if (this.keyStates["KeyS"]) {
        this.player.capsule.translateZ(-this.speed);
        if (this.checkCollisions()) {
          this.player.capsule.position.copy(previousPosition);
        }
      }
      if (this.keyStates["KeyA"]) {
        this.player.capsule.rotation.y += this.turnSpeed;
      }
      if (this.keyStates["KeyD"]) {
        this.player.capsule.rotation.y -= this.turnSpeed;
      }

      const playerPosition = new THREE.Vector3();
      this.player.capsule.getWorldPosition(playerPosition);
      this.camera.position.copy(playerPosition);
      this.camera.position.y += 1.5;

      const targetPosition = new THREE.Vector3();
      targetPosition.set(
        playerPosition.x + Math.sin(this.player.capsule.rotation.y),
        playerPosition.y + 1.5,
        playerPosition.z + Math.cos(this.player.capsule.rotation.y)
      );

      this.camera.lookAt(targetPosition);

      // NPC 업데이트
      this.npc.update(playerPosition);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.update();
    this.renderer.render(this.scene, this.camera);
  }
}
