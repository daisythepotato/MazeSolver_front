import * as THREE from "https://cdn.skypack.dev/three@0.128.0";

export class Player {
    constructor(scene, camera, initialPosition) {
        this.scene = scene;
        this.camera = camera;
        this.capsule = this.createPlayer();
        this.capsule.position.copy(initialPosition);
        this.scene.add(this.capsule);
    }

    createPlayer() {
        const radius = 0.1;
        const height = 0.5; // 플레이어의 높이
        const radialSegments = 16;
        
        // 위쪽 반구
        const topSphereGeometry = new THREE.SphereGeometry(radius, radialSegments, radialSegments);
        const topSphereMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const topSphere = new THREE.Mesh(topSphereGeometry, topSphereMaterial);
        topSphere.position.y = height / 2;

        // 아래쪽 반구
        const bottomSphereGeometry = new THREE.SphereGeometry(radius, radialSegments, radialSegments);
        const bottomSphereMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const bottomSphere = new THREE.Mesh(bottomSphereGeometry, bottomSphereMaterial);
        bottomSphere.position.y = -height / 2;

        // 원통형 몸체
        const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, height, radialSegments);
        const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

        // 캡슐 형태로 결합
        const capsule = new THREE.Group();
        capsule.add(topSphere);
        capsule.add(bottomSphere);
        capsule.add(cylinder);

        return capsule;
    }
}
