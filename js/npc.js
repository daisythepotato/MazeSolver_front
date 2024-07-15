import * as THREE from "https://cdn.skypack.dev/three@0.128.0";

export class NPC {
    constructor(scene, collidableObjects) {
        this.scene = scene;
        this.collidableObjects = collidableObjects;
        this.npc = this.createNPC();
        this.scene.add(this.npc);
    }

    createNPC() {
        const radius = 0.5;
        const widthSegments = 16;
        const heightSegments = 16;
        const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(0, radius, 0); // 초기 위치 설정
        return sphere;
    }

    checkCollisions() {
        const npcBox = new THREE.Box3().setFromObject(this.npc);
        for (let i = 0; i < this.collidableObjects.length; i++) {
            const wallBox = new THREE.Box3().setFromObject(this.collidableObjects[i]);
            if (npcBox.intersectsBox(wallBox)) {
                return true;
            }
        }
        return false;
    }

    update(targetPosition) {
        const direction = new THREE.Vector3().subVectors(targetPosition, this.npc.position).normalize();
        const speed = 0.02; // NPC 이동 속도

        const previousPosition = this.npc.position.clone();
        this.npc.position.add(direction.multiplyScalar(speed));

        if (this.checkCollisions()) {
            this.npc.position.copy(previousPosition); // 충돌 시 이전 위치로 되돌림
            this.findPath(targetPosition); // 장애물을 피하는 방법 추가
        }
    }

    findPath(targetPosition) {
        const directions = [
            new THREE.Vector3(1, 0, 0), // 오른쪽
            new THREE.Vector3(-1, 0, 0), // 왼쪽
            new THREE.Vector3(0, 0, 1), // 아래
            new THREE.Vector3(0, 0, -1) // 위
        ];

        const currentPosition = this.npc.position.clone();
        let foundPath = false;

        for (let i = 0; i < directions.length; i++) {
            const newDirection = directions[i];
            const newPosition = currentPosition.clone().add(newDirection.multiplyScalar(0.1));
            this.npc.position.copy(newPosition);
            if (!this.checkCollisions()) {
                foundPath = true;
                break; // 충돌이 없는 방향을 찾으면 이동
            }
        }

        if (!foundPath) {
            this.npc.position.copy(currentPosition); // 경로를 찾지 못하면 원래 위치로 되돌림
        }
    }
}
