import * as THREE from "https://cdn.skypack.dev/three@0.128.0";
import { Player } from "./player.js";
import { NPC } from "./npc.js";
import { createBasicMaze } from "./mazeGenerator.js";
import { WallCreator } from "./wallcreator.js";
import { checkmaze } from "./checkmaze.js"; // checkmaze 클래스 import
import { Compass } from "./compass.js";

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
    this.wallMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
    this.wallCreator = new WallCreator(
      this.scene,
      this.collidableObjects,
      this.wallMaterial
    );

    this.player = null;
    this.npc = null;

    this.keyStates = {};
    this.speed = 0.1;
    this.turnSpeed = 0.02;

    this.addLights();
    const mazeSize = 51;
    this.maze = new checkmaze(mazeSize);

    this.targetPosition = new THREE.Vector3(23, 0.5, 23);
    this.compass = new Compass(container);

    this.gameOver = false;

    window.addEventListener("resize", () => this.onWindowResize(), false);
    window.addEventListener("keydown", (event) => this.onKeyDown(event), false);
    window.addEventListener("keyup", (event) => this.onKeyUp(event), false);
    window.addEventListener(
      "click",
      (event) => this.onMouseClick(event),
      false
    );
  }

  init() {
    this.camera.position.set(0, 50, 0); // 위에서 내려다보는 시점
    this.camera.lookAt(0, 1.5, 0);
    this.addMaze();
    this.animate();
  }

  start() {
    this.camera.position.set(-25, 1.5, -25);
    this.camera.lookAt(0, 1.5, 0);
    const playerInitialPosition = new THREE.Vector3(-23, 0.5, -23);
    this.player = new Player(this.scene, this.camera, playerInitialPosition);
    this.npc = new NPC(this.scene, this.collidableObjects);
    this.compass.show();
    this.gameOver = false;
  }

  addLights() {
    const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    this.scene.add(light);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(0, 10, 10);
    this.scene.add(directionalLight);
  }

  addMaze() {
    createBasicMaze(
      this.scene,
      this.collidableObjects,
      this.wallMaterial,
      this.maze
    );
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

  onMouseClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.wallCreator.createWallAtClick(mouse, this.camera, (x, z) => {
      const gridX = Math.floor(x + this.maze.size / 2);
      const gridZ = Math.floor(z + this.maze.size / 2);
      if (
        gridX >= 0 &&
        gridX < this.maze.size &&
        gridZ >= 0 &&
        gridZ < this.maze.size
      ) {
        if (this.maze.canPlaceWall(gridX, gridZ)) {
          this.maze.addWall(gridX, gridZ); // 행렬에 벽 추가
          this.wallCreator.createWall(x, z); // 실제 좌표에 블록 추가
          this.maze.print(); // 현재 미로 상태 출력

          // 서버에 블록 추가 메시지 전송
          if (this.socket) {
            this.socket.send(JSON.stringify({ x, z, gridX, gridZ }));
          }
        } else {
          console.log(
            `Adding wall at (${gridX}, ${gridZ}) would block the path.`
          );
        }
      } else {
        console.log(`Coordinates (${gridX}, ${gridZ}) are out of bounds`);
      }
    });
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


  checkVictory() {
    const playerPosition = new THREE.Vector3();
    this.player.capsule.getWorldPosition(playerPosition);
    return playerPosition.distanceTo(this.targetPosition) < 1;
  }

  checkGameOver() {
    const playerBox = new THREE.Box3().setFromObject(this.player.capsule);
    const npcBox = new THREE.Box3().setFromObject(this.npc.npc);
    return playerBox.intersectsBox(npcBox);
  }

  displayEndScreen(message) {
    const endScreen = document.createElement("div");
    endScreen.style.position = "absolute";
    endScreen.style.top = "50%";
    endScreen.style.left = "50%";
    endScreen.style.transform = "translate(-50%, -50%)";
    endScreen.style.padding = "20px";
    endScreen.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
    endScreen.style.color = "white";
    endScreen.style.fontSize = "32px";
    endScreen.style.textAlign = "center";
    endScreen.innerText = message;
    document.body.appendChild(endScreen);
  }

  update() {
    if (this.player && this.player.capsule && !this.gameOver) {
      const previousPosition = this.player.capsule.position.clone();

      if (this.keyStates["KeyW"]) {
        this.player.capsule.translateZ(this.speed);
        if (this.checkCollisions()) {
            this.player.capsule.position.copy(previousPosition);
            this.player.capsule.translateZ(-this.speed * 0.1); // 뒤로 약간 이동
        }
      }
      if (this.keyStates["KeyS"]) {
        this.player.capsule.translateZ(-this.speed);
        if (this.checkCollisions()) {
            this.player.capsule.position.copy(previousPosition);
            this.player.capsule.translateZ(this.speed * 0.1); // 앞으로 약간 이동
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
      this.npc.update(playerPosition);

      if (this.checkVictory()) {
        this.gameOver = true;
        this.displayEndScreen("Victory!");
        this.compass.hide();
      } else if (this.checkGameOver()) {
        this.gameOver = true;
        this.displayEndScreen("Game Over");
        this.compass.hide();
      }
      this.compass.update(
        playerPosition,
        this.player.capsule.rotation,
        new THREE.Vector3(23, 1.5, 23)
      ); // 도착 지점 위치
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.update();
    this.renderer.render(this.scene, this.camera);
  }

  // 웹소켓 설정 메서드 추가
  setSocket(socket) {
    this.socket = socket;

    // 서버로부터 메시지를 수신하면 블록을 추가
    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      this.maze.addWall(data.gridX, data.gridZ);
      this.wallCreator.createWall(data.x, data.z);
    });
  }
}
