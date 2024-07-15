import * as THREE from "https://cdn.skypack.dev/three@0.128.0";
import { Player } from "./player.js";
import { NPC } from "./npc.js";
import { createBasicMaze } from "./mazegenerator.js";
import { WallCreator } from "./wallcreator.js";

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
    window.addEventListener(
      "click",
      (event) => this.onMouseClick(event),
      false
    );
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
    createBasicMaze(this.scene, this.collidableObjects, this.wallMaterial);
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
    this.wallCreator.createWallAtClick(mouse, this.camera);
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

      this.npc.update(playerPosition);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.update();
    this.renderer.render(this.scene, this.camera);
  }
}
