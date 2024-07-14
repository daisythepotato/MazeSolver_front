import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import { Player } from './player.js';
import { generateMaze } from './mazeGenerator.js';

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

        this.player = null;

        this.collidableObjects = [];
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
        this.createMaze();
        this.createPlayer();
    }

    addLights() {
        const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
        this.scene.add(light);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(0, 10, 10);
        this.scene.add(directionalLight);
    }

    createMaze() {
        const mazeSize = 11;
        const maze = generateMaze(mazeSize, mazeSize);

        const wallHeight = 10;
        const wallThickness = 1;
        const scale = 10;

        const wallGeometry = new THREE.BoxGeometry(scale, wallHeight, wallThickness);
        const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });

        /*
        for (let i = 0; i < maze.length; i++) {
            for (let j = 0; j < maze[i].length; j++) {
                if (maze[i][j] === 1) {
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                    wall.position.set(i * scale, wallHeight / 2, j * scale);
                    this.scene.add(wall);
                    this.collidableObjects.push(wall);
                }
            }
        }
        */
       
        const boundaryThickness = 1;
        const boundaryHeight = 10;
        const boundaryLength = maze.length * scale;

        const boundaryGeometry = new THREE.BoxGeometry(boundaryLength, boundaryHeight, boundaryThickness);
        const boundaryMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });

        const topBoundary = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
        topBoundary.position.set(boundaryLength / 2 - scale / 2, boundaryHeight / 2, -scale / 2);
        this.scene.add(topBoundary);
        this.collidableObjects.push(topBoundary);

        const bottomBoundary = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
        bottomBoundary.position.set(boundaryLength / 2 - scale / 2, boundaryHeight / 2, maze.length * scale - scale / 2);
        this.scene.add(bottomBoundary);
        this.collidableObjects.push(bottomBoundary);

        const sideBoundaryGeometry = new THREE.BoxGeometry(boundaryThickness, boundaryHeight, boundaryLength);

        const leftBoundary = new THREE.Mesh(sideBoundaryGeometry, boundaryMaterial);
        leftBoundary.position.set(-scale / 2, boundaryHeight / 2, boundaryLength / 2 - scale / 2);
        this.scene.add(leftBoundary);
        this.collidableObjects.push(leftBoundary);

        const rightBoundary = new THREE.Mesh(sideBoundaryGeometry, boundaryMaterial);
        rightBoundary.position.set(maze.length * scale - scale / 2, boundaryHeight / 2, boundaryLength / 2 - scale / 2);
        this.scene.add(rightBoundary);
        this.collidableObjects.push(rightBoundary);

        console.log('Maze initialized');
    }

    createPlayer() {
        const playerStartPosition = { x: 1, y: 0.5, z: 1 }; // 시작 위치 설정 (임의의 값)
        this.player = new Player(this.scene, this.camera, playerStartPosition);
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
                console.log('Collision detected');
                return true;
            }
        }
        return false;
    }

    update() {
        if (this.player.capsule) {
            const previousPosition = this.player.capsule.position.clone();
            const previousRotation = this.player.capsule.rotation.clone();

            let moved = false;

            if (this.keyStates['KeyW']) {
                this.player.capsule.translateZ(this.speed);
                moved = true;
                if (this.checkCollisions()) {
                    this.player.capsule.position.copy(previousPosition);
                }
            }
            if (this.keyStates['KeyS']) {
                this.player.capsule.translateZ(-this.speed);
                moved = true;
                if (this.checkCollisions()) {
                    this.player.capsule.position.copy(previousPosition);
                }
            }
            if (this.keyStates['KeyA']) {
                this.player.capsule.rotation.y += this.turnSpeed;
            }
            if (this.keyStates['KeyD']) {
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
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.renderer.render(this.scene, this.camera);
    }
}
