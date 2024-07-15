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
    const geometry = new THREE.SphereGeometry(
      radius,
      widthSegments,
      heightSegments
    );
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
    const direction = new THREE.Vector3()
      .subVectors(targetPosition, this.npc.position)
      .normalize();
    const speed = 0.02; // NPC 이동 속도

    const previousPosition = this.npc.position.clone();
    this.npc.position.add(direction.multiplyScalar(speed));

    const bufferDistance = 0.05;
    if (
      this.checkCollisions() ||
      this.npc.position.distanceTo(targetPosition) < bufferDistance
    ) {
      this.npc.position.copy(previousPosition);
    }
  }
}
