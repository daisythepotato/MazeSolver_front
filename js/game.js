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

        this.player = null;
        this.npc = null;

        this.keyStates = {};
        this.speed = 0.1;
        this.turnSpeed = 0.02;

        this.addLights();

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
        // 1인칭 시점으로 전환
        //this.camera.position.set(-23, 1.5, -23);
        //this.camera.lookAt(0, 1.5, 0);

        this.camera.position.set(0, 50, 0); // 위에서 내려다보는 시점
        this.camera.lookAt(0, 3.5, 0);
        // 플레이어와 NPC 생성
        const playerInitialPosition = new THREE.Vector3(-23, 0.5, -23);
        this.player = new Player(this.scene, this.camera, playerInitialPosition);
        this.npc = new NPC(this.scene, this.collidableObjects);

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
        if (document.getElementById('startButton').style.display !== 'none') {
            // 게임 시작 전 클릭으로 벽 생성
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            this.wallCreator.createWallAtClick(mouse, this.camera);
        }
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
        const targetPosition = new THREE.Vector3(23, 0.5, 23); // 목표 위치 설정
        const playerPosition = new THREE.Vector3();
        this.player.capsule.getWorldPosition(playerPosition);
        return playerPosition.distanceTo(targetPosition) < 1;
    }

    checkGameOver() {
        const playerBox = new THREE.Box3().setFromObject(this.player.capsule);
        const npcBox = new THREE.Box3().setFromObject(this.npc.npc);
        return playerBox.intersectsBox(npcBox);
    }

    displayEndScreen(message) {
        const endScreen = document.createElement('div');
        endScreen.style.position = 'absolute';
        endScreen.style.top = '50%';
        endScreen.style.left = '50%';
        endScreen.style.transform = 'translate(-50%, -50%)';
        endScreen.style.padding = '20px';
        endScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
        endScreen.style.color = 'white';
        endScreen.style.fontSize = '32px';
        endScreen.style.textAlign = 'center';
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
            //this.camera.position.copy(playerPosition);
            //this.camera.position.y += 1.5;

            const targetPosition = new THREE.Vector3();
            targetPosition.set(
                playerPosition.x + Math.sin(this.player.capsule.rotation.y),
                playerPosition.y + 1.5,
                playerPosition.z + Math.cos(this.player.capsule.rotation.y)
            );

            //this.camera.lookAt(targetPosition);

            this.npc.update(playerPosition);

            if (this.checkVictory()) {
                this.gameOver = true;
                this.displayEndScreen("Victory!");
            } else if (this.checkGameOver()) {
                this.gameOver = true;
                this.displayEndScreen("Game Over");
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.renderer.render(this.scene, this.camera);
    }
}
