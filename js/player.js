import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';

export class Player {
    constructor(scene, camera, startPosition) {
        this.scene = scene;
        this.camera = camera;

        this.capsule = this.createPlayer();
        this.capsule.position.set(startPosition.x, startPosition.y, startPosition.z);
        this.scene.add(this.capsule);
    }

    createPlayer() {
        const radius = 0.5;
        const cylinderHeight = 2;

        const topSphereGeometry = new THREE.SphereGeometry(radius, 8, 8);
        topSphereGeometry.translate(0, cylinderHeight / 2, 0);

        const bottomSphereGeometry = new THREE.SphereGeometry(radius, 8, 8);
        bottomSphereGeometry.translate(0, -cylinderHeight / 2, 0);

        const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, cylinderHeight, 8);

        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        const topSphere = new THREE.Mesh(topSphereGeometry, material);
        const bottomSphere = new THREE.Mesh(bottomSphereGeometry, material);
        const cylinder = new THREE.Mesh(cylinderGeometry, material);

        const capsule = new THREE.Group();
        capsule.add(topSphere);
        capsule.add(bottomSphere);
        capsule.add(cylinder);

        return capsule;
    }
}
